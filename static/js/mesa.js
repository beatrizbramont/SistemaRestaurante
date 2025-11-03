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

        console.log("URL da requisição:", url);

        const res = await fetch(url);
        const mesas = await res.json();

        console.log("Mesas retornadas:", mesas);

        if (!res.ok) throw new Error('Erro ao buscar mesas');
        return mesas.mesas || mesas; // caso a API retorne {mesas: [...]}
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

        if (!res.ok) {
            const errorData = await res.json();
            alert(`Erro ao atualizar status: ${errorData.error || 'Desconhecido'}`);
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

// Renderiza a tabela de mesas
async function renderMesas(capacidade = null) {
    const mesas = await fetchMesas(capacidade);
    mesas.sort((a, b) => a.numero - b.numero);

    const tbody = document.querySelector('#mesas-table tbody');
    tbody.innerHTML = '';

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

        // Botão de Comandas
        const tdComandas = document.createElement('td');
        const btnComandas = document.createElement('button');
        btnComandas.textContent = 'Comandas';
        btnComandas.className = 'btn-comanda';
        btnComandas.addEventListener('click', () => abrirModalComandas(mesa.id, mesa.capacidade));
        tdComandas.appendChild(btnComandas);
        tr.appendChild(tdComandas);

        // Status
        const tdStatus = document.createElement('td');
        const selectStatus = document.createElement('select');
        selectStatus.setAttribute('aria-label', `Alterar status da mesa ${mesa.numero}`);
        ['livre', 'ocupada', 'reservada'].forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            if (mesa.status === status) option.selected = true;
            selectStatus.appendChild(option);
        });
        selectStatus.setAttribute('data-old', mesa.status);
        updateSelectClass(selectStatus, mesa.status);
        selectStatus.addEventListener('change', () => updateStatus(mesa.id, selectStatus.value, selectStatus));
        tdStatus.appendChild(selectStatus);
        tr.appendChild(tdStatus);

        tbody.appendChild(tr);
    });
}

// ---------------- Modal Comandas ----------------

function abrirModalComandas(mesaId, capacidade) {
    document.getElementById('mesaIdInput').value = mesaId;
    const qtdInput = document.getElementById('quantidadeComandasInput');
    qtdInput.value = '';
    qtdInput.setAttribute('max', capacidade);
    document.getElementById('comandaModal').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('comandaModal').style.display = 'none';
}

// Visualizar comandas já abertas
document.getElementById('visualizarComandasBtn').addEventListener('click', async () => {
    const mesaId = parseInt(document.getElementById('mesaIdInput').value);
    try {
        const res = await fetch(`/mesa/${mesaId}/comandas`);
        const data = await res.json();

        if (!res.ok) {
            alert(data.error || "Erro ao carregar comandas");
            return;
        }

        if (!data.comandas || data.comandas.length === 0) {
            alert("Não existe nenhuma comanda anexada a esta mesa.");
            return;
        }

        fecharModal();

        // Garante que comandaIds é uma lista de IDs puros
        const comandaIds = data.comandas.map(c => typeof c === 'object' ? c.id : c).join(',');
        window.location.href = `/comandas_page?mesa=${mesaId}&comandas=${comandaIds}`;
    } catch (err) {
        console.error(err);
        alert("Erro ao buscar comandas existentes.");
    }
});

// Abrir comandas
document.getElementById('abrirComandaBtn').addEventListener('click', async () => {
    const quantidade = parseInt(document.getElementById('quantidadeComandasInput').value);
    const mesaId = parseInt(document.getElementById('mesaIdInput').value);
    const maxPessoas = parseInt(document.getElementById('quantidadeComandasInput').getAttribute('max'));

    if (!quantidade || quantidade <= 0) {
        alert("Digite uma quantidade válida.");
        return;
    }

    if (quantidade > maxPessoas) {
        alert(`A mesa suporta até ${maxPessoas} pessoas.`);
        return;
    }

    try {
        // POST para criar novas comandas
        const res = await fetch(`/mesa/${mesaId}/comandas`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken()
            },
            body: JSON.stringify({ quantidade })
        });

        const data = await res.json();
        if (!res.ok) {
            alert(data.error || "Erro ao abrir comandas");
            return;
        }

        // Fecha modal e recarrega mesas
        fecharModal();
        await renderMesas();

        // Navega para a página das comandas
        const comandaIds = data.comandas.map(c => typeof c === 'object' ? c.id : c).join(',');
        window.location.href = `/comandas_page?mesa=${mesaId}&comandas=${comandaIds}`;
    } catch (error) {
        console.error("Erro ao abrir comandas:", error);
        alert("Erro ao abrir comandas.");
    }
});

// ---------------- Filtros e ações ----------------

// Filtro por capacidade
document.getElementById('filtroCapacidadeForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const capacidade = parseInt(document.getElementById('filtroCapacidadeInput').value.trim());
    if (!capacidade || capacidade < 1) return alert("Digite uma capacidade válida.");
    renderMesas(capacidade);
});

// Botão de limpar filtro
function limparFiltro() {
    document.getElementById('filtroCapacidadeInput').value = '';
    renderMesas();
}

// Fechar todas as comandas
document.getElementById('fecharComandasBtn').addEventListener('click', async () => {
    const mesaId = parseInt(document.getElementById('mesaIdInput').value);
    if (!mesaId) return alert('Mesa não selecionada.');

    if (!confirm('Deseja fechar todas as comandas abertas dessa mesa?')) return;

    try {
        const res = await fetch(`/mesa/${mesaId}/comandas`, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': getCsrfToken() }
        });

        const data = await res.json();
        if (!res.ok) return alert(data.error || 'Erro ao fechar comandas.');

        alert(data.msg || 'Comandas fechadas com sucesso!');
        fecharModal();
        renderMesas();
    } catch (error) {
        console.error('Erro ao fechar comandas:', error);
        alert('Erro na comunicação com o servidor.');
    }
});

// Encerrar dia
document.getElementById('encerrarDiaBtn').addEventListener('click', async () => {
    if (!confirm('Tem certeza que deseja encerrar o dia?')) return;

    try {
        const res = await fetch('/encerrar_dia', { 
            method: 'POST',
            headers: { 'X-CSRFToken': getCsrfToken() }
        });

        const data = await res.json();
        if (!res.ok) return alert(data.error || 'Erro ao encerrar o dia.');

        alert(data.msg);
        location.reload();
    } catch (err) {
        console.error(err);
        alert('Erro ao conectar com o servidor.');
    }
});

// Inicializa a página
document.addEventListener('DOMContentLoaded', () => renderMesas());
