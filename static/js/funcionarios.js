
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
    const botaoFecharDelete = document.getElementById('fechar-modal-cancel');

    document.querySelectorAll('.deletar_funcionario').forEach(botao => {
        botao.addEventListener('click', () => {
            const id = botao.dataset.id;
            const nome = botao.dataset.nome;


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

const botoesEditar = document.querySelectorAll('.editar_funcionario');
const formAtualizar = document.getElementById("form-atualizar");

const inputNome = document.getElementById("editar-nome");
const inputCargo = document.getElementById("cargoInput");
const inputEmail = document.getElementById("editar-email");
const inputTelefone = document.getElementById("editar-telefone");
const inputSenha = document.getElementById("editar-senha");
const inputImagemEditar = document.getElementById("editar-imagem");
const fileNameEditar = document.getElementById("file-name-editar");
const previewEditar = document.getElementById("preview-img-editar");

botoesEditar.forEach(botao => {
    botao.addEventListener("click", () => {

        const id = botao.dataset.id;

        inputNome.value = botao.dataset.nome;
        inputCargo.value = botao.dataset.cargo;
        inputEmail.value = botao.dataset.email;
        inputTelefone.value = botao.dataset.telefone;
        inputSenha.value = botao.dataset.senha;

        previewEditar.src = botao.dataset.imagem_url || "https://cdn-icons-png.flaticon.com/512/66/66779.png";

        formAtualizar.action = `/funcionario/atualizar/${id}`;

        abrirModal("modal-atualizar");
    });
});

inputImagemEditar.addEventListener("change", () => {
    const file = inputImagemEditar.files[0];

    if (file) {
        fileNameEditar.textContent = file.name;

        const reader = new FileReader();
        reader.onload = e => previewEditar.src = e.target.result;
        reader.readAsDataURL(file);
    }
});

