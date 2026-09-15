// --- CADERNO VIRTUAL - AÇAI & SORVETERIA ---

// Chaves do LocalStorage
const STORAGE_PRODUCTS = "caderno_produtos_v1";
const STORAGE_SALES = "caderno_sales_v1";

// Elementos do DOM
const saleForm = document.getElementById("saleForm");
const saleDate = document.getElementById("saleDate");
const saleProduct = document.getElementById("saleProduct");
const saleQuantity = document.getElementById("saleQuantity");
const saleValue = document.getElementById("saleValue");
const saleNote = document.getElementById("saleNote");

const productForm = document.getElementById("productForm");
const productName = document.getElementById("productName");
const productList = document.getElementById("productList");

const salesTable = document.getElementById("salesTable");
const emptySales = document.getElementById("emptySales");
const filterDate = document.getElementById("filterDate");

const dailyTotal = document.getElementById("dailyTotal");
const dailyItems = document.getElementById("dailyItems");
const dailyOrders = document.getElementById("dailyOrders");

const printReportBtn = document.getElementById("printReport");
const printArea = document.getElementById("printArea");
const printDate = document.getElementById("printDate");
const printTotal = document.getElementById("printTotal");
const printItems = document.getElementById("printItems");
const printOrders = document.getElementById("printOrders");
const printTable = document.getElementById("printTable");
const toast = document.getElementById("toast");

// Estado da aplicação para edição
let editingSaleId = null;

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  const hoje = new Date().toISOString().split("T")[0];
  saleDate.value = hoje;
  filterDate.value = hoje;

  carregarProdutos();
  carregarVendas();
  atualizarResumo();

  saleForm.addEventListener("submit", salvarVenda);
  productForm.addEventListener("submit", salvarProduto);
  filterDate.addEventListener("change", carregarVendas);
  printReportBtn.addEventListener("click", gerarRelatorioPDF);
});

// --- GERENCIAMENTO DE PRODUTOS ---

function getProdutos() {
  return JSON.parse(localStorage.getItem(STORAGE_PRODUCTS)) || [];
}

function salvarProdutos(produtos) {
  localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(produtos));
}

function carregarProdutos() {
  const produtos = getProdutos();
  productList.innerHTML = "";
  saleProduct.innerHTML = '<option value="">Selecione um produto</option>';

  if (produtos.length === 0) {
    productList.innerHTML = '<li class="empty-message" style="padding:10px 0;">Nenhum produto cadastrado.</li>';
  }

  produtos.forEach((prod, index) => {
    // Opção no select
    const option = document.createElement("option");
    option.value = prod;
    option.textContent = prod;
    saleProduct.appendChild(option);

    // Item na lista de cadastro com botão Editar e Excluir
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.padding = "6px 0";
    li.style.borderBottom = "1px solid #f0f0f0";

    const span = document.createElement("span");
    span.textContent = prod;

    const divAcoes = document.createElement("div");

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.className = "text-btn";
    btnEditar.style.marginRight = "10px";
    btnEditar.style.color = "#0066cc";
    btnEditar.style.background = "none";
    btnEditar.style.border = "none";
    btnEditar.style.cursor = "pointer";
    btnEditar.onclick = () => editarProduto(index);

    const btnExcluir = document.createElement("button");
    btnExcluir.textContent = "Excluir";
    btnExcluir.className = "text-btn";
    btnExcluir.style.color = "#cc0000";
    btnExcluir.style.background = "none";
    btnExcluir.style.border = "none";
    btnExcluir.style.cursor = "pointer";
    btnExcluir.onclick = () => excluirProduto(index);

    divAcoes.appendChild(btnEditar);
    divAcoes.appendChild(btnExcluir);

    li.appendChild(span);
    li.appendChild(divAcoes);
    productList.appendChild(li);
  });
}

function salvarProduto(e) {
  e.preventDefault();
  const nome = productName.value.trim();
  if (!nome) return;

  const produtos = getProdutos();
  if (produtos.includes(nome)) {
    mostrarToast("Este produto já está cadastrado!");
    return;
  }

  produtos.push(nome);
  salvarProdutos(produtos);
  productName.value = "";
  carregarProdutos();
  mostrarToast("Produto cadastrado com sucesso!");
}

function editarProduto(index) {
  const produtos = getProdutos();
  const novoNome = prompt("Digite o novo nome do produto:", produtos[index]);
  
  if (novoNome !== null && novoNome.trim() !== "") {
    const nomeLimpo = novoNome.trim();
    if (produtos.includes(nomeLimpo)) {
      mostrarToast("Já existe um produto com esse nome!");
      return;
    }
    produtos[index] = nomeLimpo;
    salvarProdutos(produtos);
    carregarProdutos();
    carregarVendas();
    mostrarToast("Produto atualizado com sucesso!");
  }
}

function excluirProduto(index) {
  const produtos = getProdutos();
  const removido = produtos.splice(index, 1)[0];
  salvarProdutos(produtos);
  carregarProdutos();
  mostrarToast(`Produto "${removido}" excluído.`);
}

// --- GERENCIAMENTO DE VENDAS (ANOTAÇÕES) ---

function getVendas() {
  return JSON.parse(localStorage.getItem(STORAGE_SALES)) || [];
}

function salvarVendas(vendas) {
  localStorage.setItem(STORAGE_SALES, JSON.stringify(vendas));
}

function salvarVenda(e) {
  e.preventDefault();

  const venda = {
    id: editingSaleId ? editingSaleId : Date.now().toString(),
    date: saleDate.value,
    product: saleProduct.value,
    quantity: parseInt(saleQuantity.value),
    value: parseFloat(saleValue.value.replace(",", ".")),
    note: saleNote.value.trim()
  };

  if (isNaN(venda.value) || venda.value < 0) {
    mostrarToast("Insira um valor válido.");
    return;
  }

  let vendas = getVendas();

  if (editingSaleId) {
    const index = vendas.findIndex(v => v.id === editingSaleId);
    if (index !== -1) {
      vendas[index] = venda;
    }
    editingSaleId = null;
    saleForm.querySelector("button[type='submit']").textContent = "Salvar anotação";
  } else {
    vendas.push(venda);
  }

  salvarVendas(vendas);
  
  // Limpa formulário mantendo a data atual
  const dataAtual = saleDate.value;
  saleForm.reset();
  saleDate.value = dataAtual;
  saleQuantity.value = "1";

  carregarVendas();
  atualizarResumo();
  mostrarToast("Anotação salva com sucesso!");
}

function carregarVendas() {
  const vendas = getVendas();
  const dataFiltro = filterDate.value;
  salesTable.innerHTML = "";

  const vendasFiltradas = vendas.filter(v => v.date === dataFiltro);

  if (vendasFiltradas.length === 0) {
    emptySales.style.display = "block";
  } else {
    emptySales.style.display = "none";
    vendasFiltradas.forEach(venda => {
      const tr = document.createElement("tr");

      const [ano, mes, dia] = venda.date.split("-");
      const dataFormatada = `${dia}/${mes}/${ano}`;
      const valorFormatado = venda.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

      tr.innerHTML = `
        <td>${dataFormatada}</td>
        <td>${escapeHTML(venda.product)}</td>
        <td>${venda.quantity}</td>
        <td>${valorFormatado}</td>
        <td>${venda.note ? escapeHTML(venda.note) : "—"}</td>
        <td class="print-hide">
          <button class="text-btn" style="color:#0066cc; margin-right:8px; background:none; border:none; cursor:pointer;" onclick="prepararEdicaoVenda('${venda.id}')">Editar</button>
          <button class="text-btn" style="color:#cc0000; background:none; border:none; cursor:pointer;" onclick="excluirVenda('${venda.id}')">Apagar</button>
        </td>
      `;
      salesTable.appendChild(tr);
    });
  }
}

function prepararEdicaoVenda(id) {
  const vendas = getVendas();
  const venda = vendas.find(v => v.id === id);
  if (!venda) return;

  saleDate.value = venda.date;
  saleProduct.value = venda.product;
  saleQuantity.value = venda.quantity;
  saleValue.value = venda.value.toFixed(2).replace(".", ",");
  saleNote.value = venda.note || "";
  editingSaleId = venda.id;

  saleForm.querySelector("button[type='submit']").textContent = "Atualizar anotação";
  window.scrollTo({ top: 0, behavior: "smooth" });
  mostrarToast("Modo de edição ativado.");
}

function excluirVenda(id) {
  if (!confirm("Deseja realmente apagar esta anotação?")) return;
  let vendas = getVendas();
  vendas = vendas.filter(v => v.id !== id);
  salvarVendas(vendas);
  carregarVendas();
  atualizarResumo();
  mostrarToast("Anotação apagada.");
}

function atualizarResumo() {
  const vendas = getVendas();
  const dataFiltro = filterDate.value;
  const vendasDoDia = vendas.filter(v => v.date === dataFiltro);

  let totalVendas = 0;
  let totalItens = 0;
  let totalPedidos = vendasDoDia.length;

  vendasDoDia.forEach(v => {
    totalVendas += v.value;
    totalItens += v.quantity;
  });

  dailyTotal.textContent = totalVendas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  dailyItems.textContent = totalItens;
  dailyOrders.textContent = totalPedidos;
}

// --- IMPRESSÃO / PDF ---

function gerarRelatorioPDF() {
  const vendas = getVendas();
  const dataFiltro = filterDate.value;
  const vendasDoDia = vendas.filter(v => v.date === dataFiltro);

  if (vendasDoDia.length === 0) {
    mostrarToast("Não há vendas registradas para o dia selecionado.");
    return;
  }

  const [ano, mes, dia] = dataFiltro.split("-");
  printDate.textContent = `Data do relatório: ${dia}/${mes}/${ano}`;

  let totalVendas = 0;
  let totalItens = 0;
  printTable.innerHTML = "";

  vendasDoDia.forEach(v => {
    totalVendas += v.value;
    totalItens += v.quantity;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${dia}/${mes}/${ano}</td>
      <td>${escapeHTML(v.product)}</td>
      <td>${v.quantity}</td>
      <td>${v.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
      <td>${v.note ? escapeHTML(v.note) : "—"}</td>
    `;
    printTable.appendChild(tr);
  });

  printTotal.textContent = totalVendas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  printItems.textContent = totalItens;
  printOrders.textContent = vendasDoDia.length;

  window.print();
}

// --- UTILITÁRIOS ---

function mostrarToast(mensagem) {
  toast.textContent = mensagem;
  toast.className = "show";
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'}[tag] || tag)
  );
}