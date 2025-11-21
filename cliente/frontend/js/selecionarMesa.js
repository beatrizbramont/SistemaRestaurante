document.addEventListener("DOMContentLoaded", async () => {

    const pessoas = parseInt(sessionStorage.getItem("pessoas"));
    const lista = document.querySelector("#listaMesas");
    const info = document.querySelector("#infoPessoas");
    const erro = document.querySelector("#erro");

    info.innerHTML = `Total de pessoas: <strong>${pessoas}</strong><br>Selecione mesas suficientes.`;

    // 🔎 Buscar todas as mesas disponíveis
    try {
        const res = await fetch("http://127.0.0.1:8001/mesas/disponiveis?capacidade=1");
        const mesas = await res.json();

        mesas.forEach(m => {
            const card = document.createElement("div");
            card.classList.add("mesa-card");
            card.innerHTML = `
                <label class="mesa-opcao">
                    <input type="checkbox" class="checkMesa" value="${m.id}" data-cap="${m.capacidade}">
                    <h3>Mesa ${m.numero}</h3>
                    <p>Capacidade: ${m.capacidade}</p>
                </label>
            `;
            lista.appendChild(card);
        });

        document.getElementById("confirmarBtn").addEventListener("click", () => {
            erro.textContent = "";

            const selecionadas = [...document.querySelectorAll(".checkMesa:checked")];

            if (!selecionadas.length) {
                erro.textContent = "Selecione ao menos uma mesa.";
                return;
            }

            const capacidadeTotal = selecionadas.reduce(
                (s, el) => s + parseInt(el.dataset.cap), 0
            );

            if (capacidadeTotal < pessoas) {
                erro.textContent = "A capacidade total das mesas selecionadas não é suficiente.";
                return;
            }

            const ids = selecionadas.map(el => el.value);
            sessionStorage.setItem("mesasSelecionadas", JSON.stringify(ids));

            abrirModalReserva(ids);
        });

    } catch (e) {
        console.error(e);
        erro.textContent = "Erro ao buscar mesas.";
    }

    // ============================
    // Modal de Reserva
    // ============================
    function abrirModalReserva(mesasSelecionadas) {
        const modal = document.getElementById("modalReserva");
        const btnConfirmar = document.getElementById("btnConfirmarReserva");
        const btnCancelar = document.getElementById("btnCancelar");
        const btnFechar = document.getElementById("btnFecharModal");
        const erroModal = document.getElementById("erroModal");

        modal.style.display = "flex";

        const fecharModal = () => {
            modal.style.display = "none";
            erroModal.style.display = "none";
        };

        btnCancelar.onclick = fecharModal;
        btnFechar.onclick = fecharModal;

        btnConfirmar.onclick = async () => {
            const nomeCliente = document.getElementById("nomeReserva").value;
            const dataReserva = document.getElementById("dataReserva").value; // ex: "2025-11-21"
            const horaReserva = document.getElementById("horaReserva").value; // ex: "14:47"

            // Validações
            if (!nomeCliente) {
                erroModal.textContent = "Digite seu nome.";
                erroModal.style.display = "block";
                return;
            }

            if (!dataReserva) {
                erroModal.textContent = "Escolha uma data.";
                erroModal.style.display = "block";
                return;
            }

            const hoje = new Date();
            const dataEscolhida = new Date(dataReserva);
            if (dataEscolhida < new Date(hoje.toDateString())) {
                erroModal.textContent = "Data inválida. Escolha hoje ou datas futuras.";
                erroModal.style.display = "block";
                return;
            }

            if (!horaReserva) {
                erroModal.textContent = "Escolha um horário.";
                erroModal.style.display = "block";
                return;
            }

            const [h, m] = horaReserva.split(":").map(Number);
            const horario = h + m / 60;
            if (horario < 12.5 || horario > 21) {
                erroModal.textContent = "Horário inválido. Escolha entre 12:30 e 21:00.";
                erroModal.style.display = "block";
                return;
            }

            // 🔹 Combinar data e hora em ISO 8601 para enviar ao backend
            // Inclui segundos para compatibilidade com datetime do backend
            const dataHoraReserva = `${dataReserva}T${horaReserva}:00`;

            const token = localStorage.getItem("token");
            const payload = {
                nome_cliente: nomeCliente,
                data_reserva: dataHoraReserva, // data + hora correta
                pessoas: pessoas,
                mesas: mesasSelecionadas
            };

            try {
                const r = await fetch("http://127.0.0.1:8002/reservas/criar", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { "Authorization": `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify(payload)
                });

                const resp = await r.json();
                if (!r.ok) {
                    erroModal.textContent = resp.erro || resp.message || "Erro ao criar reserva.";
                    erroModal.style.display = "block";
                    return;
                }

                sessionStorage.setItem("reserva_id", resp.reserva?.id ?? "");
                window.location.href = "../html/minhasReservas.html";

            } catch (err) {
                erroModal.textContent = "Erro de conexão ao criar reserva.";
                erroModal.style.display = "block";
            }
        };
    }
});
