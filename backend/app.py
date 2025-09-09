from config import app, db
'''Blueprint - rotas'''
from frontendRoutes import frontend_bp
from Mesas.mesasCadastradas import seed_mesas
from Mesas.mesasRoutes import mesa_bp
from Cardapio.cardapioRoutes import cardapio_bp

app.register_blueprint(frontend_bp)
app.register_blueprint(cardapio_bp)
app.register_blueprint(mesa_bp)

with app.app_context():
    db.create_all()  
    seed_mesas() 

if __name__ == '__main__':
    app.run(host=app.config["HOST"], port=app.config['PORT'], debug=app.config['DEBUG'])
