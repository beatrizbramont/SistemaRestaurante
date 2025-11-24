const apiUrl = "/api/mesas";

// Pega o token CSRF do meta tag
function getCsrfToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
}

// Busca as mesas da API
async function fetchMesas(capacidade = null) {
    try {
        const url = (capacidade && Number.isInteger(capacidade) && capacidade > 0)
            ? `/mesas/disponiveis?capacidade=${capacidade}`
            : apiUrl;

        const res = await fetch(url);
        const contentType = res.headers.get("Content-Type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("Resposta não é JSON:", res);
            alert("Erro interno no servidor (500). Verifique o backend.");
            return [];
        }

        const mesas = await res.json();
        if (!res.ok) throw new Error('Erro ao buscar mesas');
        return mesas.mesas || mesas; 
    } catch (error) {
        console.error(error);
        alert('Falha ao carregar mesas.');
        return [];
    }
}

// Atualiza o status da mesa via API
async function updateStatus(mesaId, novoStatus, selectElement) {
    try {
        const res = await fetch(`/mesa/${mesaId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({ status: novoStatus })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(`Erro ao atualizar status: ${data.error || 'Desconhecido'}`);
            selectElement.value = selectElement.getAttribute('data-old');
            return;
        }

        selectElement.setAttribute('data-old', novoStatus);
        updateSelectClass(selectElement, novoStatus);
    } catch (error) {
        alert('Erro na comunicação com o servidor.');
        selectElement.value = selectElement.getAttribute('data-old');
    }
}

// Aplica cor ao select com base no status
function updateSelectClass(select, status) {
    select.classList.remove('status-livre', 'status-ocupada', 'status-reservada');
    select.classList.add(`status-${status}`);
}

async function renderMesas(capacidade = null) {
    const mesas = await fetchMesas(capacidade);
    mesas.sort((a, b) => a.numero - b.numero);

    const tbody = document.querySelector('#mesas-table tbody');
    tbody.innerHTML = '';

    const hoje = new Date().toISOString().split('T')[0];

    mesas.forEach(mesa => {
        const tr = document.createElement('tr');

        // Número
        const tdNumero = document.createElement('td');
        tdNumero.textContent = mesa.numero;
        tr.appendChild(tdNumero);

        // Capacidade
        const tdCapacidade = document.createElement('td');
        tdCapacidade.textContent = mesa.capacidade;
        tr.appendChild(tdCapacidade);

        // Botão Comandas
        const tdComandas = document.createElement('td');
        const btnComandas = document.createElement('button');
        btnComandas.textContent = 'Comandas';
        btnComandas.className = 'btn-comanda';
        btnComandas.addEventListener('click', () => abrirModalComandas(mesa.id, mesa.capacidade));
        tdComandas.appendChild(btnComandas);
        tr.appendChild(tdComandas);

        // Status + ícones
        const tdStatus = document.createElement('td');

        // Container flex único (select + ícones)
        const statusContainer = document.createElement('div');
        statusContainer.style.display = 'flex';
        statusContainer.style.alignItems = 'center';
        statusContainer.style.justifyContent = 'center'; // tudo à direita
        statusContainer.style.gap = '8px'; // espaçamento pequeno

        // Select de status
        const selectStatus = document.createElement('select');
        selectStatus.setAttribute('aria-label', `Alterar status da mesa ${mesa.numero}`);
        ['livre','ocupada','reservada'].forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            if (mesa.status === status) option.selected = true;
            selectStatus.appendChild(option);
        });
        selectStatus.setAttribute('data-old', mesa.status);
        updateSelectClass(selectStatus, mesa.status);
        selectStatus.addEventListener('change', () => updateStatus(mesa.id, selectStatus.value, selectStatus));
        statusContainer.appendChild(selectStatus);

        // 🔴 Bolinha de alerta (reserva hoje)
        if (mesa.proxima_reserva) {
            const dataReserva = new Date(mesa.proxima_reserva.data_reserva).toISOString().split('T')[0];
            if (dataReserva === hoje) {
                const alerta = document.createElement('span');
                alerta.className = 'alerta-reserva';
                alerta.title = 
                    `Reserva HOJE:\nCliente: ${mesa.proxima_reserva.nome_cliente}\nMesa: ${mesa.numero}\nHorário: ${mesa.proxima_reserva.data_reserva}`;
                statusContainer.appendChild(alerta);
            }
        }

        // 📅 Ícone de calendário (reservas futuras)
        if (mesa.reservas_futuras && mesa.reservas_futuras.length > 0) {
            const calendario = document.createElement('i');
            calendario.className = 'fa fa-calendar icone-calendario';
            calendario.title = 'Clique para ver reservas futuras';
            calendario.addEventListener('click', () => abrirModalReservasFuturas(mesa));
            statusContainer.appendChild(calendario);
        }

        tdStatus.appendChild(statusContainer);
        tr.appendChild(tdStatus);

        tbody.appendChild(tr);
    });
}

// Atualização automática
setInterval(() => {
    const capacidade = parseInt(document.getElementById('filtroCapacidadeInput').value.trim());
    renderMesas(capacidade && capacidade > 0 ? capacidade : null);
}, 10000);

function abrirModalReservasFuturas(mesa) {
    const modal = document.getElementById('reservasFuturasModal');
    const detalhesDiv = document.getElementById('detalhesReservasFuturas');
    detalhesDiv.innerHTML = '';

    if (mesa.proxima_reserva) {
        const r = mesa.proxima_reserva;
        const div = document.createElement('div');
        div.textContent = `Cliente: ${r.nome_cliente} | Mesa: ${mesa.numero} | Data/Horário: ${r.data_reserva}`;
        detalhesDiv.appendChild(div);
    }

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
}


function fecharModal() {
    document.getElementById('comandaModal').style.display = 'none';
}

// Abrir, visualizar e fechar comandas (mesmo código que você já tinha)
document.getElementById('visualizarComandasBtn').addEventListener('click', async () => {
    const mesaId = parseInt(document.getElementById('mesaIdInput').value);
    try {
        const res = await fetch(`/mesa/${mesaId}/comandas`);
        const data = await res.json();
        if (!res.ok) { alert(data.error || "Erro ao carregar comandas"); return; }
        if (!data.comandas || data.comandas.length === 0) { alert("Não existe nenhuma comanda."); return; }
        fecharModal();
        const comandaIds = data.comandas.map(c => typeof c === 'object' ? c.id : c).join(',');
        window.location.href = `/comandas_page?mesa=${mesaId}&comandas=${comandaIds}`;
    } catch (err) { console.error(err); alert("Erro ao buscar comandas existentes."); }
});

document.getElementById('abrirComandaBtn').addEventListener('click', async () => {
    const quantidade = parseInt(document.getElementById('quantidadeComandasInput').value);
    const mesaId = parseInt(document.getElementById('mesaIdInput').value);
    const maxPessoas = parseInt(document.getElementById('quantidadeComandasInput').getAttribute('max'));
    if (!quantidade || quantidade <= 0) { alert("Digite uma quantidade válida."); return; }
    if (quantidade > maxPessoas) { alert(`A mesa suporta até ${maxPessoas} pessoas.`); return; }
    try {
        const res = await fetch(`/mesa/${mesaId}/comandas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json','X-CSRFToken': getCsrfToken() },
            body: JSON.stringify({ quantidade })
        });
        const data = await res.json();
        if (!res.ok) { alert(data.error || "Erro ao abrir comandas"); return; }
        fecharModal(); await renderMesas();
        const comandaIds = data.comandas.map(c => typeof c === 'object' ? c.id : c).join(',');
        window.location.href = `/comandas_page?mesa=${mesaId}&comandas=${comandaIds}`;
    } catch (error) { console.error("Erro ao abrir comandas:", error); alert("Erro ao abrir comandas."); }
});

document.getElementById('fecharComandasBtn').addEventListener('click', async () => {
    const mesaId = parseInt(document.getElementById('mesaIdInput').value);
    if (!mesaId) return alert('Mesa não selecionada.');
    if (!confirm('Deseja fechar todas as comandas abertas dessa mesa?')) return;
    try {
        const res = await fetch(`/mesa/${mesaId}/comandas`, { method: 'DELETE', headers: { 'X-CSRFToken': getCsrfToken() } });
        const data = await res.json();
        if (!res.ok) return alert(data.error || 'Erro ao fechar comandas.');
        alert(data.msg || 'Comandas fechadas com sucesso!');
        fecharModal(); renderMesas();
    } catch (error) { console.error('Erro ao fechar comandas:', error); alert('Erro na comunicação com o servidor.'); }
});

// Encerrar dia
document.getElementById('encerrarDiaBtn').addEventListener('click', async () => {
    if (!confirm('Tem certeza que deseja encerrar o dia?')) return;
    try {
        const res = await fetch('/encerrar_dia', { method: 'POST', headers: { 'X-CSRFToken': getCsrfToken() } });
        const data = await res.json();
        if (!res.ok) return alert(data.error || 'Erro ao encerrar o dia.');
        alert(data.msg); location.reload();
    } catch (err) { console.error(err); alert('Erro ao conectar com o servidor.'); }
});

function abrirModalReservasFuturas(mesa) {
    const modal = document.getElementById('reservasFuturasModal');
    const detalhesDiv = document.getElementById('detalhesReservasFuturas');
    detalhesDiv.innerHTML = '';

    if (mesa.reservas_futuras && mesa.reservas_futuras.length > 0) {
        mesa.reservas_futuras.forEach(r => {
            const div = document.createElement('div');
            div.textContent = `Cliente: ${r.nome_cliente} | Mesa: ${mesa.numero} | Data/Horário: ${r.data_reserva}`;
            detalhesDiv.appendChild(div);
        });
    } else {
        detalhesDiv.textContent = 'Não há reservas futuras.';
    }

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
}

function fecharModalReservasFuturas() {
    const modal = document.getElementById('reservasFuturasModal');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}


// Inicializa
document.addEventListener('DOMContentLoaded', () => renderMesas());
