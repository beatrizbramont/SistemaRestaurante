import os
from flask import Blueprint, send_from_directory

frontend_bp = Blueprint('frontend', __name__)

# Caminho absoluto para a pasta "frontend"
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FRONTEND_DIR = os.path.join(BASE_DIR, 'cliente', 'frontend')

HTML_DIR = os.path.join(FRONTEND_DIR, 'html')
CSS_DIR = os.path.join(FRONTEND_DIR, 'css')
JS_DIR = os.path.join(FRONTEND_DIR, 'js')

@frontend_bp.route('/')
def index():
    return send_from_directory(HTML_DIR, 'quantidadeMesas.html')

@frontend_bp.route('/html/<path:filename>')
def html_pages(filename):
    return send_from_directory(HTML_DIR, filename)

@frontend_bp.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory(CSS_DIR, filename)

@frontend_bp.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory(JS_DIR, filename)
