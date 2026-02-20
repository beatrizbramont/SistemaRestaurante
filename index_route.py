from flask import Blueprint, render_template, session, redirect, url_for

index_bp = Blueprint('index', __name__)

@index_bp.route('/')
def index():
    return render_template('splash.html')

@index_bp.route('/dashboard')
def dashboard():
    return render_template('index.html')
