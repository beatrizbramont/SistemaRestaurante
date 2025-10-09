document.addEventListener('DOMContentLoaded', () => {
    const mensagemDiv = document.getElementById('mensagemResultado');
    const confirmarBtn = document.getElementById('confirmarBtn');

    const data = JSON.parse(sessionStorage.getItem('resultadoMesa'));
    const pessoas = parseInt(sessionStorage.getItem('pessoas'));

    if (!data) {
        mensagemDiv.innerHTML = "Erro: nenhum dado encontrado.";
        return;
    }

    if (data.mesa) {
        document.getElementById('tituloResultado').innerText = "Mesa disponível!";
        document.getElementById('mensagemSub').innerText = data.mensagem;
        document.getElementById('confirmarBtn').style.display = 'inline-block';
    } else if (data.posicao_fila) {
        document.getElementById('caixaFila').style.display = 'block';
        document.getElementById('posicaoFila').innerText = data.posicao_fila;
    } else {
        document.getElementById('mensagemSub').innerText = data.mensagem;
    }

    confirmarBtn.addEventListener('click', async () => {
        try {
            const res = await fetch('/confirmar_chegada', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pessoas })
            });

            const confirmacao = await res.json();

            if (confirmacao.mensagem) {
                mensagemDiv.innerHTML += `<br><strong>${confirmacao.mensagem}</strong>`;
            } else {
                mensagemDiv.innerHTML += `<br><strong>${confirmacao.erro}</strong>`;
            }

            confirmarBtn.style.display = 'none';

        } catch (error) {
            alert("Erro ao confirmar chegada.");
            console.error(error);
        }
    });
});
