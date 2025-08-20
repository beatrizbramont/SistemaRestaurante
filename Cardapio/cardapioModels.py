from flask import jsonify
# Depois atrelar a pedido
from config import db
from datetime import datetime, date

class Comida(db.Model):
    __tablename__ = 'Aluno'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100))
    idade = db.Column(db.Integer)
    data_nascimento = db.Column(db.Date)
    nota_primeiro_semestre = db.Column(db.Float)
    nota_segundo_semestre = db.Column(db.Float)
    media_final = db.Column(db.Float)
    turma_id = db.Column(db.Integer, db.ForeignKey('Turma.id'), nullable=False)

    turma = db.relationship('Turma', backref='Aluno')

    def __init__(self, nome, data_nascimento, nota_primeiro_semestre, nota_segundo_semestre, turma_id):
        self.nome = nome
        self.data_nascimento = data_nascimento
        self.idade = self.calcular_idade()
        self.nota_primeiro_semestre = nota_primeiro_semestre
        self.nota_segundo_semestre = nota_segundo_semestre
        self.media_final = self.calcular_media()
        self.turma_id = turma_id

    def calcular_idade(self):
        hoje = date.today()
        if self.data_nascimento:
            idade = hoje.year - self.data_nascimento.year - ((hoje.month, hoje.day) < (self.data_nascimento.month, self.data_nascimento.day))
            return idade
        return None
    
    def calcular_media(self):
        soma_notas = self.nota_primeiro_semestre + self.nota_segundo_semestre
        media = soma_notas / 2
        return media

    
    
    def to_dict(self):
        return {'id': self.id,
                'nome': self.nome,
                'idade': self.idade,
                'data_nascimento': self.data_nascimento,
                'nota_primeiro_semestre': self.nota_primeiro_semestre,
                'nota_segundo_semestre': self.nota_segundo_semestre,
                'media_final': self.media_final,
                'turma_id': self.turma_id}

# def verificar_duplicacao(id):
#     if Aluno.query.get(id):
#         return jsonify({"error": f"Aluno com ID {id} já existe."}), 200
#     return None

def verificar_campo_null(dados):
    for chave, valor in dados.items():
        if valor == None:
            return jsonify({"error": f"O campo {chave} informado é obrigatório."}), 400
    return None

# Create
def createAluno(dados):    
    vazio = verificar_campo_null(dados)
    if vazio:
        return vazio

    turma_existente = turmaPorID(dados['turma_id'])
    if not turma_existente:
        return jsonify({"error": "Turma não existe"}), 404

    # duplicacao = verificar_duplicacao(dados)
    # if duplicacao:
    #     return duplicacao

    novo_aluno = Aluno(
        nome=dados['nome'],
        data_nascimento=datetime.strptime(dados['data_nascimento'], "%d/%m/%Y").date(),
        nota_primeiro_semestre=dados['nota_primeiro_semestre'],
        nota_segundo_semestre=dados['nota_segundo_semestre'],
        turma_id=dados['turma_id']
    )

    db.session.add(novo_aluno)
    db.session.commit()
    

    return jsonify(novo_aluno.to_dict()), 200

# Get      
def todosAlunos():
    alunos = Aluno.query.all()
    return jsonify([aluno.to_dict() for aluno in alunos])
    
def alunoPorID(idAluno):
    aluno = Aluno.query.get(idAluno)
    if aluno:
        return jsonify(aluno.to_dict())
    return jsonify({"error": "Aluno não encontrado"})

# Put
def updateAluno(idAluno, dados):
    vazio = verificar_campo_null(dados)
    if vazio:
        return vazio, 400

    aluno = Aluno.query.get(idAluno)
    if not aluno:
        return jsonify({"error": "Aluno não encontrado"}), 404

    for chave, valor in dados.items():
        if hasattr(aluno, chave):
            if chave == 'data_nascimento' and isinstance(valor, str):
                try:
                    valor = datetime.strptime(valor, "%d/%m/%Y").date()
                except ValueError:
                    return jsonify({"error": "Formato de data inválido. Use DD/MM/AAAA"}), 400
        setattr(aluno, chave, valor)
        if chave == 'data_nascimento':
            aluno.idade = aluno.calcular_idade()
        if chave == 'nota_primeiro_semestre' or 'nota_segundo_semestre':
            aluno.media_final = aluno.calcular_media()
        
    

    db.session.commit()
    return jsonify(aluno.to_dict()), 200

# Delete

def deleteAluno(idAluno):
    aluno = Aluno.query.get(idAluno)
    if not aluno:
        return jsonify({"error": "Aluno não encontrado"}), 400

    db.session.delete(aluno)
    db.session.commit()
    return jsonify({"message": "Aluno deletado com sucesso"}), 200
    
            
    