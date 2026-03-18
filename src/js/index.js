// Objetivo: 
// Enviar um texto de um formulário para uma API do n8n e exibir o resultado o código html, css e colocar a animação no fundo da tela do site. 
// Passos: 
// 1. No JavaScript, pegar o evento de submit do formulário para evitar o recarregamento da página. 
// 2. Obter o valor digitado pelo usuário no campo de texto. 
// 3. Exibir um indicador de carregamento enquanto a requisição está sendo processada. 
// 4. Fazer uma requisição HTTP (POST) para a API do n8n, enviando o texto do formulário no corpo da requisição em formato JSON. 
// 5. Receber a resposta da API do n8n (esperando um JSON com o código HTML/CSS do background). 
// 6. Se a resposta for válida, exibir o código HTML/CSS retornado na tela: 
//a) Mostrar o HTML gerado em uma área de preview. 
//b) Inserir o CSS retornado dinamicamente na página para aplicar o background. 
// 7. Remover o indicador de carregamento após o recebimento da resposta. 
// 🔹 Função que altera o texto do botão enquanto a IA está gerando 

// ==========================================
// 🎯 FUNDO MÁGICO — VERSÃO FINAL CORRIGIDA
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     🔊 ÁUDIOS
  =============================== */
  const somPassos = document.getElementById("som-inicio");
  const somBau = document.getElementById("som-fim");

  if (somPassos) somPassos.volume = 0.7;
  if (somBau) somBau.volume = 1.0;

  /* ===============================
     🎬 ELEMENTOS
  =============================== */
  const form = document.getElementById("form-magic");
  const textarea = document.getElementById("description");
  const htmlCode = document.getElementById("html-code");
  const cssCode = document.getElementById("css-code");
  const preview = document.getElementById("preview-section");
  const btnText = document.getElementById("btn-text");

  const bgInicial = document.querySelector(".bg-inicial");
  const bgGif = document.querySelector(".bg-gif");
  const bgFinal = document.querySelector(".bg-final");

  if (!form) {
    console.error("Formulário não encontrado");
    return;
  }

  /* ===============================
     🔁 UTILIDADES
  =============================== */

  function setLoading(isLoading) {
    if (!btnText) return;
    btnText.textContent = isLoading
      ? "Gerando Background..."
      : "Gerar Background Mágico";
  }

  function pararAudio(audio) {
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (e) {
      console.warn("Erro ao parar áudio:", e);
    }
  }

  function aplicarCSS(cssText) {
    const old = document.getElementById("dynamic-style");
    if (old) old.remove();

    if (cssText) {
      const style = document.createElement("style");
      style.id = "dynamic-style";
      style.textContent = cssText;
      document.head.appendChild(style);
    }
  }

  function renderResultado(data) {
    htmlCode.textContent = data?.code || "Nenhum HTML retornado.";
    cssCode.textContent = data?.style || "Nenhum CSS retornado.";

    preview.style.display = "block";
    preview.innerHTML = data?.code || "";

    aplicarCSS(data?.style || "");
  }

  /* ===============================
     🚀 EVENTO PRINCIPAL (SUBMIT)
  =============================== */

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const descricao = textarea.value.trim();
    if (!descricao) return;

    /* Reset visual */
    bgInicial?.classList.add("ativo");
    bgGif?.classList.remove("ativo");
    bgFinal?.classList.remove("ativo", "visivel");

    /* Som + animação inicial */
    pararAudio(somBau);

    if (somPassos) {
      somPassos.currentTime = 0;
      somPassos.play().catch(() => {});
    }

    bgInicial?.classList.remove("ativo");
    bgGif?.classList.add("ativo");

    setLoading(true);

    let data;

    try {
      const res = await fetch(
        "https://eusouojoao.app.n8n.cloud/webhook/gerador-fundo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ description: descricao })
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      data = await res.json();

    } catch (err) {
      console.error("Erro no n8n:", err);
      data = {
        code: "<p>Erro ao gerar o background.</p>",
        style: ""
      };
    }

    /* ===============================
       ⏱️ FINALIZAÇÃO COM ANIMAÇÃO
    =============================== */

    setTimeout(() => {

      pararAudio(somPassos);

      bgGif?.classList.remove("ativo");
      bgFinal?.classList.add("ativo", "visivel");

      if (somBau) {
        somBau.currentTime = 0;
        somBau.play().catch(() => {});
        somBau.onended = () => {
          renderResultado(data);
          setLoading(false);
        };
      } else {
        renderResultado(data);
        setLoading(false);
      }

    }, 4000);
  });

});






