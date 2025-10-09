import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from flask import jsonify
from config import db
import datetime

class FilaEspera(db.Model):
    __tablename__ = "espera"
    id = db.Column(db.Integer, primary_key=True)
    pessoas = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow) 

    def __repr__(self):
        return f'<FilaEspera {self.id}>'