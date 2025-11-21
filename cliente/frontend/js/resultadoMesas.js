/* resultadoMesas.js - versão final corrigida e robusta */

document.addEventListener("DOMContentLoaded", async () => {
    // Elementos principais (seguro: checa existência)
    const listaMesas = document.getElementById("listaMesas");
    const erroContainer = document.getElementById("erro");
    const btnVoltar = document.getElementById("btnVoltar"); // opcional

    if (!listaMesas || !erroContainer) {
        console.error("ERRO: elementos #listaMesas ou #erro não encontrados.");
        return;
    }

    // pegar parâmetros (pode vir por query string)
    const params = new URLSearchParams(window.location.search);
    const pessoas = params.get("pessoas") ?? sessionStorage.getItem("pessoas");
    const dataReserva = params.get("data") ?? sessionStorage.getItem("dataReserva");
    const horarioReserva = params.get("hora") ?? sessionStorage.getItem("horaReserva");

    // Validações básicas de presença
    if (!pessoas) {
        erroContainer.textContent = "Quantidade de pessoas inválida.";
        erroContainer.style.color = "#ff4d4d";
        return;
    }
    if (!dataReserva || !horarioReserva) {
        // se não tiver data/horário, apenas prossegue para listar mesas (ou mostre aviso leve)
        // aqui assumimos que front envia data/hora; caso contrário, permitir buscar mesas sem filtros
        console.warn("Aviso: data ou horário não informado; buscando mesas por capacidade apenas.");
    }

    // valida data não passada
    const hoje = new Date();
    hoje.setHours(0,0,0,0);
    let dataEscolhida;
    try {
        dataEscolhida = new Date(dataReserva);
        dataEscolhida.setHours(0,0,0,0);
        if (dataReserva && dataEscolhida < hoje) {
            erroContainer.textContent = "Não é possível reservar para datas passadas.";
            erroContainer.style.color = "#ff4d4d";
            return;
        }
    } catch (e) {
        // se parse falhar, apenas loga e segue
        console.warn("Não foi possível parsear a dataReserva:", e);
    }

    // valida horário permitido se informado
    if (horarioReserva) {
        const [h, m] = horarioReserva.split(":").map(Number);
        if (Number.isFinite(h) && Number.isFinite(m)) {
            const total = h*60 + m;
            const minPermitido = 12*60 + 30; // 12:30
            const maxPermitido = 21*60;      // 21:00
            if (total < minPermitido || total > maxPermitido) {
                erroContainer.textContent = "Horário inválido. Permitido entre 12:30 e 21:00.";
                erroContainer.style.color = "#ff4d4d";
                return;
            }
        }
    }

    // função utilitária para normalizar resposta de "mesas"
    function extrairMesasResposta(dado) {
        // resultado final: array ou []
        if (!dado) return [];
        if (Array.isArray(dado)) return dado;
        if (typeof dado === "string") {
            try {
                const p = JSON.parse(dado);
                if (Array.isArray(p)) return p;
                if (p && Array.isArray(p.mesas)) return p.mesas;
                return [];
            } catch {
                return [];
            }
        }
        if (typeof dado === "object") {
            if (Array.isArray(dado.mesas)) return dado.mesas;
            // se o backend devolve { mensagem: "...", mesas: [...] } já tratado
            // ou outras chaves, tentar detectar arrays dentro do objeto
            for (const k of Object.keys(dado)) {
                if (Array.isArray(dado[k])) return dado[k];
            }
        }
        return [];
    }

    // Limpa UI inicial
    listaMesas.innerHTML = "";
    erroContainer.textContent = "";
    erroContainer.style.display = "none";

    // Chamada API: tente duas rotas (8001 ou 8002 dependendo da sua arquitetura)
    // Ajuste a URL conforme necessário no seu ambiente.
    const token = localStorage.getItem("token");
    const urlsToTry = [
        `http://127.0.0.1:8002/reservas/disponiveis?pessoas=${pessoas}`,
        `http://127.0.0.1:8001/mesas/disponiveis?capacidade=${pessoas}`
    ];

    let resposta = null;
    let dados = null;

    for (const url of urlsToTry) {
        try {
            const r = await fetch(url, {
                method: "GET",
                headers: token ? { "Authorization": `Bearer ${token}` } : {}
            });
            // se status 404 é claramente "sem mesas" em algumas APIs
            if (r.status === 404) {
                resposta = r;
                dados = null;
                break;
            }
            // tenta parsear JSON
            const json = await r.json().catch(() => null);
            // se veio vazio, continua tentando outras URLs
            if (json === null || (Array.isArray(json) && json.length === 0)) {
                resposta = r;
                dados = json;
                // não break; tentamos a próxima URL para garantir
                // mas se esta foi a última, ok
            } else {
                // normal case: json pode ser array ou {mesas: [...]}
                resposta = r;
                dados = json;
                break;
            }
        } catch (e) {
            console.warn("falha ao buscar em", url, e);
            // tenta próxima URL
            continue;
        }
    }

    // Normalizar mesas a partir de dados (se dados for null, trata como vazio)
    const mesas = extrairMesasResposta(dados);

    // Se não houver mesas -> mostrar mensagem vermelha centralizada (sem botão extra)
    if (!mesas || mesas.length === 0) {
        erroContainer.style.display = "block";
        erroContainer.style.color = "#ff4d4d";
        erroContainer.style.textAlign = "center";
        erroContainer.style.fontSize = "1.05rem";
        erroContainer.textContent = "Não há mesas disponíveis para a quantidade informada.";
        // opcional: mostrar botão voltar caso exista no HTML
        if (btnVoltar) btnVoltar.style.display = "inline-block";
        return;
    }

    // Renderizar as mesas disponíveis
    mesas.forEach(m => {
        const card = document.createElement("div");
        card.className = "mesa-card";
        card.innerHTML = `
            <h3>Mesa ${m.numero ?? m.id ?? "?"}</h3>
            <p>Capacidade: ${m.capacidade ?? m.capacity ?? "—"}</p>
            <button type="button" class="btn-selecionar" data-num="${m.numero ?? m.id ?? ""}">
                Reservar
            </button>
        `;
        listaMesas.appendChild(card);
    });

    // Delegation: listeners em botões de reservar
    listaMesas.querySelectorAll(".btn-selecionar").forEach(btn => {
        btn.addEventListener("click", (ev) => {
            const numero = btn.dataset.num;
            abrirModalReserva(numero);
        });
    });

    /* ---------------------------
       Modal: abrir / validar / enviar
       --------------------------- */
    function abrirModalReserva(mesaNumero) {
        const modal = document.getElementById("modalReserva");
        const btnFechar = document.getElementById("btnFecharModal") || document.getElementById("fecharModal") || null;
        const btnCancelarModal = document.getElementById("btnCancelar") || null;
        const btnConfirmarModal = document.getElementById("btnConfirmarReserva") || null;
        const erroModal = document.getElementById("erroModal") || null;
        const inputNome = document.getElementById("nomeReserva") || null;
        const inputData = document.getElementById("dataReserva") || null;
        const inputHora = document.getElementById("horaReserva") || null;

        if (!modal) {
            alert("Modal de reserva não encontrado.");
            return;
        }

        // reset campos e mostrar modal
        if (erroModal) { erroModal.style.display = "none"; erroModal.textContent = ""; }
        if (inputNome) inputNome.value = "";
        if (inputData) inputData.value = dataReserva || "";
        if (inputHora) inputHora.value = horarioReserva || "";

        modal.style.display = "flex";
        setTimeout(() => inputNome && inputNome.focus(), 120);

        // handlers seguros (remove listeners antigos para evitar duplicação)
        const fechar = () => modal.style.display = "none";

        if (btnFechar) {
            btnFechar.onclick = fechar;
        }
        if (btnCancelarModal) {
            btnCancelarModal.onclick = fechar;
        }
        // fechar clicando fora
        modal.onclick = (ev) => { if (ev.target === modal) fechar(); };
        document.onkeydown = (ev) => { if (ev.key === "Escape") fechar(); };

        if (btnConfirmarModal) {
            btnConfirmarModal.onclick = async () => {
                // validação frontend
                const nome = inputNome ? inputNome.value.trim() : "";
                const dataSel = inputData ? inputData.value : (dataReserva || "");
                const horaSel = inputHora ? inputHora.value : (horarioReserva || "");

                if (!nome || !dataSel || !horaSel) {
                    if (erroModal) {
                        erroModal.style.display = "block";
                        erroModal.textContent = "Por favor, preencha todos os campos.";
                        return;
                    } else {
                        alert("Por favor, preencha todos os campos.");
                        return;
                    }
                }

                // valida data >= hoje
                try {
                    const dSel = new Date(dataSel);
                    dSel.setHours(0,0,0,0);
                    if (dSel < hoje) {
                        if (erroModal) { erroModal.style.display = "block"; erroModal.textContent = "Não é possível reservar para datas passadas."; }
                        else alert("Não é possível reservar para datas passadas.");
                        return;
                    }
                } catch {}

                // valida horário permitido
                const [hh, mm] = horaSel.split(":").map(Number);
                const totalMin = hh*60 + mm;
                if (totalMin < (12*60+30) || totalMin > (21*60)) {
                    if (erroModal) { erroModal.style.display = "block"; erroModal.textContent = "Horário inválido. Permitido entre 12:30 e 21:00."; }
                    else alert("Horário inválido. Permitido entre 12:30 e 21:00.");
                    return;
                }

                // se data for hoje, garantir horário futuro
                try {
                    const dSel = new Date(dataSel); dSel.setHours(0,0,0,0);
                    if (dSel.getTime() === hoje.getTime()) {
                        const agora = new Date();
                        const sel = new Date(`${dataSel}T${horaSel}:00`);
                        if (sel < agora) {
                            if (erroModal) { erroModal.style.display = "block"; erroModal.textContent = "O horário selecionado já passou."; }
                            else alert("O horário selecionado já passou.");
                            return;
                        }
                    }
                } catch {}

                // confirmação final
                if (!confirm("Tem certeza que deseja finalizar sua reserva?")) return;

                // montar payload
                const payload = {
                    nome_cliente: nome,
                    data_reserva: dataSel,
                    horario_reserva: horaSel,
                    pessoas: Number(pessoas),
                    mesas: [mesaNumero]
                };

                // enviar para API de reservas (ajuste URL se necessário)
                try {
                    const token = localStorage.getItem("token");
                    const r = await fetch("http://127.0.0.1:8002/reservas/criar", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            ...(token ? { "Authorization": `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify(payload)
                    });

                    const resposta = await r.json().catch(() => ({}));

                    if (!r.ok) {
                        const msg = resposta.erro || resposta.message || "Erro ao criar reserva.";
                        if (erroModal) { erroModal.style.display = "block"; erroModal.textContent = msg; }
                        else alert(msg);
                        return;
                    }

                    // sucesso -> fechar modal e redirecionar
                    modal.style.display = "none";
                    sessionStorage.setItem("reserva_id", resposta.reserva?.id ?? "");
                    window.location.href = "minhasReservas.html";

                } catch (e) {
                    console.error("Erro ao enviar reserva:", e);
                    if (erroModal) { erroModal.style.display = "block"; erroModal.textContent = "Erro de rede ao tentar reservar."; }
                    else alert("Erro de rede ao tentar reservar.");
                }
            };
        }
    }
});
