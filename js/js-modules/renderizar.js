import { cart } from './cart.js';
import { brl, escapeHtml, escapeAttr, setText } from './auxiliadores.js';

const DELIVERY_BRL_CENTS = 1200;
export function renderCount() {
  const count = cart.getCount();
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = count > 0 ? '(' + count + ')' : '';
  });
}

export function renderCartPage() {
  const body = document.querySelector('[data-cart-body]');
  if (!body) return;
  const items = cart.getAll();
  const wrap = document.querySelector('[data-cart-wrap]');
  const empty = document.querySelector('[data-cart-empty]');
  const summary = document.querySelector('[data-cart-summary-block]');

  if (items.length === 0) {
    if (wrap) wrap.style.display = 'none';
    if (summary) summary.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (wrap) wrap.style.display = '';
  if (summary) summary.style.display = '';
  if (empty) empty.style.display = 'none';

  body.innerHTML = items
    .map((i) => {
      const line = i.price * i.qty;
      return (
        '<tr>' +
        '<td>' +
        '<div class="item-name">' +
        escapeHtml(i.name) +
        '</div>' +
        '<button type="button" class="link-remove" data-remove="' +
        escapeAttr(i.id) +
        '">Remover</button>' +
        '</td>' +
        '<td class="num" data-label="Qtd">' +
        '<input type="number" min="1" class="qty-input" value="' +
        i.qty +
        '" data-qty="' +
        escapeAttr(i.id) +
        '" aria-label="Quantidade" />' +
        '</td>' +
        '<td class="num" data-label="Unitário">' +
        brl(i.price) +
        '</td>' +
        '<td class="num" data-label="Total">' +
        brl(line) +
        '</td>' +
        '</tr>'
      );
    })
    .join('');

  const subtotal = cart.getSubtotal();
  const delivery = items.length ? DELIVERY_BRL_CENTS : 0;
  setText('[data-cart-subtotal]', brl(subtotal));
  setText('[data-cart-delivery]', brl(delivery));
  setText('[data-cart-total]', brl(subtotal + delivery));
}

export function renderCheckoutSummary() {
  const summary = document.querySelector('[data-cart-summary]');
  if (!summary) return;
  const items = cart.getAll();
  const subtotal = cart.getSubtotal();
  const delivery = items.length ? DELIVERY_BRL_CENTS : 0;

  if (items.length === 0) {
    summary.innerHTML =
      '<h2>Seu pedido</h2>' +
      '<p style="color:var(--muted)">Seu carrinho está vazio. <a href="index.html#produtos">Ver produtos</a>.</p>';
    return;
  }

  const rows = items
    .map(
      (i) =>
        '<div class="row"><span>' +
        escapeHtml(i.name) +
        ' × ' +
        i.qty +
        '</span><span>' +
        brl(i.price * i.qty) +
        '</span></div>',
    )
    .join('');

  summary.innerHTML =
    '<h2>Seu pedido</h2>' +
    rows +
    '<div class="row"><span>Subtotal</span><span>' +
    brl(subtotal) +
    '</span></div>' +
    '<div class="row"><span>Entrega</span><span>' +
    brl(delivery) +
    '</span></div>' +
    '<div class="row total"><span>Total</span><span>' +
    brl(subtotal + delivery) +
    '</span></div>';
}

export function renderAll() {
  renderCount();
  renderCartPage();
  renderCheckoutSummary();
}
