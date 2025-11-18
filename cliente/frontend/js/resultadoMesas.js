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

async function reservarMesa(idMesa) {
    const pessoas = parseInt(sessionStorage.getItem("pessoas"));
    const erro = document.querySelector("#erro");

    if (!pessoas || pessoas < 1) {
        erro.textContent = "Quantidade inválida de pessoas!";
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:8001/reservas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mesa_id: idMesa,
                pessoas: pessoas
            })
        });

        const dados = await res.json();

        if (!res.ok) {
            erro.textContent = dados.mensagem || "Erro ao reservar mesa.";
            return;
        }

        // Sucesso!
        alert("Mesa reservada com sucesso!");

        // Salva ID da reserva para usar depois
        sessionStorage.setItem("reserva_id", dados.reserva_id);

        // Redireciona para a página de confirmação
        window.location.href = "confirmacao.html";

    } catch (e) {
        console.error(e);
        erro.textContent = "Erro ao conectar ao servidor.";
    }
}
