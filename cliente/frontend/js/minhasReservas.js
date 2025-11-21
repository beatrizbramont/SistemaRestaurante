document.addEventListener("DOMContentLoaded", async () => {
    carregarReservas();
});

async function carregarReservas() {
    const lista = document.querySelector("#listaReservas");
    const erro = document.querySelector("#erroReservas");

    lista.innerHTML = ""; // limpa antes de carregar

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
            item.id = `reserva-${r.id}`;

            item.innerHTML = `
                <h3>Reserva</h3>
                <p><strong>Mesa:</strong> ${r.mesas.join(", ")}</p>
                <p><strong>Pessoas:</strong> ${r.capacidade}</p>
                <p><strong>Status:</strong> ${r.status}</p>
                <p><strong>Data:</strong> ${r.data}</p>

                <button class="cancelar-btn" onclick="cancelarReserva(${r.id})">
                     Cancelar Reserva
                </button>
            `;

            lista.appendChild(item);
        });

    } catch (e) {
        console.error(e);
        erro.textContent = "Erro ao conectar com o servidor.";
    }
}

async function cancelarReserva(idReserva) {
    const token = localStorage.getItem("token");

    const confirmar = confirm("Tem certeza que deseja cancelar esta reserva?");
    if (!confirmar) return;

    try {
        const res = await fetch(`http://127.0.0.1:8002/reservas/cancelar/${idReserva}`, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        const dados = await res.json();

        if (!res.ok) {
            alert(dados.erro || "Não foi possível cancelar a reserva.");
            return;
        }

        // Marca o card como vermelho antes de sumir
        const card = document.querySelector(`#reserva-${idReserva}`);
        if (card) {
            card.classList.add("reserva-cancelada");

            setTimeout(() => {
                carregarReservas(); // recarrega lista limpa
            }, 800);
        } else {
            carregarReservas();
        }

    } catch (e) {
        console.error(e);
        alert("Erro ao conectar com o servidor.");
    }
}

