
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from flask import jsonify
from datetime import datetime
from config import db

class Mesas(db.Model):
    __tablename__ = "mesas"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    numero = db.Column(db.Integer, nullable=False, unique=True) 
    capacidade = db.Column(db.Integer, nullable=False)  
    status = db.Column(db.String(20), nullable=False, default='livre')  

    comanda = db.relationship("Comanda", backref="mesa", lazy=True, uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "numero": self.numero,
            "capacidade": self.capacidade,
            "status": self.status,
            "comanda_aberta": self.comanda.aberta if self.comanda and self.comanda.aberta else False
        }


class Comanda(db.Model):
    __tablename__ = "comanda"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    aberta = db.Column(db.Boolean, default=True)
    data_abertura = db.Column(db.DateTime, default=datetime.utcnow)
    data_fechamento = db.Column(db.DateTime, nullable=True)

    mesa_id = db.Column(db.Integer, db.ForeignKey('mesas.id'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "aberta": self.aberta,
            "data_abertura": self.data_abertura.isoformat() if self.data_abertura else None,
            "data_fechamento": self.data_fechamento.isoformat() if self.data_fechamento else None,
            "mesa_id": self.mesa_id
        }