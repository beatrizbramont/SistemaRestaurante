function abrirModal() {
    document.getElementById('modal-cadastro').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal-cadastro').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    const botaoAdicionar = document.querySelector('.funcionarios-topo-botao');

    if (botaoAdicionar) {
        botaoAdicionar.addEventListener('click', abrirModal);
    }

    document.addEventListener('keydown', function (event) {
        const modal = document.getElementById('modal-cadastro');

        if (event.key === 'Escape' && modal.style.display === 'flex') {
            fecharModal();
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const input = document.getElementById("imagem");
    const fileName = document.getElementById("file-name");
    const preview = document.getElementById("preview-img");

    if (input) {
        input.addEventListener("change", function () {
            const file = this.files[0];

            if (file) {
                fileName.textContent = file.name;

                const reader = new FileReader();
                reader.onload = function (e) {
                    preview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                fileName.textContent = "Nenhum arquivo selecionado";
                preview.src = "https://cdn-icons-png.flaticon.com/512/66/66779.png";
            }
        });
    }
});
