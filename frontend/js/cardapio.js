document.addEventListener('DOMContentLoaded', () => {
  // Referências DOM
  const form = document.getElementById('cardapio-form');
  const nomeInput = document.getElementById('nome');
  const precoInput = document.getElementById('preco');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const categoriaSelect = document.getElementById('categoria');
  const ingredientesInput = document.getElementById('ingredientes');
  const tempoPreparoInput = document.getElementById('tempo_preparo');
  atualizarContadoresCategorias();


  const modalCategoria = document.getElementById('modal-categoria');
  const closeModalCategoriaBtn = document.getElementById('close-modal-categoria');
  const modalCategoriaTitulo = document.getElementById('modal-categoria-titulo');
  const modalCategoriaLista = document.getElementById('modal-categoria-lista');
  const loadBtn = document.getElementById('load-data');

  // Função genérica de fetch
  async function apiFetch(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return res.json();
  }

  // Sidebar toggle
  menuToggle.addEventListener('click', e => {
    e.preventDefault();
    sidebar.classList.toggle('hidden');
  });

  // Abrir modal de categoria com itens
  async function abrirModalCategoria(categoria, titulo = null) {
    try {
      const data = await apiFetch('/cardapio');
      let itens = categoria ? data.filter(item => item.categoria === categoria) : data;

      modalCategoriaTitulo.textContent = titulo || categoria || 'Todos os Itens';
      modalCategoriaLista.innerHTML = '';

      if (!itens.length) {
        const li = document.createElement('li');
        li.textContent = 'Nenhum item cadastrado.';
        li.classList.add('empty-item');
        modalCategoriaLista.appendChild(li);
      } else {
        // Agrupa por categoria se for modal geral
        const agrupados = categoria ? { [categoria]: itens } : itens.reduce((acc, item) => {
          if (!acc[item.categoria]) acc[item.categoria] = [];
          acc[item.categoria].push(item);
          return acc;
        }, {});

        for (const cat in agrupados) {
          if (!categoria) {
            const h4 = document.createElement('h4');
            h4.textContent = cat;
            h4.classList.add('categoria-titulo');
            modalCategoriaLista.appendChild(h4);
          }

          agrupados[cat].forEach(item => {
            const li = document.createElement('li');
            li.classList.add('item-cardapio-modal');
            li.innerHTML = `
              <div class="item-info">
                <span class="item-nome">${item.nome} - </span>
                <span class="item-ingredientes">${item.ingredientes} - </span>
                <span class="item-preco">R$ ${parseFloat(item.preco).toFixed(2)} - </span>
                <span class="item-tempo">${item.tempo_preparo} min</span>
              </div>
              <div class="item-actions">
                <i class="fas fa-pen-to-square edit-icon" title="Editar"></i>
                <i class="fas fa-trash delete-icon" title="Excluir"></i>
              </div>
            `;

            // Editar item
            li.querySelector('.edit-icon').addEventListener('click', () => {
              nomeInput.value = item.nome;
              ingredientesInput.value = item.ingredientes;
              precoInput.value = item.preco;
              categoriaSelect.value = item.categoria;
              tempoPreparoInput.value = item.tempo_preparo;
              form.dataset.editingId = item.id;
              form.querySelector('button[type="submit"]').textContent = 'Atualizar';
              modalCategoria.classList.add('hidden');
            });

            // Excluir item
            li.querySelector('.delete-icon').addEventListener('click', async () => {
              if (!confirm(`Deseja excluir "${item.nome}"?`)) return;
              try {
                await apiFetch(`/cardapio/${item.id}`, { method: 'DELETE' });
                console.log(`"${item.nome}" excluído.`);
                abrirModalCategoria(categoria, titulo); // Recarrega lista
                atualizarContadoresCategorias();
              } catch {
                alert('Erro ao excluir item.');
              }
            });

            modalCategoriaLista.appendChild(li);
          });
        }
      }

      modalCategoria.classList.remove('hidden');
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar itens da categoria.');
    }
  }

  // Fechar modal
  closeModalCategoriaBtn.addEventListener('click', () => {
    modalCategoria.classList.add('hidden');
  });

  window.addEventListener('click', e => {
    if (e.target === modalCategoria) modalCategoria.classList.add('hidden');
  });

  // Links do sidebar
  sidebar.querySelectorAll('a[data-categoria]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const categoria = link.getAttribute('data-categoria');
      abrirModalCategoria(categoria);
      sidebar.classList.add('hidden');
    });
  });

  // Botão “Carregar Cardápio” → mostra todos os itens agrupados
  loadBtn.addEventListener('click', () => abrirModalCategoria(null, 'Todos os Itens'));

  // Cadastrar ou atualizar item
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const data = {
      nome: nomeInput.value.trim(),
      ingredientes: ingredientesInput.value.trim(),
      preco: parseFloat(precoInput.value),
      categoria: categoriaSelect.value,
      tempo_preparo: parseInt(tempoPreparoInput.value)
    };

    if (!data.nome || isNaN(data.preco) || !data.categoria || isNaN(data.tempo_preparo)) {
      alert('Preencha todos os campos corretamente.');
      return;
    }

    try {
      if (form.dataset.editingId) {
        const res = await apiFetch(`/cardapio/${form.dataset.editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        alert(res.msg || 'Item atualizado com sucesso.');
        delete form.dataset.editingId;
        form.querySelector('button[type="submit"]').textContent = 'Salvar';
      } else {
        const res = await apiFetch('/cardapio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        alert(res.msg || 'Item cadastrado com sucesso.');
      }
      form.reset();
      atualizarContadoresCategorias();
    } catch {
      alert('Erro ao salvar item.');
    }
  });
});

async function atualizarContadoresCategorias() {
  try {
    const data = await fetch('/cardapio').then(res => res.json());

    // Conta os itens por categoria
    const contadores = data.reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + 1;
      return acc;
    }, {});

    // Atualiza os links do sidebar
    document.querySelectorAll('#sidebar a[data-categoria]').forEach(link => {
      const cat = link.getAttribute('data-categoria');
      const total = contadores[cat] || 0;

      // Remove contador antigo, se houver
      const oldSpan = link.querySelector('.contador');
      if (oldSpan) oldSpan.remove();

      // Cria novo contador
      const span = document.createElement('span');
      span.classList.add('contador');
      span.textContent = `(${total})`;
      link.appendChild(span);
    });

  } catch (err) {
    console.error('Erro ao atualizar contadores:', err);
  }
}