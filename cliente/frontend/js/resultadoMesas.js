/* resultadoMesas.js - versão final corrigida e compatível com backend */
document.addEventListener("DOMContentLoaded", async () => {
    const listaMesas = document.getElementById("listaMesas");
    const erroContainer = document.getElementById("erro");

    if (!listaMesas || !erroContainer) {
        console.error("ERRO: elementos #listaMesas ou #erro não encontrados.");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const pessoas = params.get("pessoas") ?? sessionStorage.getItem("pessoas");

    if (!pessoas || isNaN(pessoas) || Number(pessoas) <= 0) {
        erroContainer.textContent = "Quantidade de pessoas inválida.";
        erroContainer.style.color = "#ff4d4d";
        return;
    }

    listaMesas.innerHTML = "";
    erroContainer.textContent = "";
    erroContainer.style.display = "none";

    const token = localStorage.getItem("token");

    async function tentarBackend8002() {
        try {
            const r = await fetch(`http://127.0.0.1:8002/reservas/disponiveis?pessoas=${pessoas}`, {
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            if (r.status === 401) return null;
            if (!r.ok) return null;
            return await r.json();
        } catch (e) {
            console.warn("Erro tentando rota 8002:", e);
            return null;
        }
    }

    async function tentarBackend8001() {
        try {
            const r = await fetch(`http://127.0.0.1:8001/mesas/disponiveis?capacidade=${pessoas}`);
            if (!r.ok) return null;
            return await r.json();
        } catch (e) {
            console.warn("Erro tentando rota 8001:", e);
            return null;
        }
    }

    let dados = await tentarBackend8002();
    if (!dados) dados = await tentarBackend8001();

    const mesas = dados?.mesas ?? dados ?? [];

    if (!mesas || mesas.length === 0) {
        erroContainer.style.display = "block";
        erroContainer.style.color = "#ff4d4d";
        erroContainer.textContent = "Não há mesas disponíveis para a quantidade informada.";
        return;
    }

    mesas.forEach(m => {
        const card = document.createElement("div");
        card.className = "mesa-card";
        card.innerHTML = `
            <h3>Mesa ${m.numero ?? m.id}</h3>
            <p>Capacidade: ${m.capacidade ?? m.capacity}</p>
            <button type="button" class="btn-selecionar" data-num="${m.numero ?? m.id}">Reservar</button>
        `;
        listaMesas.appendChild(card);
    });

    // Abrir modal ao clicar em "Reservar"
    listaMesas.addEventListener("click", (ev) => {
        const btn = ev.target.closest(".btn-selecionar");
        if (!btn) return;
        abrirModalReserva(btn.dataset.num);
    });

    function abrirModalReserva(mesaNumero) {
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
            const dataInput = document.getElementById("dataReserva").value; // ex: "2025-11-21"
            const horaInput = document.getElementById("horaReserva").value; // ex: "14:47"

            // Validações
            const hoje = new Date();
            const dataEscolhida = new Date(dataInput);

            if (!nomeCliente) {
                erroModal.textContent = "Digite seu nome.";
                erroModal.style.display = "block";
                return;
            }

            if (!dataInput || dataEscolhida < new Date(hoje.toDateString())) {
                erroModal.textContent = "Data inválida. Escolha hoje ou datas futuras.";
                erroModal.style.display = "block";
                return;
            }

            if (!horaInput) {
                erroModal.textContent = "Informe um horário.";
                erroModal.style.display = "block";
                return;
            }

            const [h, m] = horaInput.split(":").map(Number);
            const horario = h + m / 60;
            if (horario < 12.5 || horario > 21) {
                erroModal.textContent = "Horário inválido. Escolha entre 12:30 e 21:00.";
                erroModal.style.display = "block";
                return;
            }

            // Combina data e hora em ISO 8601 completo
            const dataHoraReserva = `${dataInput}T${horaInput}:00`;

            const payload = {
                data_reserva: dataHoraReserva,
                pessoas: Number(pessoas),
                mesas: [mesaNumero]
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
                window.location.href = "minhasReservas.html";
            } catch (err) {
                erroModal.textContent = "Erro de conexão ao criar reserva.";
                erroModal.style.display = "block";
            }
        };
    }
});
