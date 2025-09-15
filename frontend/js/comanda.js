document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mesaId = urlParams.get('mesa');
    const container = document.getElementById('comandasContainer');

    if (!mesaId) {
        container.innerHTML = "<p>ID da mesa não encontrado.</p>";
        return;
    }

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

        comandas.forEach((comanda, index) => {
            const comandaDiv = document.createElement('div');
            comandaDiv.classList.add('comanda');
            comandaDiv.setAttribute('data-id', comanda.id);

            comandaDiv.innerHTML = `
            <h2>Comanda #${index + 1}</h2>
            <p>ID: ${comanda.id}</p>
            <p>Nome: <input type="text" value="${comanda.nome || ''}"></p>
            <button class="fecharComandaBtn">Fechar esta Comanda</button>
        `;

            container.appendChild(comandaDiv);
        });

        // ✅ Coloque o event listener AQUI dentro, após o container existir
        container.addEventListener('click', async (event) => {
            if (!event.target.classList.contains('fecharComandaBtn')) return;

            const comandaDiv = event.target.closest('.comanda');
            const comandaId = comandaDiv?.getAttribute('data-id');

            if (!comandaId) {
                alert('ID da comanda não encontrado.');
                return;
            }

            if (!confirm(`Deseja fechar a comanda #${comandaId}?`)) return;

            try {
                const res = await fetch(`/comanda/${comandaId}/fechar`, {
                    method: 'POST',
                });

                const data = await res.json();

                if (!res.ok) {
                    if (res.status === 404) {
                        alert('Comanda não encontrada. Ela já pode ter sido fechada.');
                        comandaDiv.remove();
                    } else {
                        alert(data.error || 'Erro ao fechar comanda.');
                    }
                    return;
                }

                alert(data.msg || 'Comanda fechada com sucesso!');
                comandaDiv.remove();

                const comandasRestantes = container.querySelectorAll('.comanda');
                if (comandasRestantes.length === 0) {
                    window.location.href = '/html/mesapage.html';
                }

            } catch (error) {
                console.error('Erro ao fechar comanda:', error);
                alert('Erro na comunicação com o servidor.');
            }
        });

    } catch (error) {
        console.error('Erro ao buscar comandas:', error);
        container.innerHTML = "<p>Erro ao carregar comandas.</p>";
    }
    // Criar botão "Fechar todas as comandas"
    const fecharTodasBtn = document.createElement('button');
    fecharTodasBtn.textContent = 'Fechar comandas';
    fecharTodasBtn.id = 'fecharTodasBtn';
    fecharTodasBtn.style.marginTop = '20px';
    container.appendChild(fecharTodasBtn);

    // Adicionar listener ao botão
    fecharTodasBtn.addEventListener('click', async () => {
        if (!confirm('Tem certeza que deseja fechar TODAS as comandas desta mesa?')) return;

        try {
            const res = await fetch(`/mesa/${mesaId}/comandas`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Erro ao fechar todas as comandas.');
                return;
            }

            alert(data.msg || 'Todas as comandas foram fechadas!');
            window.location.href = '/html/mesapage.html';

        } catch (error) {
            console.error('Erro ao fechar todas as comandas:', error);
            alert('Erro na comunicação com o servidor.');
        }
    });

});