
import os
import json
import sqlite3
import random
import re
import numpy as np
from flask import Flask, request, jsonify, send_from_directory, session, redirect, url_for
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps

# Machine Learning Imports
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import google.generativeai as genai

load_dotenv()

# --- Advanced Database Class ---
class Database:
    def __init__(self, db_file):
        self.db_file = db_file
        self._init_db()

    def _get_connection(self):
        return sqlite3.connect(self.db_file)

    def _init_db(self):
        conn = self._get_connection()
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
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT,
                password TEXT
            )
        ''')
        
        conn.commit()
        conn.close()

    def create_user(self, user_id, name, password):
        conn = self._get_connection()
        cursor = conn.cursor()
        hashed_password = generate_password_hash(password)
        try:
            cursor.execute(
                'INSERT INTO users (id, name, password) VALUES (?, ?, ?)',
                (user_id, name, hashed_password)
            )
            conn.commit()
        except sqlite3.IntegrityError:
            return False
        finally:
            conn.close()
        return True

    def get_user(self, user_id):
        conn = self._get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        conn.close()
        return user

    def save_mood(self, user_id, score, label):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO mood_logs (user_id, score, label) VALUES (?, ?, ?)',
            (user_id, score, label)
        )
        conn.commit()
        conn.close()

    def get_moods(self, user_id, limit=7):
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute(
            'SELECT score, label, timestamp FROM mood_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?', (user_id, limit)
        )
        rows = cursor.fetchall()
        conn.close()
        return [{"score": r[0], "label": r[1], "day": r[2][5:10]} for r in rows][::-1]

# --- AI & App Configuration ---
app = Flask(__name__, static_folder='.')
app.secret_key = os.urandom(24)
CORS(app)

API_KEY = os.environ.get('API_KEY')
genai.configure(api_key=API_KEY)
gemini_model = genai.GenerativeModel('gemini-pro')
INTENTS_FILE = 'intents.json'

# --- Machine Learning (NLP) Core ---
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
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Dataset Load Error: {e}")
            return {"intents": []}

    def simple_tokenizer(self, text):
        return re.findall(r'\w+', text.lower())

    def train(self):
        if not self.intents_data.get('intents'):
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
        user_vector = self.vectorizer.transform([user_input])
        similarities = cosine_similarity(user_vector, self.tfidf_matrix).flatten()
        best_match_idx = np.argmax(similarities)
        max_score = similarities[best_match_idx]
        if max_score > 0.3:
            tag = self.tags[best_match_idx]
            return random.choice(self.responses[tag]), float(max_score)
        return None, float(max_score)

# --- Initialize Engines ---
ml_engine = PandoraML(INTENTS_FILE)
db = Database('mindcare.db')

# --- Authentication ---
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login_page', next=request.url))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/signup', methods=['GET', 'POST'])
def signup_page():
    if request.method == 'POST':
        user_id = request.form['user_id']
        name = request.form['name']
        password = request.form['password']
        if db.create_user(user_id, name, password):
            return redirect(url_for('login_page'))
        else:
            return 'User ID already exists!', 409
    return send_from_directory('.', 'signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login_page():
    if request.method == 'POST':
        user_id = request.form['user_id']
        password = request.form['password']
        user = db.get_user(user_id)
        if user and check_password_hash(user['password'], password):
            session['user_id'] = user['id']
            next_url = request.args.get('next')
            return redirect(next_url or url_for('index'))
        else:
            return 'Invalid credentials', 401
    return send_from_directory('.', 'login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login_page'))

# --- API ROUTES ---

@app.route('/api/chat', methods=['POST'])
@login_required
def chat_endpoint():
    try:
        data = request.json
        user_input = data.get('input', '')
        history = data.get('messages', [])
        ml_res, confidence = ml_engine.classify(user_input)
        if ml_res:
            return jsonify({"text": ml_res, "source": "dataset", "confidence": confidence})
        gemini_history = []
        for msg in history:
            gemini_history.append({"role": "user" if msg['role'] == 'user' else "model", "parts": [msg['text']]})
        system_instruction = "You are Pandora, an empathetic AI therapist. Acknowledge the user's feelings with warmth. Use active listening and brief, supportive counseling techniques."
        chat = gemini_model.start_chat(history=gemini_history)
        response = chat.send_message(f"System: {system_instruction}\nUser: {user_input}")
        return jsonify({"text": response.text, "source": "ai", "confidence": 1.0})
    except Exception as e:
        print(f"Chat Error: {e}")
        return jsonify({"text": "I'm having a brief moment of static. Can you say that again?", "source": "error"}), 500

@app.route('/api/mood', methods=['GET', 'POST'])
@login_required
def mood_endpoint():
    user_id = session['user_id']
    if request.method == 'POST':
        data = request.json
        db.save_mood(user_id, data.get('score'), data.get('label'))
        return jsonify({"status": "saved"})
    else:
        moods = db.get_moods(user_id, limit=7)
        return jsonify(moods)

@app.route('/api/analyze-emotion', methods=['POST'])
@login_required
def vision_endpoint():
    try:
        data = request.json
        image_b64 = data.get('image')
        prompt = "Analyze the facial expression. Return JSON: {emotion: string, confidence: float, stressLevel: int (0-100), advice: string}."
        response = gemini_model.generate_content([prompt, {"inlineData": {"mimeType": "image/jpeg", "data": image_b64}}])
        clean_json = response.text.replace('```json', '').replace('```', '').strip()
        return jsonify(json.loads(clean_json))
    except Exception as e:
        print(f"Vision Error: {e}")
        return jsonify({"emotion": "Neutral", "confidence": 0.5, "stressLevel": 50, "advice": "Please adjust your lighting."})

# --- Static File Routing ---
@app.route('/')
@login_required
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_proxy(path):
    # Serve login/signup pages regardless of login status
    if path in ['login.html', 'signup.html']:
        return send_from_directory('.', path)
    # For any other path, require login
    if 'user_id' not in session:
        return redirect(url_for('login_page', next=request.path))
    return send_from_directory('.', path)

if __name__ == '__main__':
    print("MindCare AI: Full-Stack ML Backend Active on Port 5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
