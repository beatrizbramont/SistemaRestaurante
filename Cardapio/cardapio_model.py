from config import db

class Cardapio(db.Model):
    __tablename__ = "cardapio"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(100), nullable=False)
    ingredientes = db.Column(db.Text, nullable=False)
    preco = db.Column(db.Float, nullable=False)
    categoria = db.Column(db.String(50), nullable=False)  # prato, bebida, sobremesa
    tempo_preparo = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f"<Item {self.nome} - R${self.preco:.2f}>"
    
    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "ingredientes": self.ingredientes,
            "preco": self.preco,
            "categoria": self.categoria,
            "tempo_preparo": self.tempo_preparo
        }
