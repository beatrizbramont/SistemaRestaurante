document.addEventListener("DOMContentLoaded", () => {
  // Seleciona os elementos
  const nomeSpan = document.getElementById("nomeUsuario");
  const btnReserva = document.getElementById("btnReserva");
  const btnCardapio = document.getElementById("btnCardapio");
  const secaoReserva = document.getElementById("secaoReserva");
  const btnConsultar = document.getElementById("btnConsultar");
  const resultadoDiv = document.getElementById("resultadoReserva");
  const listaCardapio = document.getElementById("listaCardapio");

  // Pega dados do localStorage
  const token = localStorage.getItem("token");
  const nomeUsuario = localStorage.getItem("usuarioNome");

  // Se não estiver logado, redireciona
  if (!token) {
    alert("Você precisa estar logado para acessar esta página.");
    window.location.href = "../html/login.html";
    return;
  }

  // Exibe o nome do usuário
  if (nomeUsuario && nomeSpan) {
    nomeSpan.textContent = nomeUsuario;
  } else {
    nomeSpan.textContent = "Usuário";
  }

  // Exibir / esconder seção de reserva
  btnReserva.addEventListener("click", () => {
    secaoReserva.classList.toggle("oculto");
  });

  // Consultar mesas
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

  // Carregar cardápio
  btnCardapio.addEventListener("click", async () => {
    try {
      const response = await fetch("http://127.0.0.1:8001/cardapio");
      if (!response.ok) throw new Error(`Erro ao buscar cardápio: ${response.status}`);

      const dados = await response.json();

      listaCardapio.innerHTML = dados.map(item => `
        <div class="item-cardapio">
          <h3>${item.nome}</h3>
          <p>${item.descricao}</p>
          <strong>Preço: R$ ${item.preco.toFixed(2)}</strong>
        </div>
      `).join("");
    } catch (erro) {
      console.error("❌ Erro ao carregar cardápio:", erro);
      listaCardapio.innerHTML = "<p>Erro ao carregar o cardápio. Tente novamente.</p>";
    }
  });
});
