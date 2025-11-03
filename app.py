from config import app, db
'''Blueprint - rotas'''
from Funcionario.funcionario_routes import funcionarios_bp
from Cardapio.cardapio_routes import cardapio_bp
from Mesas import seed_mesas, seed_status
from Mesas.mesas_routes import mesa_bp
from Comandas.comandas_routes import comandas_bp
from ComandaProduto.cp_routes import cp_bp
from index_route import index_bp
from flask_wtf import CSRFProtect

app.register_blueprint(index_bp) 

app.register_blueprint(cardapio_bp) 
app.register_blueprint(funcionarios_bp)
app.register_blueprint(mesa_bp)
app.register_blueprint(comandas_bp)
app.register_blueprint(cp_bp)

csrf = CSRFProtect()
csrf.init_app(app)



with app.app_context():
    db.create_all()
    seed_status()
    seed_mesas()

if __name__ == '__main__':
    app.run(host=app.config["HOST"], port=app.config['PORT'], debug=app.config['DEBUG'])
    