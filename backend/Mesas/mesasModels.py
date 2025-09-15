
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from flask import jsonify
from datetime import datetime
from Comandas.comandasModels import Comanda
from config import db

class Status(db.Model):
    __tablename__ = "status"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(20), nullable=False, unique=True)

    mesas = db.relationship("Mesas", backref="status", lazy=True)

    def to_dict(self):
        return {"id": self.id, "nome": self.nome}
    
class Mesas(db.Model):
    __tablename__ = "mesas"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    numero = db.Column(db.Integer, nullable=False, unique=True) 
    capacidade = db.Column(db.Integer, nullable=False)  
    status_id = db.Column(db.Integer, db.ForeignKey("status.id"), nullable=False)
    
    comandas = db.relationship("Comanda", backref="mesa", lazy=True)

    @property
    def comanda_aberta(self):
        return next((c for c in self.comandas if c.aberta), None)
    
    @property
    def status_nome(self):
        return self.status.nome if self.status else None   # <--- Aqui

    def to_dict(self):
        return {
            "id": self.id,
            "numero": self.numero,
            "capacidade": self.capacidade,
            "status": self.status_nome,   # <--- Aqui
            "comanda_aberta": self.comanda_aberta.aberta if self.comanda_aberta else False
        }

