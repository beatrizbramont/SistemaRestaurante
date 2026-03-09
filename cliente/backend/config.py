import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from urllib.parse import quote_plus
from flask_jwt_extended import JWTManager

load_dotenv()

app = Flask(__name__)

app.config['SECRET_KEY'] = 'w3nd3r_t3st3_123!@#'
app.config['UPLOAD_FOLDER'] = 'static/uploads'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

app.config['HOST'] = '0.0.0.0'
app.config['PORT'] = 8002
app.config['DEBUG'] = True

DATABASE_URL = os.getenv("DATABASE_URL")

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

jwt = JWTManager(app)
