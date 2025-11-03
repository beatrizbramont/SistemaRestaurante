
const abrirModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
};


const fecharModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
};


const fecharModalEscape = () => {
    document.querySelectorAll('[id^="modal-"]').forEach(modal => {
        if (modal.style.display === 'flex') modal.style.display = 'none';
    });
};

document.addEventListener('DOMContentLoaded', () => {

    const botaoAdicionar = document.querySelector('.funcionarios-topo-botao');
    if (botaoAdicionar) {
        botaoAdicionar.addEventListener('click', () => abrirModal('modal-cadastro'));
    }

    const modalDelete = document.getElementById('modal-delete');
    const formDelete = document.getElementById('delete-form');
    const mensagemDelete = document.getElementById('mensagem-delete');
    const botaoFecharDelete = document.getElementById('fechar-modal');

    document.querySelectorAll('.deletar_funcionario').forEach(botao => {
        botao.addEventListener('click', () => {
            const id = botao.dataset.id;
            const nome = botao.dataset.nome;


            alert(id)
            mensagemDelete.textContent = `Ao executar essa ação, você estará deletando completamente do banco o funcionário: ${nome}. Tem certeza disso? Digite a chave de confirmação.`;
            formDelete.action = `/funcionarios/delete/${id}`;

            abrirModal('modal-delete');
        });
    });

    if (botaoFecharDelete) {
        botaoFecharDelete.addEventListener('click', () => fecharModal('modal-delete'));
    }

    const inputImagem = document.getElementById("imagem");
    const fileName = document.getElementById("file-name");
    const preview = document.getElementById("preview-img");

    if (inputImagem) {
        inputImagem.addEventListener("change", () => {
            const file = inputImagem.files[0];

            if (file) {
                fileName.textContent = file.name;

                const reader = new FileReader();
                reader.onload = (e) => (preview.src = e.target.result);
                reader.readAsDataURL(file);
            } else {
                fileName.textContent = "Nenhum arquivo selecionado";
                preview.src = "https://cdn-icons-png.flaticon.com/512/66/66779.png";
            }
        });
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') fecharModalEscape();
});
