import os
from flask import Blueprint, request, jsonify, send_from_directory

frontend_bp = Blueprint('frontend', __name__)
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend')

@frontend_bp.route('/')
def serve_frontend():
    print(">> INDEX HTML SENDO SERVIDO")
    return send_from_directory(STATIC_DIR, 'index.html')
@frontend_bp.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(STATIC_DIR, filename)