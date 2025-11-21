document.addEventListener("DOMContentLoaded", async () => {
    const lista = document.querySelector("#listaReservas");
    const erro = document.querySelector("#erroReservas");

    const token = localStorage.getItem("token");

    if (!token) {
        erro.textContent = "Você precisa estar logado.";
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:8002/reservas/minhas", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const dados = await res.json();

        if (!res.ok) {
            erro.textContent = dados.erro || "Erro ao carregar reservas.";
            return;
        }

        if (dados.length === 0) {
            lista.innerHTML = `
                <p class="sem-reserva">Você ainda não possui reservas.</p>
            `;
            return;
        }

        dados.forEach(r => {
            const item = document.createElement("div");
            item.classList.add("reserva-card");

            item.innerHTML = `
                <h3>Reserva</h3>
                <p><strong>Mesa:</strong> ${r.mesas.join(", ")}</p>
                <p><strong>Pessoas:</strong> ${r.capacidade}</p>
                <p><strong>Status:</strong> ${r.status}</p>
                <p><strong>Data:</strong> ${r.data}</p>
            `;

            lista.appendChild(item);
        });

    } catch (e) {
        console.error(e);
        erro.textContent = "Erro ao conectar com o servidor.";
    }
});
