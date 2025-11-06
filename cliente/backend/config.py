import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from urllib.parse import quote_plus
from flask_jwt_extended import JWTManager

load_dotenv()

app = Flask(__name__)

db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASSWORD")
db_host = os.getenv("DB_HOST")
db_name = os.getenv("DB_NAME")
db_pass_encoded = quote_plus(db_pass)

app.config['HOST'] = '0.0.0.0'
app.config['PORT'] = 8002
app.config['DEBUG'] = True

app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{db_user}:{db_pass_encoded}@{db_host}/{db_name}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "chave_super_secreta")  
app.config["JWT_TOKEN_LOCATION"] = ["headers"]  
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 3600  

db = SQLAlchemy(app)

jwt = JWTManager(app)
