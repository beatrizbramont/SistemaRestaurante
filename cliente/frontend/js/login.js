document.addEventListener("DOMContentLoaded", () => {
    const btnEntrar = document.querySelector('input[type="button"]');

    btnEntrar.addEventListener("click", async () => {
        const email = document.getElementById("email").value.trim();
        const senha = document.getElementById("senha").value.trim();

        if (!email || !senha) {
            alert("Preencha todos os campos!");
            return;
        }

        try {
            const resposta = await fetch("http://127.0.0.1:8002/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha })
            });

            const data = await resposta.json();
            console.log("RESPOSTA LOGIN:", data);

            if (!resposta.ok) {
                alert(data.erro || "Erro ao realizar login.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("usuario", JSON.stringify(data.usuario));

            alert("Login realizado com sucesso!");

            window.location.href = "../html/home.html";

        } catch (error) {
            console.error(error);
            alert("Erro ao conectar com o servidor.");
        }
    });
});
