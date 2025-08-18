from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config['HOST'] = '0.0.0.0'
app.config['PORT']= 8001 
app.config['DEBUG'] = True

app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:ZTGLRCLQDkLxeFadnWNbLUoLNhhbkLfU@caboose.proxy.rlwy.net:17980/railway"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

