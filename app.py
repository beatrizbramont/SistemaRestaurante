from config import app, db
from flask import request, redirect, url_for, session
'''Blueprint - rotas'''
from Funcionario.funcionario_routes import funcionarios_bp
from Cardapio.cardapio_routes import cardapio_bp
from Mesas import seed_mesas, seed_status
from Mesas.mesas_routes import mesa_bp
from Comandas.comandas_routes import comandas_bp
from ComandaProduto.cp_routes import cp_bp
from Auth.auth_routes import auth_bp
from index_route import index_bp
from seeds.seed_scrum import seed_scrum
from flask_wtf import CSRFProtect
from flask_cors import CORS
from Auth.extensions import mail

app.register_blueprint(index_bp) 

app.register_blueprint(cardapio_bp) 
app.register_blueprint(funcionarios_bp)
app.register_blueprint(mesa_bp)
app.register_blueprint(comandas_bp)
app.register_blueprint(cp_bp)
app.register_blueprint(auth_bp)

mail.init_app(app)

@app.before_request
def proteger_rotas():

    if request.endpoint is None:
        return

    rotas_livres = (
        "auth.login",
        "auth.otp",
        "static",
        "index.index",
    )

    if request.endpoint.startswith(rotas_livres):
        return

    if "usuario_id" not in session:
        return redirect(url_for("auth.login"))
    
csrf = CSRFProtect()
csrf.init_app(app)

csrf.exempt(cardapio_bp)
csrf.exempt(mesa_bp)
csrf.exempt(comandas_bp)
csrf.exempt(cp_bp)
csrf.exempt(funcionarios_bp)

with app.app_context():
    db.create_all()
    seed_scrum()
    seed_status()
    seed_mesas()

CORS(app, origins=["http://127.0.0.1:8002"])

if __name__ == '__main__':
    app.run(host=app.config["HOST"], port=app.config['PORT'], debug=app.config['DEBUG'])
    