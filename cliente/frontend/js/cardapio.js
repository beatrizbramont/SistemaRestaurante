document.addEventListener("DOMContentLoaded", async () => {
  const listaCardapio = document.getElementById("listaCardapio");

  try {
    const response = await fetch("http://127.0.0.1:8002/cardapio/listar", {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    const dados = await response.json();

    if (!response.ok) {
      console.error("❌ Erro ao buscar cardápio:", dados.erro || dados.detalhes);
      listaCardapio.innerHTML = `<p>${dados.erro || "Erro ao carregar cardápio."}</p>`;
      return;
    }

    if (!Array.isArray(dados) || dados.length === 0) {
      listaCardapio.innerHTML = "<p>Nenhum item encontrado no cardápio.</p>";
      return;
    }

    const categorias = {};
    dados.forEach(item => {
      const categoria = item.categoria || "Outros";
      if (!categorias[categoria]) categorias[categoria] = [];
      categorias[categoria].push(item);
    });

    listaCardapio.innerHTML = Object.keys(categorias).map(categoria => `
      <h3 class="titulo-categoria">${categoria}</h3>
      <div class="categoria-bloco">
        ${categorias[categoria].map(item => `
          <div class="item-cardapio">
            ${item.imagem 
              ? `<img src="${item.imagem.startsWith('http') 
                  ? item.imagem 
                  : 'http://127.0.0.1:8001/static/uploads/' + item.imagem}" 
                  alt="${item.nome}" class="img-cardapio">`
              : `<div class="img-cardapio placeholder"><i class="fa-solid fa-utensils"></i></div>`}

            <div class="info-cardapio">
              <h4>${item.nome}</h4>
              <p>${item.ingredientes || "Sem descrição."}</p>
              <p><strong>Preço:</strong> R$ ${Number(item.preco).toFixed(2)}</p>
              <p><strong>Tempo:</strong> ${item.tempo_preparo} min</p>
            </div>
          </div>
        `).join("")}
      </div>
    `).join("");

  } catch (erro) {
    console.error("❌ Erro ao carregar cardápio:", erro);
    listaCardapio.innerHTML = "<p>Erro ao carregar o cardápio. Tente novamente.</p>";
  }
});
