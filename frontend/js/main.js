document.addEventListener('DOMContentLoaded', () => {
  // Referências DOM
  const form = document.getElementById('cardapio-form');
  const list = document.getElementById('cardapio-list');
  const nomeInput = document.getElementById('nome');
  const precoInput = document.getElementById('preco');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const categoriaSelect = document.getElementById('categoria');
  const tempoPreparoInput = document.getElementById('tempo_preparo');
  const loadBtn = document.getElementById('load-data');
  const modal = document.getElementById('modal-cardapio');
  const closeModalBtn = document.getElementById('close-modal');
  const listaCategoriasDiv = document.getElementById('lista-categorias');

  // Função para mostrar/esconder sidebar
  function toggleSidebar(e) {
    e.preventDefault();
    sidebar.classList.toggle('hidden');
  }

  // Função para criar o botão excluir com evento e estilo
  function criarBotaoExcluir(item, categoria) {
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Excluir';
  deleteBtn.classList.add('delete-btn');
  
  // Força visibilidade
  deleteBtn.style.marginLeft = '10px';
  deleteBtn.style.backgroundColor = 'red';
  deleteBtn.style.color = 'white';
  deleteBtn.style.border = '2px solid yellow';
  deleteBtn.style.fontWeight = 'bold';

  deleteBtn.addEventListener('click', () => {
    if (!confirm(`Deseja realmente excluir o item "${item.nome}"?`)) return;

    fetch(`/cardapio/${item.id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao excluir item.');
        alert(`Item "${item.nome}" excluído com sucesso.`);
        carregarItensPorCategoria(categoria); // atualiza lista
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao excluir item.');
      });
  });

  return deleteBtn;
}


  function carregarItensPorCategoria(categoria) {
  fetch('/cardapio')
    .then(res => {
      if (!res.ok) throw new Error('Erro ao buscar itens.');
      return res.json();
    })
    .then(data => {
      const filtrados = data.filter(item => item.categoria === categoria);

      if (!filtrados.length) {
        alert(`Nenhum item encontrado para categoria "${categoria}".`);
        list.innerHTML = '';
        list.style.display = 'none';
        return;
      }

      list.style.display = 'flex';
      list.innerHTML = '';

      filtrados.forEach(item => {
        const li = document.createElement('li');

        // Insere texto separado para não apagar o botão
        const textoSpan = document.createElement('span');
        textoSpan.textContent = `${item.nome} - R$ ${parseFloat(item.preco).toFixed(2)} - ${item.tempo_preparo} min`;
        li.appendChild(textoSpan);


        const deleteBtn = criarBotaoExcluir(item, categoria);
        li.appendChild(deleteBtn);

        list.appendChild(li);
      });
    })
    .catch(err => {
      console.error(err);
      alert('Erro ao carregar itens da categoria.');
    });
}
  // Função para cadastrar novo item
  function cadastrarItem(e) {
    e.preventDefault();

    const data = {
      nome: nomeInput.value.trim(),
      preco: parseFloat(precoInput.value),
      categoria: categoriaSelect.value,
      tempo_preparo: parseInt(tempoPreparoInput.value)
    };

    if (!data.nome || isNaN(data.preco) || !data.categoria || isNaN(data.tempo_preparo)) {
      alert('Preencha todos os campos corretamente.');
      return;
    }

    fetch('/cardapio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao cadastrar.');
        return res.json();
      })
      .then(data => {
        alert(data.msg || 'Item cadastrado.');
        form.reset();
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao cadastrar item.');
      });
  }

  // Função para abrir modal mostrando itens agrupados por categoria
  function abrirModalCategorias() {
    fetch('/cardapio')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao buscar itens.');
        return res.json();
      })
      .then(data => {
        if (!data.length) {
          alert('Nenhum item cadastrado.');
          return;
        }

        listaCategoriasDiv.innerHTML = '';

        const agrupados = data.reduce((acc, item) => {
          if (!acc[item.categoria]) acc[item.categoria] = [];
          acc[item.categoria].push(item);
          return acc;
        }, {});

        for (const categoria in agrupados) {
          const section = document.createElement('div');
          section.classList.add('categoria-section');

          const h3 = document.createElement('h3');
          h3.textContent = categoria;
          section.appendChild(h3);

          const ul = document.createElement('ul');
          agrupados[categoria].forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.nome} - R$ ${parseFloat(item.preco).toFixed(2)} - ${item.tempo_preparo} min`;
            ul.appendChild(li);
          });

          section.appendChild(ul);
          listaCategoriasDiv.appendChild(section);
        }

        modal.classList.remove('hidden');
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao carregar categorias.');
      });
  }

  // Fechar modal
  function fecharModal() {
    modal.classList.add('hidden');
  }

  // Fechar modal clicando fora do conteúdo
  function clickForaModal(e) {
    if (e.target === modal) {
      fecharModal();
    }
  }

  // Eventos
  menuToggle.addEventListener('click', toggleSidebar);

  // Adiciona evento nos links do sidebar para carregar categoria
  const categoryLinks = sidebar.querySelectorAll('a[data-categoria]');
  categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const categoria = link.getAttribute('data-categoria');
      carregarItensPorCategoria(categoria);
      sidebar.classList.add('hidden');
    });
  });

  form.addEventListener('submit', cadastrarItem);
  loadBtn.addEventListener('click', abrirModalCategorias);
  closeModalBtn.addEventListener('click', fecharModal);
  window.addEventListener('click', clickForaModal);

});
