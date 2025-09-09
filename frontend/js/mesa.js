const apiUrl = "/mesas";

async function fetchMesas() {
    try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error('Erro ao buscar mesas');
        const mesas = await res.json();
        return mesas;
    } catch (error) {
        console.error(error);
        alert('Falha ao carregar mesas.');
        return [];
    }
}

// Função para atualizar status da mesa via API
async function updateStatus(mesaId, novoStatus, selectElement) {
    try {
        const res = await fetch(`/mesa/${mesaId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: novoStatus })
        });
        if (!res.ok) {
            const errorData = await res.json();
            alert(`Erro ao atualizar status: ${errorData.error || 'Desconhecido'}`);
            // Reverter seleção para valor antigo
            selectElement.value = selectElement.getAttribute('data-old');
            return;
        }
        selectElement.setAttribute('data-old', novoStatus);
        // Atualiza a cor do select para refletir o status
        updateSelectClass(selectElement, novoStatus);
    } catch (error) {
        alert('Erro na comunicação com o servidor.');
        // Reverter seleção para valor antigo
        selectElement.value = selectElement.getAttribute('data-old');
    }
}

// Atualiza a cor do select conforme status
function updateSelectClass(select, status) {
    select.classList.remove('status-livre', 'status-ocupada', 'status-reservada');
    select.classList.add(`status-${status}`);
}

async function renderMesas() {
    const mesas = await fetchMesas();

    // Ordenar as mesas pelo número
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

        // Status (select)
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

        selectStatus.addEventListener('change', () => {
            updateStatus(mesa.id, selectStatus.value, selectStatus);
        });

        tdStatus.appendChild(selectStatus);
        tr.appendChild(tdStatus);

        tbody.appendChild(tr);
    });
}

// Inicializa a página
document.addEventListener('DOMContentLoaded', () => {
    renderMesas();
});