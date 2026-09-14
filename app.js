const STORAGE_PRODUCTS = 'caderno_acai_produtos_v1';
const STORAGE_SALES = 'caderno_acai_vendas_v1';
let products = JSON.parse(localStorage.getItem(STORAGE_PRODUCTS) || '[]');
let sales = JSON.parse(localStorage.getItem(STORAGE_SALES) || '[]');

const byId = id => document.getElementById(id);
const today = new Date().toISOString().slice(0, 10);
byId('saleDate').value = today;
byId('filterDate').value = today;
const formatMoney = value => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dateBR = value => new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR');
function moneyToNumber(text) { return Number(String(text).replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '')); }
function save() { localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products)); localStorage.setItem(STORAGE_SALES, JSON.stringify(sales)); }
function toast(message) { const el = byId('toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2500); }

function renderProducts() {
  const select = byId('saleProduct');
  select.innerHTML = '<option value="">Selecione um produto</option>' + products.map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('');
  byId('productList').innerHTML = products.length ? products.map((p, i) => `<li><span>${escapeHtml(p)}</span><button class="remove-product" data-product="${i}" type="button">Excluir</button></li>`).join('') : '<li>Nenhum produto cadastrado ainda.</li>';
}
function selectedSales() { return sales.filter(s => s.date === byId('filterDate').value).sort((a,b) => b.createdAt - a.createdAt); }
function row(s, printable=false) { return `<tr><td>${dateBR(s.date)}</td><td>${escapeHtml(s.product)}</td><td>${s.quantity}</td><td>${formatMoney(s.value)}</td><td>${escapeHtml(s.note || '—')}</td>${printable ? '' : `<td class="print-hide"><button type="button" class="delete-sale" data-sale="${s.id}">Apagar</button></td>`}</tr>`; }
function renderSales() {
  const list = selectedSales();
  const total = list.reduce((sum, s) => sum + s.value, 0);
  const items = list.reduce((sum, s) => sum + s.quantity, 0);
  byId('salesTable').innerHTML = list.map(s => row(s)).join('');
  byId('emptySales').hidden = list.length > 0;
  byId('dailyTotal').textContent = formatMoney(total);
  byId('dailyItems').textContent = items;
  byId('dailyOrders').textContent = list.length;
}
function escapeHtml(value) { const node = document.createElement('span'); node.textContent = value; return node.innerHTML; }

byId('productForm').addEventListener('submit', event => {
  event.preventDefault(); const name = byId('productName').value.trim();
  if (!name) return; if (products.some(p => p.toLocaleLowerCase() === name.toLocaleLowerCase())) return toast('Este produto já foi cadastrado.');
  products.push(name); save(); renderProducts(); byId('productName').value = ''; toast('Produto cadastrado!');
});
byId('productList').addEventListener('click', event => { const index = event.target.dataset.product; if (index === undefined) return; products.splice(Number(index), 1); save(); renderProducts(); toast('Produto excluído.'); });
byId('saleForm').addEventListener('submit', event => {
  event.preventDefault(); const value = moneyToNumber(byId('saleValue').value); const quantity = Number(byId('saleQuantity').value);
  if (!(value > 0) || !(quantity > 0)) return toast('Informe uma quantidade e um valor válidos.');
  sales.push({ id: Date.now(), date: byId('saleDate').value, product: byId('saleProduct').value, quantity, value, note: byId('saleNote').value.trim(), createdAt: Date.now() });
  save(); byId('filterDate').value = byId('saleDate').value; byId('saleForm').reset(); byId('saleDate').value = byId('filterDate').value; byId('saleQuantity').value = 1; renderSales(); toast('Pedido anotado com sucesso!');
});
byId('filterDate').addEventListener('change', renderSales);
byId('salesTable').addEventListener('click', event => { const id = event.target.dataset.sale; if (!id) return; sales = sales.filter(s => s.id !== Number(id)); save(); renderSales(); toast('Anotação apagada.'); });
byId('printReport').addEventListener('click', () => {
  const list = selectedSales(); const total = list.reduce((sum, s) => sum + s.value, 0); const items = list.reduce((sum, s) => sum + s.quantity, 0);
  byId('printDate').textContent = `Data: ${dateBR(byId('filterDate').value)}`; byId('printTotal').textContent = formatMoney(total); byId('printItems').textContent = items; byId('printOrders').textContent = list.length; byId('printTable').innerHTML = list.map(s => row(s, true)).join('') || '<tr><td colspan="5">Nenhuma venda anotada neste dia.</td></tr>';
  window.print();
});
renderProducts(); renderSales();
