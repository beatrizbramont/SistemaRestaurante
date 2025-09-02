document.addEventListener('DOMContentLoaded', () => {
    const loadBtn = document.getElementById('load-data');
    const list = document.getElementById('cardapio-list');
    const form = document.getElementById('cardapio-form');

    if (!loadBtn || !list || !form) {
        console.error('Elementos necessários (#load-data, #cardapio-list ou #cardapio-form) não encontrados.');
        return;
    }

    function carregarCardapio() {
        fetch('/cardapio')
            .then(res => {
                if (!res.ok) throw new Error('Erro ao carregar dados');
                return res.json();
            })
            .then(data => {
                list.innerHTML = '';
                if (!Array.isArray(data)) {
                    console.warn('Resposta inesperada da API:', data);
                    return;
                }
                data.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = `${item.nome} - R$ ${parseFloat(item.preco).toFixed(2)} (${item.categoria}, ${item.tempo_preparo} min)`;

                    // Criar botão deletar
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Excluir';
                    deleteBtn.style.marginLeft = '10px';
                    deleteBtn.addEventListener('click', () => {
                        if (confirm(`Deseja realmente excluir o item "${item.nome}"?`)) {
                            fetch(`/cardapio/${item.id}`, {
                                method: 'DELETE'
                            })
                            .then(res => {
                                if (!res.ok) throw new Error('Erro ao excluir item');
                                return res.json();
                            })
                            .then(resData => {
                                alert(resData.msg || 'Item excluído com sucesso!');
                                carregarCardapio(); // Atualiza a lista após exclusão
                            })
                            .catch(err => {
                                console.error('Erro ao excluir item:', err);
                                alert('Erro ao excluir item');
                            });
                        }
                    });

                    li.appendChild(deleteBtn);
                    list.appendChild(li);
                });
            })
            .catch(err => {
                console.error('Erro ao carregar dados:', err);
                alert('Erro ao carregar o cardápio.');
            });
    }

    loadBtn.addEventListener('click', carregarCardapio);
    carregarCardapio();

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = {
            nome: document.getElementById('nome').value,
            preco: parseFloat(document.getElementById('preco').value),
            categoria: document.getElementById('categoria').value,
            tempo_preparo: parseInt(document.getElementById('tempo_preparo').value)
        };

        fetch('/cardapio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao cadastrar item');
            return res.json();
        })
        .then(resData => {
            alert(resData.msg || 'Item cadastrado com sucesso!');
            form.reset();
            carregarCardapio();
        })
        .catch(err => {
            console.error('Erro ao cadastrar item:', err);
            alert('Erro ao cadastrar item');
        });
    });
});