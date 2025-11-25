from flask import Blueprint, render_template
from Auth.forms import LoginForm   

index_bp = Blueprint('index', __name__)

@index_bp.route('/')
def index():
    form = LoginForm()
    return render_template('login.html', form=form)

@index_bp.route('/dashboard')
def dashboard():
    return render_template('index.html')