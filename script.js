const produtos = [
  { id: 1, nome: "Chips assados", cat: "snacks", preco: 14.9, emoji: "🍠", desc: "Fatias finas assadas com sal rosa e alecrim. Pacote de 80g." },
  { id: 2, nome: "Pão de batata-doce", cat: "padaria", preco: 18.5, emoji: "🍞", desc: "Macio, sem glúten, com sementes de chia. 400g." },
  { id: 3, nome: "Panqueca pronta", cat: "padaria", preco: 22.0, emoji: "🥞", desc: "Mistura pronta: só adicionar ovo e água. 300g." },
  { id: 4, nome: "Farinha de batata-doce", cat: "pre-treino", preco: 16.9, emoji: "🌾", desc: "Ideal pra pré-treino e receitas fit. 500g." },
  { id: 5, nome: "Brownie fit", cat: "snacks", preco: 9.9, emoji: "🍫", desc: "Cacau 70% e batata-doce, sem açúcar refinado. Unidade de 60g." },
  { id: 6, nome: "Mix pré-treino", cat: "pre-treino", preco: 29.9, emoji: "⚡", desc: "Batata-doce desidratada, banana e canela. 10 sachês." },
];

const WHATSAPP = "5516999999999"; // troque pelo seu número (DDI + DDD + número)
const $ = (s) => document.querySelector(s);
const moeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
let carrinho = JSON.parse(localStorage.getItem("carrinho") || "{}");

/* ---------- produtos ---------- */
function renderProdutos(cat = "todos") {
  $("#grade").innerHTML = produtos
    .filter((p) => cat === "todos" || p.cat === cat)
    .map((p) => `
      <article class="card">
        <div class="card-img" aria-hidden="true">${p.emoji}</div>
        <div class="card-corpo">
          <h3>${p.nome}</h3>
          <p>${p.desc}</p>
          <div class="card-preco">
            <strong>${moeda(p.preco)}</strong>
            <button class="btn" data-add="${p.id}">Adicionar</button>
          </div>
        </div>
      </article>`).join("");
}

$("#filtros").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  document.querySelectorAll("#filtros button").forEach((x) => x.classList.toggle("ativo", x === b));
  renderProdutos(b.dataset.cat);
});

$("#grade").addEventListener("click", (e) => {
  const id = e.target.dataset.add;
  if (!id) return;
  carrinho[id] = (carrinho[id] || 0) + 1;
  salvar();
  abrirGaveta();
});

/* ---------- carrinho ---------- */
function salvar() {
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
  renderCarrinho();
}

function renderCarrinho() {
  const ids = Object.keys(carrinho);
  let total = 0, qtd = 0;
  $("#itens").innerHTML = ids.length
    ? ids.map((id) => {
        const p = produtos.find((x) => x.id == id);
        total += p.preco * carrinho[id];
        qtd += carrinho[id];
        return `<li>
          <span>${p.nome}</span><strong>${moeda(p.preco * carrinho[id])}</strong>
          <div class="qtd">
            <button data-menos="${id}" aria-label="Diminuir">−</button>
            <span>${carrinho[id]}</span>
            <button data-mais="${id}" aria-label="Aumentar">+</button>
          </div></li>`;
      }).join("")
    : `<li class="vazio">Sua sacola está vazia.</li>`;
  $("#total").textContent = moeda(total);
  $("#contador").textContent = qtd;
}

$("#itens").addEventListener("click", (e) => {
  const { mais, menos } = e.target.dataset;
  if (mais) carrinho[mais]++;
  if (menos && --carrinho[menos] <= 0) delete carrinho[menos];
  if (mais || menos) salvar();
});

$("#limpar").addEventListener("click", () => { carrinho = {}; salvar(); });

$("#finalizar").addEventListener("click", () => {
  const ids = Object.keys(carrinho);
  if (!ids.length) return;
  let total = 0;
  const linhas = ids.map((id) => {
    const p = produtos.find((x) => x.id == id);
    total += p.preco * carrinho[id];
    return `• ${carrinho[id]}x ${p.nome} - ${moeda(p.preco * carrinho[id])}`;
  });
  const texto = `Olá! Quero fazer um pedido:\n${linhas.join("\n")}\nTotal: ${moeda(total)}`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, "_blank");
});

function abrirGaveta() { $("#gaveta").classList.add("aberta"); $("#fundo").classList.add("aberto"); $("#gaveta").setAttribute("aria-hidden", "false"); }
function fecharGaveta() { $("#gaveta").classList.remove("aberta"); $("#fundo").classList.remove("aberto"); $("#gaveta").setAttribute("aria-hidden", "true"); }
$("#abrirCarrinho").addEventListener("click", abrirGaveta);
$("#fecharCarrinho").addEventListener("click", fecharGaveta);
$("#fundo").addEventListener("click", fecharGaveta);
document.addEventListener("keydown", (e) => e.key === "Escape" && fecharGaveta());

/* ---------- menu mobile ---------- */
$("#menuBtn").addEventListener("click", () => {
  const aberto = $("#menu").classList.toggle("aberto");
  $("#menuBtn").setAttribute("aria-expanded", aberto);
});
$("#menu").addEventListener("click", () => $("#menu").classList.remove("aberto"));

/* ---------- receita ---------- */
$("#btnIngredientes").addEventListener("click", (e) => {
  const box = $("#ingredientes");
  box.hidden = !box.hidden;
  e.target.textContent = box.hidden ? "Mostrar ingredientes" : "Esconder ingredientes";
});

/* ---------- formulário ---------- */
$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = $("#nome"), email = $("#email"), msg = $("#msg");
  const nomeOk = nome.value.trim().length >= 2;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
  nome.classList.toggle("erro", !nomeOk);
  email.classList.toggle("erro", !emailOk);
  msg.className = nomeOk && emailOk ? "ok" : "falha";
  msg.textContent = nomeOk && emailOk
    ? `Valeu, ${nome.value.trim().split(" ")[0]}! Seu cupom BATATA10 está a caminho.`
    : "Preencha seu nome e um e-mail válido.";
  if (nomeOk && emailOk) e.target.reset();
});

/* ---------- init ---------- */
$("#ano").textContent = new Date().getFullYear();
renderProdutos();
renderCarrinho();
