
import os
import json
import sqlite3
import random
import re
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='.')
CORS(app)

# Configure Gemini
genai.configure(api_key=os.environ.get('API_KEY'))
model = genai.GenerativeModel('gemini-3-flash-preview')

# Path to the dataset
INTENTS_FILE = 'intents.json'

def load_intents():
    """Loads the intents from the external JSON file."""
    try:
        with open(INTENTS_FILE, 'r') as file:
            return json.load(file)
    except Exception as e:
        print(f"Error loading intents file: {e}")
        return {"intents": []}

# Load the data once at startup
INTENTS_DATA = load_intents()

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

def find_intent_response(user_text):
    """
    Scans the loaded intents for a pattern match using Regex.
    """
    text = user_text.lower().strip()
    for intent in INTENTS_DATA.get('intents', []):
        for pattern in intent['patterns']:
            # Word boundary check to avoid partial matches
            if re.search(r'\b' + re.escape(pattern.lower()) + r'\b', text):
                return random.choice(intent['responses'])
    return None

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        messages = data.get('messages', [])
        user_input = data.get('input', '')

        # 1. First check the local intents dataset
        intent_response = find_intent_response(user_input)
        
        if intent_response:
            return jsonify({"text": intent_response, "source": "dataset"})

        # 2. If no intent found, use Gemini as fallback
        history = []
        for msg in messages:
            role = "user" if msg['role'] == 'user' else "model"
            history.append({"role": role, "parts": [msg['text']]})
        
        system_instruction = (
            "You are Pandora, an empathetic AI Therapeutic Assistant. "
            "Speak kindly, stay supportive, and help the user manage their mental wellbeing. "
            "If they ask who you are, say you are Pandora. "
            "If they express self-harm, immediately suggest professional help."
        )
        
        chat_session = model.start_chat(history=history)
        response = chat_session.send_message(f"System: {system_instruction}\nUser: {user_input}")
        
        return jsonify({"text": response.text, "source": "ai"})
        
    except Exception as e:
        print(f"Chat API Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/mood', methods=['GET', 'POST'])
def mood():
    conn = sqlite3.connect('mindcare.db')
    cursor = conn.cursor()
    if request.method == 'POST':
        data = request.json
        cursor.execute('INSERT INTO mood_logs (user_id, score, label) VALUES (?, ?, ?)',
                       (data.get('user_id', 'Alex'), data.get('score'), data.get('label')))
        conn.commit()
        conn.close()
        return jsonify({"status": "success"})
    else:
        cursor.execute('SELECT score, label, timestamp FROM mood_logs ORDER BY timestamp DESC LIMIT 7')
        rows = cursor.fetchall()
        conn.close()
        history = [{"score": r[0], "label": r[1], "day": r[2][5:10]} for r in rows]
        return jsonify(history[::-1])

@app.route('/api/analyze-emotion', methods=['POST'])
def analyze_emotion():
    try:
        data = request.json
        image_b64 = data.get('image')
        prompt = "Analyze the person's facial expression and estimate their emotion, confidence, stress level (0-100), and a short piece of empathetic advice. Return ONLY a JSON object."
        response = model.generate_content([
            prompt, 
            {"inlineData": {"mimeType": "image/jpeg", "data": image_b64}}
        ])
        clean_text = response.text.strip().replace('```json', '').replace('```', '')
        return jsonify(json.loads(clean_text))
    except Exception as e:
        print(f"Emotion Analysis Error: {e}")
        return jsonify({
            "emotion": "Neutral", 
            "confidence": 0.5, 
            "stressLevel": 50, 
            "advice": "I'm having trouble seeing clearly. Could you adjust your lighting?"
        })

if __name__ == '__main__':
    # Local host on port 5000 for local machine access
    app.run(host='0.0.0.0', port=5000, debug=True)
