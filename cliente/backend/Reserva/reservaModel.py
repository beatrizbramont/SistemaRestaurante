from datetime import datetime
from config import db

class Reserva(db.Model):
    __tablename__ = "reservas"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, nullable=False)
    mesas = db.Column(db.String(255), nullable=False)
    capacidade = db.Column(db.Integer, nullable=False)
    data_reserva = db.Column(db.DateTime, nullable=False)  
    status = db.Column(db.String(50), default="reservada")
