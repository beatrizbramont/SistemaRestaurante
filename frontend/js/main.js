document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('cardapio-form');
  const list = document.getElementById('cardapio-list');
  const loadBtn = document.getElementById('load-data');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const modal = document.getElementById('modal-cardapio');
  const closeModalBtn = document.getElementById('close-modal');
  const listaCategoriasDiv = document.getElementById('lista-categorias');

  // Abrir/Fechar menu lateral
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', (e) => {
      e.preventDefault();
      sidebar.classList.toggle('hidden');
    });
  }

  // Submit do formulário (salvar)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
      nome: form.nome.value.trim(),
      preco: parseFloat(form.preco.value),
      categoria: form.categoria.value,
      tempo_preparo: parseInt(form.tempo_preparo.value)
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
        form.classList.add('hidden');
        // NÃO chama carregarCardapio aqui
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao cadastrar item.');
      });
  });

  // Função para abrir o modal com itens agrupados
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

        listaCategoriasDiv.innerHTML = ''; // limpa conteúdo anterior

        // Agrupar por categoria
        const agrupados = data.reduce((acc, item) => {
          if (!acc[item.categoria]) acc[item.categoria] = [];
          acc[item.categoria].push(item);
          return acc;
        }, {});

        // Criar as seções por categoria
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

        modal.classList.remove('hidden'); // mostra o modal
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao carregar categorias.');
      });
  }

  // Evento para abrir modal ao clicar no botão
  if (loadBtn) {
    loadBtn.addEventListener('click', abrirModalCategorias);
  }

  // Fechar modal com o botão X
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
    });
  }

  // Fechar modal ao clicar fora do conteúdo
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
    }
  });

  // REMOVIDO para evitar mostrar cardápio automaticamente
  // carregarCardapio();
});
