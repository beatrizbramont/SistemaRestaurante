document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('mesas-container');

    function carregarMesas() {
        fetch('/mesas')
            .then(res => res.json())
            .then(mesas => {
                container.innerHTML = '';
                mesas.forEach(mesa => {
                    const div = document.createElement('div');
                    div.classList.add('mesa', mesa.status);

                    div.innerHTML = `
                        <h3>Mesa ${mesa.numero}</h3>
                        <p>Status: <strong>${mesa.status}</strong></p>
                        <p>Comanda aberta: ${mesa.comanda_aberta ? 'Sim' : 'Não'}</p>
                        <button onclick="alterarComanda(${mesa.id}, '${mesa.status}', ${mesa.comanda_aberta})">
                            ${mesa.comanda_aberta ? 'Fechar Comanda' : mesa.status === 'livre' ? 'Abrir Comanda' : '---'}
                        </button>
                    `;

                    container.appendChild(div);
                });
            })
            .catch(err => {
                console.error('Erro ao carregar mesas:', err);
            });
    }

    window.alterarComanda = (mesaId, status, comandaAberta) => {
        if (comandaAberta) {
            fetch(`/mesa/${mesaId}/fechar_comanda`, { method: 'POST' })
                .then(res => res.json())
                .then(() => carregarMesas());
        } else if (status === 'livre') {
            fetch(`/mesa/${mesaId}/abrir_comanda`, { method: 'POST' })
                .then(res => res.json())
                .then(() => carregarMesas());
        }
    }

    carregarMesas();
});
