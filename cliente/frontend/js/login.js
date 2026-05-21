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
            // CORREÇÃO: Removido o http://127.0.0.1:8002 para funcionar no celular
            const resposta = await fetch("/auth/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    senha: senha
                })

            });

            const data = await resposta.json();

            console.log("RESPOSTA LOGIN:", data);

            if (!resposta.ok) {

                alert(data.erro || "Erro ao realizar login.");
                return;

            }

            // salvar email para usar no OTP
            localStorage.setItem("email_otp", email);

            alert("Código de verificação enviado para seu email.");

            window.location.href = "../html/otp.html";

        } catch (error) {

            console.error(error);

            alert("Erro ao conectar com o servidor.");

        }

    });

});
