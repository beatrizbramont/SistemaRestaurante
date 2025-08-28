    document.getElementById('load-data').addEventListener('click', () => {
        fetch('/api/cardapio')  // Ajuste essa rota para sua API real
            .then(res => {
                if (!res.ok) throw new Error('Erro ao carregar dados');
                return res.json();
            })
            .then(data => {
                const list = document.getElementById('cardapio-list');
                list.innerHTML = '';
                data.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = `${item.nome} - R$ ${item.preco}`;
                    list.appendChild(li);
                });
            })
            .catc
    })