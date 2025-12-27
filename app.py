"""
Flask Application for RideX - Smart Transportation System
"""
from flask import Flask, render_template
from flask_cors import CORS
from api import api_bp

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend integration

# Register API blueprint
app.register_blueprint(api_bp, url_prefix='/api')

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000, use_reloader=False)
