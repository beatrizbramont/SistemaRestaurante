document.addEventListener("DOMContentLoaded", () => {
  const btnCadastrar = document.getElementById("cadastrar");

  btnCadastrar.addEventListener("click", async () => {
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!nome || !email || !senha) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const resposta = await fetch("http://127.0.0.1:8002/auth/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, senha })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert(dados.mensagem || "Usuário cadastrado com sucesso!");
        window.location.href = "../html/login.html";
      } else {
        alert(dados.erro || "Erro ao cadastrar usuário.");
      }

    } catch (erro) {
      console.error("Erro ao cadastrar:", erro);
      alert("Erro de conexão com o servidor.");
    }
  });
});