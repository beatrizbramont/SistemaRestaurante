let pessoasSelecionadas = null;

document.addEventListener('DOMContentLoaded', () => {
    const botoes = document.querySelectorAll('.opcao');
    const enviarBtn = document.getElementById('enviarBtn');

    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            botoes.forEach(b => b.classList.remove('selecionada'));
            botao.classList.add('selecionada');
            pessoasSelecionadas = parseInt(botao.dataset.pessoas);
            enviarBtn.disabled = false;
        });
    });

    enviarBtn.addEventListener('click', async () => {
        if (!pessoasSelecionadas) return;

        try {
            const res = await fetch(`/consultar_mesa?pessoas=${pessoasSelecionadas}&acao=entrada`);
            const data = await res.json();

            // Armazena os dados no sessionStorage para passar para a próxima tela
            sessionStorage.setItem('resultadoMesa', JSON.stringify(data));
            sessionStorage.setItem('pessoas', pessoasSelecionadas);

            window.location.href = '../html/resultado.html';

        } catch (error) {
            alert("Erro ao consultar mesa.");
            console.error(error);
        }
    });
});
