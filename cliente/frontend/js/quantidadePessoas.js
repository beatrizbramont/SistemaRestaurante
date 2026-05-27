document.addEventListener("DOMContentLoaded", () => {

    const btn = document.querySelector("#consultarBtn");
    const input = document.querySelector("#inputPessoas");
    const erro = document.querySelector("#erro");

    btn.addEventListener("click", async () => {
        const pessoas = parseInt(input.value);

        // 🔹 Valida se o campo está vazio, menor que 1 ou acima do novo limite de 20
        if (!pessoas || pessoas < 1 || pessoas > 20) {
            erro.textContent = "A capacidade máxima por reserva é de até 20 pessoas.";
            return;
        }

        sessionStorage.setItem("pessoas", pessoas);

        // 🟢 Agora todos os grupos de até 20 pessoas vão para a mesma tela de resultado
        window.location.href = "../html/resultadoMesas.html";
    });
});
