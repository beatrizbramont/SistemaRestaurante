document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.querySelector('input[type="button"][value="Entrar"]');

  if (!btnLogin) {
    console.error("❌ Botão de login não encontrado no HTML!");
    return;
  }

  btnLogin.addEventListener("click", async () => {
    const email = document.getElementById("email")?.value.trim();
    const senha = document.getElementById("senha")?.value.trim();

    if (!email || !senha) {
      alert("⚠️ Por favor, preencha todos os campos!");
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

      if (!resposta.ok) {
        const erro = await resposta.json().catch(() => ({}));
        throw new Error(erro.erro || "E-mail ou senha incorretos!");
      }

      const dados = await resposta.json();

      // Armazena token e dados do usuário
      if (dados.token) {
        localStorage.setItem("token", dados.token);
      }

      if (dados.usuario) {
        localStorage.setItem("usuario", JSON.stringify(dados.usuario));
        localStorage.setItem("usuarioNome", dados.usuario.nome || "Usuário");
      }

      alert(dados.mensagem || "✅ Login realizado com sucesso!");
      window.location.href = "../html/home.html";

    } catch (erro) {
      console.error("Erro no login:", erro);
      alert(`❌ Erro: ${erro.message || "Falha na conexão com o servidor."}`);
    }
  });
});
