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

  // Imagem no forms
  const inputImagem = document.getElementById("imagem");
  const fileName = document.getElementById("file-name");
  const preview = document.getElementById("preview-img");

  if (inputImagem) {
    inputImagem.addEventListener("change", () => {
      const file = inputImagem.files[0];

      if (file) {
        fileName.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (e) => preview.src = e.target.result;
        reader.readAsDataURL(file);
      } else {
        fileName.textContent = "Nenhum arquivo selecionado";
        preview.src = "https://cdn-icons-png.flaticon.com/512/66/66779.png";
      }
    });
  }

  atualizarContadoresCategorias();

  const modalCategoria = document.getElementById('modal-categoria');
  const closeModalCategoriaBtn = document.getElementById('close-modal-categoria');
  const modalCategoriaTitulo = document.getElementById('modal-categoria-titulo');
  const modalCategoriaLista = document.getElementById('modal-categoria-lista');
  const loadBtn = document.getElementById('load-data');

  // Fetch reutilizável
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

  // Abrir modal por categoria
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
                ${item.imagem ? `<br><img src="/static/uploads/${item.imagem}" width="60" style="margin-top:5px;border-radius:6px;">` : ""}
              </div>
              <div class="item-actions">
                <i class="fas fa-pen-to-square edit-icon" title="Editar"></i>
                <i class="fas fa-trash delete-icon" title="Excluir"></i>
              </div>
            `;

            // EDITAR
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

            // DELETAR
            li.querySelector('.delete-icon').addEventListener('click', async () => {
              if (!confirm(`Deseja excluir "${item.nome}"?`)) return;
              try {
                await apiFetch(`/cardapio/${item.id}`, { method: 'DELETE' });
                abrirModalCategoria(categoria, titulo);
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

  closeModalCategoriaBtn.addEventListener('click', () => modalCategoria.classList.add('hidden'));
  window.addEventListener('click', e => { if (e.target === modalCategoria) modalCategoria.classList.add('hidden') });

  sidebar.querySelectorAll('a[data-categoria]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      abrirModalCategoria(link.getAttribute('data-categoria'));
      sidebar.classList.add('hidden');
    });
  });

  loadBtn.addEventListener('click', () => abrirModalCategoria(null, 'Todos os Itens'));

  // POST ou PUT (com imagem!)
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("nome", nomeInput.value.trim());
    formData.append("ingredientes", ingredientesInput.value.trim());
    formData.append("preco", precoInput.value);
    formData.append("categoria", categoriaSelect.value);
    formData.append("tempo_preparo", tempoPreparoInput.value);

    if (inputImagem && inputImagem.files[0]) {
      formData.append("imagem", inputImagem.files[0]);
    }

    try {
      if (form.dataset.editingId) {
        const res = await fetch(`/cardapio/${form.dataset.editingId}`, {
          method: 'PUT',
          body: formData
        });
        const data = await res.json();
        alert(data.msg || 'Item atualizado com sucesso.');
        delete form.dataset.editingId;
        form.querySelector('button[type="submit"]').textContent = 'Salvar';
      } else {
        const res = await fetch('/cardapio', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        alert(data.msg || 'Item cadastrado com sucesso.');
      }

      form.reset();
      fileName.textContent = "Nenhum arquivo selecionado";
      preview.src = "https://cdn-icons-png.flaticon.com/512/66/66779.png";
      atualizarContadoresCategorias();

    } catch (err) {
      console.error(err);
      alert('Erro ao salvar item.');
    }
  });

});

// Atualiza contadores do sidebar
async function atualizarContadoresCategorias() {
  try {
    const data = await fetch('/cardapio').then(res => res.json());
    const contadores = data.reduce((acc, item) => {
      acc[item.categoria] = (acc[item.categoria] || 0) + 1;
      return acc;
    }, {});

    document.querySelectorAll('#sidebar a[data-categoria]').forEach(link => {
      const cat = link.getAttribute('data-categoria');
      const total = contadores[cat] || 0;
      const oldSpan = link.querySelector('.contador');
      if (oldSpan) oldSpan.remove();
      const span = document.createElement('span');
      span.classList.add('contador');
      span.textContent = `(${total})`;
      link.appendChild(span);
    });

  } catch (err) {
    console.error('Erro ao atualizar contadores:', err);
  }
}
