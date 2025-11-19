document.addEventListener("DOMContentLoaded", async () => {
    const pessoas = parseInt(sessionStorage.getItem("pessoas"));
    const lista = document.querySelector("#listaMesas");
    const erro = document.querySelector("#erro");

    if (!pessoas) {
        erro.textContent = "Quantidade de pessoas inválida!";
        return;
    }

    try {
        const res = await fetch(
            `http://127.0.0.1:8001/mesas/disponiveis?capacidade=${pessoas}`
        );

        const mesas = await res.json();

        if (!Array.isArray(mesas) || mesas.length === 0) {
            lista.innerHTML = `<p>Nenhuma mesa disponível com capacidade para ${pessoas} pessoas.</p>`;
            return;
        }

        mesas.forEach(m => {
            const card = document.createElement("div");
            card.classList.add("mesa-card");
            card.innerHTML = `
                <h3>Mesa ${m.numero}</h3>
                <p>Capacidade: ${m.capacidade}</p>
                <button onclick="reservarMesa(${m.id})">Reservar</button>
            `;
            lista.appendChild(card);
        });

    } catch (e) {
        console.error(e);
        erro.textContent = "Erro ao carregar mesas.";
    }
});


async function reservarMesa(idMesa) {
    const pessoas = parseInt(sessionStorage.getItem("pessoas"));
    const erro = document.querySelector("#erro");
    const token = localStorage.getItem("token");

    const payload = {
        pessoas,
        mesas: [idMesa] // ID REAL da mesa vindo do backend 8001
    };

    const headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };

    // Primeira tentativa: rota correta
    let res = await fetch("http://127.0.0.1:8002/reservas/criar", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
    });

    // Fallback apenas se necessário
    if (res.status === 404 || res.status === 405) {
        res = await fetch("http://127.0.0.1:8002/reservas", {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        });
    }

    const dados = await res.json();

    if (!res.ok) {
        erro.textContent = dados.erro || "Erro ao reservar.";
        return;
    }

    alert("Mesa reservada com sucesso!");
    sessionStorage.setItem("reserva_id", dados.reserva.id);
    window.location.href = "confirmacao.html";
}
