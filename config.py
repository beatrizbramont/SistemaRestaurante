import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

app = Flask(__name__)

db_user = os.getenv("DB_USER")
db_pass = urllib.parse.quote_plus(os.getenv("DB_PASS"))
db_host = os.getenv("DB_HOST")
db_name = os.getenv("DB_NAME")

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{db_user}:{db_pass}@{db_host}/{db_name}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
