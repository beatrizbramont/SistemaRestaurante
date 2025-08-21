import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['HOST'] = '0.0.0.0'
app.config['PORT']= 8001 
app.config['DEBUG'] = True

app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:BIsa0322%400405@localhost/restaurante"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# mysql://<username>:<password>@<host>/<db_name> - Perguntar!
#senha: BIsa0322@0405 - substituí o @ por %040 que é a codificação para o @, pois estava sendo interpretado de forma incorreta.

db = SQLAlchemy(app)

# Criar .env para as senhas.