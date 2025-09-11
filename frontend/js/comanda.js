document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mesaId = urlParams.get('mesa');
    const comandaIds = urlParams.get('comandas')?.split(',') || [];

    const container = document.getElementById('comandasContainer');

    if (comandaIds.length === 0) {
        container.innerHTML = "<p>Nenhuma comanda aberta.</p>";
        return;
    }

    comandaIds.forEach((id, index) => {
        const comandaDiv = document.createElement('div');
        comandaDiv.classList.add('comanda');

        comandaDiv.innerHTML = `
            <h2>Comanda #${index + 1}</h2>
            <p>ID da comanda: ${id}</p>
            <!-- Adicione campos de pedido aqui futuramente -->
        `;

        container.appendChild(comandaDiv);
    });
});