const apiUrl = "/mesas";

// Busca as mesas da API
async function fetchMesas(capacidade = null) {
    try {
        const url = (capacidade && Number.isInteger(capacidade) && capacidade > 0)
            ? `/mesas/disponiveis?capacidade=${capacidade}`
            : apiUrl;

        console.log("URL da requisição:", url);

        const res = await fetch(url);
        const mesas = await res.json();

        console.log("Mesas retornadas:", mesas); // ADICIONE ESTA LINHA

        if (!res.ok) throw new Error('Erro ao buscar mesas');
        return mesas;
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
            headers: { 'Content-Type': 'application/json' },
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

function abrirModalComandas(mesaId, capacidade) {
    document.getElementById('mesaIdInput').value = mesaId;
    document.getElementById('quantidadeComandasInput').value = '';
    document.getElementById('quantidadeComandasInput').setAttribute('max', capacidade);
    document.getElementById('comandaModal').style.display = 'flex';
}

// Fecha modal
function fecharModal() {
    document.getElementById('comandaModal').style.display = 'none';
}

// Abrir comanda com verificação de capacidade
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
        const res = await fetch(`/mesa/${mesaId}/comandas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantidade })
        });

        const data = await res.json();
        if (!res.ok) {
            alert(data.error || "Erro ao abrir comandas");
            return;
        }

        fecharModal();

        // Redireciona para comandas.html
        const comandaIds = data.comandas.join(',');
        window.location.href = `/frontend/html/comandas.html?mesa=${mesaId}&comandas=${comandaIds}`;

    } catch (error) {
        console.error("Erro ao abrir comandas:", error);
        alert("Erro ao abrir comandas.");
    }
});

// Fechar comanda
document.getElementById('fecharComandaBtn').addEventListener('click', async () => {
    const mesaId = parseInt(document.getElementById('mesaIdInput').value);

    try {
        const res = await fetch(`/mesa/${mesaId}/fechar_comanda`, {
            method: 'POST'
        });
        const data = await res.json();
        if (!res.ok) {
            alert(data.error || "Erro ao fechar comanda");
            return;
        }

        alert("Comanda fechada com sucesso");
        fecharModal();
        renderMesas(); // Atualiza tabela
    } catch (error) {
        console.error("Erro ao fechar comanda:", error);
        alert("Erro ao fechar comanda.");
    }
});

// Filtro por capacidade
document.getElementById('filtroCapacidadeForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('filtroCapacidadeInput');
    const capacidade = parseInt(input.value.trim());

    console.log("Capacidade inserida:", capacidade);

    if (!capacidade || isNaN(capacidade) || capacidade < 1) {
        alert("Digite uma capacidade válida.");
        return;
    }

    renderMesas(capacidade);
});

// Botão de limpar filtro
function limparFiltro() {
    document.getElementById('filtroCapacidadeInput').value = '';
    renderMesas(); // Recarrega todas as mesas
}

// Inicializa a página
document.addEventListener('DOMContentLoaded', () => renderMesas());