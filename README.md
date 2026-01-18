
# 🧠 MindCare AI – Full Stack ML Platform

MindCare AI uses a Python Flask backend to run a **TF-IDF + Cosine Similarity** machine learning algorithm for real-time therapy intent classification.

## 🚀 How to Run Locally

### 1. Install Python Dependencies
You now need `scikit-learn` for the chatbot's ML algorithm:
```bash
pip install flask flask-cors google-generativeai python-dotenv scikit-learn numpy
```

### 2. Set your API Key
The backend handles the Gemini API securely.
```bash
export API_KEY="your_gemini_key_here"
```

### 3. Start the Server
```bash
python main.py
```

## 🤖 The ML Algorithm
The chatbot uses **Natural Language Processing (NLP)**:
1.  **Tokenization**: Breaking user sentences into individual words.
2.  **TF-IDF (Term Frequency-Inverse Document Frequency)**: A statistical measure used to evaluate how important a word is to a document in a collection.
3.  **Cosine Similarity**: Measures the similarity between the user input vector and the patterns defined in `intents.json`.

If the similarity score is above **0.3**, Pandora uses the local dataset. Otherwise, it delegates the reasoning to Gemini AI.

---
© 2024 MindCare AI Team
