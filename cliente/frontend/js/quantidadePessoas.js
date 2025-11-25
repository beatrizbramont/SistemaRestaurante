document.addEventListener("DOMContentLoaded", () => {

    const btn = document.querySelector("#consultarBtn");
    const input = document.querySelector("#inputPessoas");
    const erro = document.querySelector("#erro");

    btn.addEventListener("click", async () => {
        const pessoas = parseInt(input.value);

        if (!pessoas || pessoas < 1) {
            erro.textContent = "Informe uma quantidade válida!";
            return;
        }

        sessionStorage.setItem("pessoas", pessoas);

        // Até 8 → vai direto
        if (pessoas <= 8) {
            window.location.href = "../html/resultadoMesas.html";
        } 
        else {
            window.location.href = `${window.location.origin}/html/selecionarMesa.html`;
        }
    });
});
