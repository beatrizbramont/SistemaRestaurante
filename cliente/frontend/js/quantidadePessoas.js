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

        // 👉 Até 8 → pode ir direto para resultado
        if (pessoas <= 8) {
            window.location.href = "../html/resultadoMesas.html";
        } 
        else {
            // 👉 Mais de 8 → ir para seleção de múltiplas mesas
            window.location.href = "../html/selecionarMesas.html";
        }
    });
});
