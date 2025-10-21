import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from urllib.parse import quote_plus

TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend')

load_dotenv()

app = Flask(__name__ , template_folder=TEMPLATE_DIR)

app.config['SECRET_KEY'] = 'w3nd3r_t3st3_123!@#'

db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASSWORD")  
db_host = os.getenv("DB_HOST")
db_name = os.getenv("DB_NAME")
db_pass_encoded = quote_plus(db_pass)

app.config['HOST'] = '0.0.0.0'
app.config['PORT'] = 8001 
app.config['DEBUG'] = True

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{db_user}:{db_pass_encoded}@{db_host}/{db_name}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

