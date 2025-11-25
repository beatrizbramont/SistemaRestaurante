document.addEventListener("DOMContentLoaded", () => {
  const nomeSpan = document.getElementById("nomeUsuario");
  const btnReserva = document.getElementById("btnReserva");
  const btnCardapio = document.getElementById("btnCardapio");
  const btnMinhasReservas = document.getElementById("btnMinhasReservas");
  const btnConsultar = document.getElementById("btnConsultar");
  const resultadoDiv = document.getElementById("resultadoReserva");

  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const nomeUsuario = usuario?.nome || "Usuário";

  // --- VERIFICA LOGIN ---
  if (!token) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "../html/login.html";
    return;
  }

  nomeSpan.textContent = nomeUsuario;

  // --- REDIRECIONAR PARA RESERVA ---
  btnReserva.addEventListener("click", () => {
    window.location.href = "../html/quantidadePessoas.html";
  });

  // --- REDIRECIONAR PARA CARDÁPIO ---
  btnCardapio.addEventListener("click", () => {
    window.location.href = "../html/cardapio.html";
  });

  // --- REDIRECIONAR PARA MINHAS RESERVAS ---
  if (btnMinhasReservas) {
    btnMinhasReservas.addEventListener("click", () => {
      window.location.href = "../html/minhasReservas.html";
    });
  }

  // --- CONSULTAR MESAS (caso ainda exista essa seção na home) ---
  if (btnConsultar) {
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
  }
});
