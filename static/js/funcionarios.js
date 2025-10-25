function abrirModal() {
    document.getElementById('modal-cadastro').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal-cadastro').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    const botaoAdicionar = document.querySelector('.funcionarios-topo-botao');

    if (botaoAdicionar) {
        botaoAdicionar.addEventListener('click', abrirModal);
    }

    document.addEventListener('keydown', function (event) {
        const modal = document.getElementById('modal-cadastro');

        if (event.key === 'Escape' && modal.style.display === 'flex') {
            fecharModal();
        }
    });
});