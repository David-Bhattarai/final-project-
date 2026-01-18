
import os
import json
import sqlite3
import random
import re
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Machine Learning Imports
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai

load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)

# --- AI CONFIGURATION ---
# Using the model recommended for high-quality text and reasoning
API_KEY = os.environ.get('API_KEY')
genai.configure(api_key=API_KEY)
gemini_model = genai.GenerativeModel('gemini-3-flash-preview')
INTENTS_FILE = 'intents.json'

# --- DATABASE INITIALIZATION ---
def init_db():
    conn = sqlite3.connect('mindcare.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS mood_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            score INTEGER,
            label TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# --- MACHINE LEARNING (NLP) CORE ---
class PandoraML:
    def __init__(self, intents_path):
        self.vectorizer = TfidfVectorizer(tokenizer=self.simple_tokenizer, stop_words='english', token_pattern=None)
        self.intents_data = self.load_data(intents_path)
        self.patterns = []
        self.tags = []
        self.responses = {}
        self.train()

    def load_data(self, path):
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Dataset Load Error: {e}")
            return {"intents": []}

    def simple_tokenizer(self, text):
        # Basic cleanup and tokenization
        return re.findall(r'\w+', text.lower())

    def train(self):
        if not self.intents_data.get('intents'):
            print("No intents found to train.")
            return

        for intent in self.intents_data['intents']:
            tag = intent['tag']
            self.responses[tag] = intent['responses']
            for pattern in intent['patterns']:
                self.patterns.append(pattern)
                self.tags.append(tag)
        
        if self.patterns:
            self.tfidf_matrix = self.vectorizer.fit_transform(self.patterns)

    def classify(self, user_input):
        if not self.patterns or not user_input or not hasattr(self, 'tfidf_matrix'):
            return None, 0.0
        
        # Transform user input into the same vector space
        user_vector = self.vectorizer.transform([user_input])
        
        # Calculate Cosine Similarity
        similarities = cosine_similarity(user_vector, self.tfidf_matrix).flatten()
        best_match_idx = np.argmax(similarities)
        max_score = similarities[best_match_idx]
        
        # Confidence threshold
        if max_score > 0.38:
            tag = self.tags[best_match_idx]
            return random.choice(self.responses[tag]), float(max_score)
        
        return None, float(max_score)

# Initialize the ML Engine
ml_engine = PandoraML(INTENTS_FILE)

# --- API ROUTES ---

@app.route('/api/chat', methods=['POST'])
def chat_endpoint():
    try:
        data = request.json
        user_input = data.get('input', '')
        history = data.get('messages', [])

        # Step 1: Check Local ML Dataset
        ml_res, confidence = ml_engine.classify(user_input)
        if ml_res:
            return jsonify({
                "text": ml_res,
                "source": "dataset",
                "confidence": confidence
            })

        # Step 2: Fallback to Gemini 3 Flash
        gemini_history = []
        for msg in history:
            gemini_history.append({
                "role": "user" if msg['role'] == 'user' else "model",
                "parts": [msg['text']]
            })
        
        system_instruction = (
            "You are Pandora, an empathetic AI therapist. "
            "Acknowledge the user's feelings with warmth. "
            "Use active listening and brief, supportive counseling techniques."
        )
        
        chat = gemini_model.start_chat(history=gemini_history)
        response = chat.send_message(f"System: {system_instruction}\nUser: {user_input}")
        
        return jsonify({
            "text": response.text,
            "source": "ai",
            "confidence": 1.0
            })
    except Exception as e:
        print(f"Chat Error: {e}")
        return jsonify({"text": "I'm having a brief moment of static. Can you say that again?", "source": "error"}), 500

@app.route('/api/mood', methods=['GET', 'POST'])
def mood_endpoint():
    conn = sqlite3.connect('mindcare.db')
    cursor = conn.cursor()
    if request.method == 'POST':
        data = request.json
        cursor.execute('INSERT INTO mood_logs (user_id, score, label) VALUES (?, ?, ?)',
                       (data.get('user_id', 'Alex'), data.get('score'), data.get('label')))
        conn.commit()
        conn.close()
        return jsonify({"status": "saved"})
    else:
        cursor.execute('SELECT score, label, timestamp FROM mood_logs ORDER BY timestamp DESC LIMIT 7')
        rows = cursor.fetchall()
        conn.close()
        return jsonify([{"score": r[0], "label": r[1], "day": r[2][5:10]} for r in rows][::-1])

@app.route('/api/analyze-emotion', methods=['POST'])
def vision_endpoint():
    try:
        data = request.json
        image_b64 = data.get('image')
        # Using Gemini 3 Flash for fast vision analysis
        prompt = "Analyze the facial expression. Return JSON: {emotion: string, confidence: float, stressLevel: int (0-100), advice: string}."
        
        response = gemini_model.generate_content([
            prompt,
            {"inlineData": {"mimeType": "image/jpeg", "data": image_b64}}
        ])
        
        clean_json = response.text.replace('```json', '').replace('```', '').strip()
        return jsonify(json.loads(clean_json))
    except Exception as e:
        print(f"Vision Error: {e}")
        return jsonify({"emotion": "Neutral", "confidence": 0.5, "stressLevel": 50, "advice": "Please adjust your lighting."})

# Static File Routing
@app.route('/')
def index(): return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_proxy(path): return send_from_directory('.', path)

if __name__ == '__main__':
    print("MindCare AI: Full-Stack ML Backend Active on Port 5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
