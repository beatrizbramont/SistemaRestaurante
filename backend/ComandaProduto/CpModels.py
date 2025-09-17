import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from datetime import datetime
from config import db
from Comandas.comandasModels import Comanda
from Cardapio.cardapioModels import Cardapio

class ComandaProduto(db.Model):
    __tablename__ = "comanda_produto"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    comanda_id = db.Column(db.Integer, db.ForeignKey('comanda.id'), nullable=False)
    produto_id = db.Column(db.Integer, db.ForeignKey('cardapio.id'), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False, default=1)
    data_adicao = db.Column(db.DateTime, default=datetime.utcnow)

    comanda = db.relationship('Comanda', backref=db.backref('itens_comanda', lazy=True))
    produto = db.relationship('Cardapio', backref=db.backref('comandas_associadas', lazy=True))

    def to_dict(self):
        subtotal = self.quantidade * self.produto.preco
        return {
            "id": self.id,
            "produto_id": self.produto_id,
            "nome": self.produto.nome,
            "ingredientes": self.produto.ingredientes,
            "quantidade": self.quantidade,
            "preco_unitario": self.produto.preco,
            "subtotal": subtotal,
            "data_adicao": self.data_adicao.isoformat()
        }

    def __repr__(self):
        return f'<ComandaProduto {self.id}>'