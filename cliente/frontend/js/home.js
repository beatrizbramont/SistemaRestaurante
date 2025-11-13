document.addEventListener("DOMContentLoaded", () => {
  const nomeSpan = document.getElementById("nomeUsuario");
  const btnReserva = document.getElementById("btnReserva");
  const btnCardapio = document.getElementById("btnCardapio");
  const secaoReserva = document.getElementById("secaoReserva");
  const btnConsultar = document.getElementById("btnConsultar");
  const resultadoDiv = document.getElementById("resultadoReserva");

  const token = localStorage.getItem("token");
  const nomeUsuario = localStorage.getItem("usuarioNome");

  // 🔐 Verifica login
  if (!token) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "../html/login.html";
    return;
  }

  // 🧍 Mostra nome do usuário
  nomeSpan.textContent = nomeUsuario || "Usuário";

  // 🪑 Alternar exibição da seção de reserva
  btnReserva.addEventListener("click", () => {
    secaoReserva.classList.toggle("oculto");
  });

  // 🔍 Consultar mesas disponíveis
  btnConsultar.addEventListener("click", async () => {
    const pessoas = document.getElementById("pessoas").value.trim();

    if (!pessoas || pessoas <= 0) {
      alert("Informe a quantidade de pessoas.");
      return;
    }

    try {
      const resposta = await fetch(`http://127.0.0.1:8002/consultar_mesa?pessoas=${pessoas}&acao=reserva`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        resultadoDiv.innerHTML = `
          <p><strong>${dados.mensagem}</strong></p>
          <pre>${JSON.stringify(dados.mesas, null, 2)}</pre>
        `;
      } else {
        resultadoDiv.innerHTML = `<p style="color:red;">${dados.erro || "Erro ao consultar mesas."}</p>`;
      }

    } catch (erro) {
      console.error("Erro ao consultar mesa:", erro);
      resultadoDiv.innerHTML = `<p style="color:red;">Erro de conexão com o servidor.</p>`;
    }
  });

  // 🍽️ Redirecionar para página de cardápio
  btnCardapio.addEventListener("click", () => {
    window.location.href = "../html/cardapio.html";
  });
});
