from config import app, db
'''Blueprint - rotas'''
from frontendRoutes import frontend_bp
from Mesas.mesasCadastradas import seed_mesas, seed_status
from Mesas.mesasRoutes import mesa_bp
from Comandas.comandasRoutes import comandas_bp
from ComandaProduto.CpRoutes import cp_bp
from Cardapio.cardapioRoutes import cardapio_bp

app.register_blueprint(frontend_bp)
app.register_blueprint(cardapio_bp)
app.register_blueprint(mesa_bp)
app.register_blueprint(comandas_bp)
app.register_blueprint(cp_bp)

with app.app_context():
    db.create_all()
    seed_status()
    seed_mesas()

if __name__ == '__main__':
    app.run(host=app.config["HOST"], port=app.config['PORT'], debug=app.config['DEBUG'])