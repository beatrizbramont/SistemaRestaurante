document.addEventListener("DOMContentLoaded", async () => {

    const pessoas = parseInt(sessionStorage.getItem("pessoas"));
    const lista = document.querySelector("#listaMesas");
    const info = document.querySelector("#infoPessoas");
    const erro = document.querySelector("#erro");

    info.innerHTML = `Total de pessoas: <strong>${pessoas}</strong><br>Selecione mesas suficientes.`;

    try {
        const res = await fetch("http://127.0.0.1:8001/mesas/disponiveis?capacidade=1");
        const mesas = await res.json();

        mesas.forEach(m => {
            const card = document.createElement("div");
            card.classList.add("mesa-card");

            card.innerHTML = `
                <input type="checkbox" class="checkMesa" value="${m.id}" data-cap="${m.capacidade}">
                <h3>Mesa ${m.numero}</h3>
                <p>Capacidade: ${m.capacidade}</p>
            `;

            lista.appendChild(card);
        });

        document.getElementById("confirmarBtn").addEventListener("click", () => {
            const selecionadas = [...document.querySelectorAll(".checkMesa:checked")];

            if (!selecionadas.length) {
                erro.textContent = "Selecione ao menos uma mesa.";
                return;
            }

            const capacidadeTotal = selecionadas.reduce((s, el) => s + parseInt(el.dataset.cap), 0);

            if (capacidadeTotal < pessoas) {
                erro.textContent = "A capacidade total das mesas selecionadas não é suficiente.";
                return;
            }

            alert("Reserva concluída!");
        });

    } catch (e) {
        erro.textContent = "Erro ao buscar mesas.";
    }

});
