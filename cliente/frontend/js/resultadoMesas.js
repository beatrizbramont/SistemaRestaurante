document.addEventListener("DOMContentLoaded", async () => {
    const pessoas = parseInt(sessionStorage.getItem("pessoas"));
    const lista = document.querySelector("#listaMesas");
    const erro = document.querySelector("#erro");

    if (!pessoas) {
        erro.textContent = "Quantidade de pessoas inválida!";
        return;
    }

    try {
        const res = await fetch(`http://127.0.0.1:8001/mesas/disponiveis?capacidade=${pessoas}`);
        const mesas = await res.json();

        if (!mesas.length) {
            lista.innerHTML = `<p>Nenhuma mesa disponível com capacidade para ${pessoas} pessoas.</p>`;
            return;
        }

        mesas.forEach(m => {
            const card = document.createElement("div");
            card.classList.add("mesa-card");
            card.innerHTML = `
                <h3>Mesa ${m.numero}</h3>
                <p>Capacidade: ${m.capacidade}</p>
                <button onclick="reservarMesa(${m.id})">Reservar Mesa</button>
            `;
            lista.appendChild(card);
        });

    } catch (e) {
        erro.textContent = "Erro ao carregar mesas.";
    }
});

async function reservarMesa(id) {
    alert("Lógica de reserva será aplicada aqui!");
}
