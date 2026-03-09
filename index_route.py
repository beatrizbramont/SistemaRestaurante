from flask import Blueprint, render_template, session, redirect, url_for

index_bp = Blueprint('index', __name__)

@index_bp.route('/')
def splash():
    return render_template('splash.html')

@index_bp.route('/dashboard')
def dashboard():
    if "usuario_id" not in session:
        return redirect(url_for("auth.login"))
    return render_template('index.html')