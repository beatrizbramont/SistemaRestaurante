from config import db

class Funcionario(db.Model):
    _tablename_ = 'funcionarios'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    cargo = db.Column(db.String(50), nullable=False)
    telefone = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha = db.Column(db.String(150), nullable=False)
    imagem = db.Column(db.String(255))


    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "cargo": self.cargo,
            "telefone": self.telefone,
            "email": self.email,
            "senha": self.senha,
            "imagem": self.imagem
}