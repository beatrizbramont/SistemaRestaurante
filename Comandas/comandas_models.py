from config import db
from datetime import datetime

class Comanda(db.Model):
    __tablename__ = "comanda"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(100), nullable=True)
    aberta = db.Column(db.Boolean, default=True)
    data_abertura = db.Column(db.DateTime, default=datetime.utcnow)
    data_fechamento = db.Column(db.DateTime, nullable=True)

    mesa_id = db.Column(db.Integer, db.ForeignKey('mesas.id'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "aberta": self.aberta,
            "data_abertura": self.data_abertura.isoformat() if self.data_abertura else None,
            "data_fechamento": self.data_fechamento.isoformat() if self.data_fechamento else None,
            "mesa_id": self.mesa_id

        }
    
class ComandaHistorico(db.Model):
    __tablename__ = 'comanda_historico'

    id = db.Column(db.Integer, primary_key=True)
    mesa_id = db.Column(db.Integer, nullable=False)
    nome = db.Column(db.String(100))
    data_fechamento = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<ComandaHistorico {self.id}>'