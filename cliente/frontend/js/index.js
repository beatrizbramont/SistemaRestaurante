// Testa se o backend está ativo
      async function testarServidor() {
        const statusEl = document.getElementById("status");

        try {
          const resposta = await fetch("http://127.0.0.1:8002/auth/login", {
            method: "OPTIONS",
          });

          if (resposta.ok) {
            statusEl.textContent = "✅ Servidor Flask rodando corretamente!";
            statusEl.classList.add("ok");
          } else {
            statusEl.textContent =
              "⚠️ Servidor respondeu, mas algo está incorreto.";
            statusEl.classList.add("erro");
          }
        } catch (e) {
          statusEl.textContent =
            "❌ Não foi possível conectar ao servidor (porta 8002).";
          statusEl.classList.add("erro");
        }
      }

      document.getElementById("verToken").addEventListener("click", () => {
        const token = localStorage.getItem("token");
        const tokenInfo = document.getElementById("tokenInfo");

        if (token) {
          tokenInfo.textContent = "🔑 Token JWT encontrado no navegador!";
        } else {
          tokenInfo.textContent =
            "❌ Nenhum token encontrado. Faça login primeiro.";
        }
      });

      testarServidor();