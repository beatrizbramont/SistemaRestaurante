let comandaAtivaId = null;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mesaId = urlParams.get('mesa');
    const container = document.getElementById('comandasContainer');

    if (!container) {
        console.error('Elemento #comandasContainer não encontrado no HTML.');
        return;
    }

    if (!mesaId) {
        container.innerHTML = "<p>ID da mesa não encontrado.</p>";
        return;
    }

    await carregarComandas(mesaId, container);
    adicionarEventosGlobais(container, mesaId);
});

async function carregarComandas(mesaId, container) {
    try {
        const res = await fetch(`/mesa/${mesaId}/comandas`);
        const data = await res.json();

        if (!res.ok) {
            container.innerHTML = `<p>Erro ao buscar comandas: ${data.error || 'Erro desconhecido'}</p>`;
            return;
        }

        const comandas = data.comandas.filter(c => c.aberta);

        if (comandas.length === 0) {
            container.innerHTML = "<p>Nenhuma comanda aberta.</p>";
            return;
        }

        container.innerHTML = ''; // limpa antes

        for (const [index, comanda] of comandas.entries()) {
            const comandaDiv = await criarComandaDiv(comanda, index);
            container.appendChild(comandaDiv);
        }

    } catch (error) {
        console.error('Erro ao buscar comandas:', error);
        container.innerHTML = "<p>Erro ao carregar comandas.</p>";
    }
}

async function criarComandaDiv(comanda, index) {
    const comandaDiv = document.createElement('div');
    comandaDiv.classList.add('comanda');
    comandaDiv.setAttribute('data-id', comanda.id);

    comandaDiv.innerHTML = `
        <h2>Comanda #${index + 1}</h2>
        <p>ID: ${comanda.id}</p>
        <p>Nome: <input type="text" class="nomeInput" value="${comanda.nome || ''}"></p>

        <ul class="lista-itens-comanda"></ul>

        <div class="adicionar-item-container">
            <select class="select-produto">
                <option value="" disabled selected>Selecione um produto</option>
            </select>
            <input type="number" class="quantidade-item" value="1" min="1" />
            <button class="adicionar-item-comanda-btn">Adicionar Item</button>
            <p class="total-comanda">Total: ${comanda.total}</p>
        </div>

        <button class="fecharComandaBtn">Fechar Comanda</button>
    `;

    // Editar nome
    comandaDiv.querySelector('.nomeInput').addEventListener('blur', () => {
        const novoNome = comandaDiv.querySelector('.nomeInput').value.trim();
        atualizarNomeComanda(comanda.id, novoNome);
    });

    // Preencher produtos
    await preencherProdutosCardapio(comandaDiv);

    // Adicionar item
    comandaDiv.querySelector('.adicionar-item-comanda-btn').addEventListener('click', async () => {
        const produtoId = comandaDiv.querySelector('.select-produto').value;
        const quantidade = parseInt(comandaDiv.querySelector('.quantidade-item').value);

        if (!produtoId || quantidade < 1) {
            alert('Selecione um produto e uma quantidade válida.');
            return;
        }

        try {
            const res = await fetch(`/Cp/${comanda.id}/itens`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ produto_id: produtoId, quantidade })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Erro ao adicionar item');
            } else {
                await carregarItensComanda(comanda.id, comandaDiv);
            }
        } catch (error) {
            console.error('Erro ao adicionar item:', error);
            alert('Erro ao adicionar item');
        }
    });

    // Carregar itens já existentes
    await carregarItensComanda(comanda.id, comandaDiv);

    return comandaDiv;
}

async function preencherProdutosCardapio(comandaDiv) {
  const select = comandaDiv.querySelector('.select-produto');
  if (!select) return;

  try {
    const res = await fetch('/cardapio');
    const data = await res.json();

    if (!res.ok) {
      alert('Erro ao carregar cardápio');
      return;
    }

    // Agrupa produtos por categoria
    const grupos = data.reduce((acc, item) => {
      (acc[item.categoria] ||= []).push(item);
      return acc;
    }, {});

    // Limpa select e coloca placeholder
    select.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Selecione um produto';
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    // Para cada categoria cria um optgroup
    for (const cat in grupos) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = cat; // nome da categoria

      grupos[cat].forEach(prod => {
        const opt = document.createElement('option');
        opt.value = prod.id;
        opt.textContent = `${prod.nome} — R$ ${parseFloat(prod.preco).toFixed(2)}`;
        optgroup.appendChild(opt);
      });

      select.appendChild(optgroup);
    }
  } catch (error) {
    console.error('Erro ao carregar cardápio:', error);
  }
}

async function carregarItensComanda(comandaId, comandaDiv) {
  const listaItens = comandaDiv.querySelector('.lista-itens-comanda');
  const totalEl = comandaDiv.querySelector('.total-comanda');

  try {
    const res = await fetch(`/Cp/${comandaId}/itens`);
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Erro ao carregar itens da comanda');
      return;
    }

    listaItens.innerHTML = '';
    data.itens.forEach(item => {
      const li = document.createElement('li');
      li.classList.add('item-comanda');

      li.innerHTML = `
        <span>${item.quantidade} x ${item.nome} — R$ ${item.preco_unitario.toFixed(2)} cada — Subtotal: R$ ${item.subtotal.toFixed(2)}</span>
        <span class="item-actions">
          <i class="fas fa-pen-to-square edit-icon" title="Editar"></i>
          <i class="fas fa-trash delete-icon" title="Excluir"></i>
        </span>
      `;

      // Editar item
      li.querySelector('.edit-icon').addEventListener('click', () => {
        // aqui você abre um modal/form para editar quantidade ou produto
        const novaQtd = prompt(`Nova quantidade para ${item.nome}:`, item.quantidade);
        if (novaQtd !== null) {
          fetch(`/Cp/${comandaId}/itens/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantidade: novaQtd })
          })
          .then(r => r.json())
          .then(() => carregarItensComanda(comandaId, comandaDiv))
          .catch(() => alert('Erro ao atualizar item'));
        }
      });

      // Excluir item
      li.querySelector('.delete-icon').addEventListener('click', () => {
        if (!confirm(`Deseja excluir "${item.nome}"?`)) return;
        fetch(`/Cp/${comandaId}/itens/${item.id}`, { method: 'DELETE' })
          .then(r => r.json())
          .then(() => carregarItensComanda(comandaId, comandaDiv))
          .catch(() => alert('Erro ao excluir item'));
      });

      listaItens.appendChild(li);
    });

    totalEl.textContent = `Total: R$ ${data.total.toFixed(2)}`;
  } catch (error) {
    console.error('Erro ao carregar itens da comanda:', error);
  }
}

function adicionarEventosGlobais(container, mesaId) {
    container.addEventListener('click', async (event) => {
        if (!event.target.classList.contains('fecharComandaBtn')) return;

        const comandaDiv = event.target.closest('.comanda');
        const comandaId = comandaDiv?.getAttribute('data-id');

        if (!comandaId) {
            alert('ID da comanda não encontrado.');
            return;
        }

        if (!confirm(`Deseja fechar a comanda #${comandaId}?`)) return;

        await fecharComanda(comandaId, comandaDiv, container);
    });

    // Botão para fechar todas
    let fecharTodasBtn = document.getElementById('fecharTodasBtn');
    if (!fecharTodasBtn) {
        fecharTodasBtn = document.createElement('button');
        fecharTodasBtn.textContent = 'Fechar todas as comandas';
        fecharTodasBtn.id = 'fecharTodasBtn';
        fecharTodasBtn.style.marginTop = '20px';
        container.appendChild(fecharTodasBtn);

        fecharTodasBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja fechar TODAS as comandas desta mesa?')) {
                fecharTodasAsComandas(mesaId);
            }
        });
    }
}

async function atualizarNomeComanda(comandaId, novoNome) {
    try {
        await fetch(`/comanda/${comandaId}/nome`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ nome: novoNome })
        });
    } catch (error) {
        console.error('Erro ao atualizar nome da comanda:', error);
    }
}

async function fecharComanda(comandaId, comandaDiv, mesaId) {
    try {
        const res = await fetch(`/comanda/${comandaId}/fechar`, { method: 'POST' });
        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Erro ao fechar comanda.');
            return;
        }

        // Remove a comanda da tela
        if (comandaDiv) comandaDiv.remove();

        // Atualiza o status da mesa automaticamente
        if (typeof renderMesas === 'function' && mesaId) {
            renderMesas(); // isso vai atualizar a tabela de mesas
        }

    } catch (error) {
        console.error('Erro ao fechar comanda:', error);
        alert('Erro ao fechar comanda');
    }
}

async function fecharTodasAsComandas(mesaId) {
    const container = document.getElementById('comandasContainer'); // pega o container

    try {
        const res = await fetch(`/mesa/${mesaId}/comandas`, { method: 'DELETE' });
        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Erro ao fechar comandas.');
            return;
        }

        alert(data.msg || 'Comandas fechadas com sucesso!');

        // Atualiza lista das comandas na tela
        if (container) {
            await carregarComandas(mesaId, container);
        }

        if (typeof renderMesas === 'function') {
            renderMesas();
        }

    } catch (error) {
        console.error('Erro ao fechar todas as comandas:', error);
        alert('Erro na comunicação com o servidor.');
    }
}

