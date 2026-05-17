import { cart } from './cart.js';
import { renderAll } from './renderizar.js';
import { brl } from './auxiliadores.js';

const STORE_WHATSAPP = '5511951490211';
const DELIVERY_BRL_CENTS = 1200;

export function wireAddToCartForms() {
  document.querySelectorAll('form[data-add-to-cart]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = form.elements['id'].value;
      const name = form.elements['name'].value;
      const price = parseInt(form.elements['price'].value, 10);
      if (!id || !name || isNaN(price)) return;
      cart.add({ id, name, price, qty: 1 });
      renderAll();

      let note = form.querySelector('.add-confirm');
      if (!note) {
        note = document.createElement('span');
        note.className = 'add-confirm';
        form.appendChild(note);
      }
      note.textContent = 'Adicionado ✓';
      clearTimeout(form._t);
      form._t = setTimeout(() => {
        note.textContent = '';
      }, 1800);
    });
  });
}

export function wireTrioForm() {
  const form = document.querySelector('form[data-trio-form]');
  if (!form) return;

  // Impede marcar mais de 3
  form.addEventListener('change', (e) => {
    if (!e.target.matches('input[name="cookie"]')) return;
    const checked = Array.from(
      form.querySelectorAll('input[name="cookie"]:checked'),
    );
    if (checked.length > 3) {
      e.target.checked = false;
      const msg = form.querySelector('[data-trio-msg]');
      if (msg)
        msg.textContent =
          'Selecione exatamente três receitas para montar o trio.';
    } else {
      const msg = form.querySelector('[data-trio-msg]');
      if (msg) msg.textContent = '';
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const checked = Array.from(
      form.querySelectorAll('input[name="cookie"]:checked'),
    );
    const msg = form.querySelector('[data-trio-msg]');
    if (checked.length !== 3) {
      if (msg)
        msg.textContent =
          'Selecione exatamente três receitas para montar o trio.';
      return;
    }
    if (msg) msg.textContent = '';
    const labels = checked.map((c) => {
      const lab = form.querySelector('label[for="' + c.id + '"] h3');
      return lab ? lab.textContent.trim() : c.value;
    });
    const ids = checked.map((c) => c.value).sort();
    cart.add({
      id: 'trio-' + ids.join('-'),
      name: 'Trio editorial (' + labels.join(', ') + ')',
      price: 3600,
      qty: 1,
    });
    renderAll();
    window.location.href = '/carrinho.html';
  });
}

export function wireCartInteractions() {
  document.addEventListener('click', (e) => {
    if (e.target && e.target.matches('[data-remove]')) {
      cart.remove(e.target.getAttribute('data-remove'));
      renderAll();
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target && e.target.matches('[data-qty]')) {
      cart.update(e.target.getAttribute('data-qty'), e.target.value);
      renderAll();
    }
  });
}

export function wireCheckoutForm() {
  const form = document.querySelector('form[data-checkout-form]');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const items = cart.getAll();
    if (items.length === 0) {
      alert('Seu carrinho está vazio.');
      window.location.href = '/index.html#produtos';
      return;
    }
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = {};
    Array.from(form.elements).forEach((el) => {
      if (el.name) data[el.name] = (el.value || '').trim();
    });

    const subtotal = cart.getSubtotal();
    const delivery = DELIVERY_BRL_CENTS;
    const total = subtotal + delivery;
    const paymentLabel =
      { pix: 'Pix', cartao: 'Cartão de crédito', boleto: 'Boleto bancário' }[
        data.pagamento
      ] || data.pagamento;

    const lines = [];
    lines.push('*Novo pedido — Forno Lento*', '');
    lines.push('Itens:');
    items.forEach((i) => {
      lines.push('• ' + i.name + ' × ' + i.qty + ' — ' + brl(i.price * i.qty));
    });
    lines.push('Subtotal: ' + brl(subtotal));
    lines.push('Entrega: ' + brl(delivery));
    lines.push('*Total: ' + brl(total) + '*', '');
    lines.push('Cliente: ' + data.nome);
    lines.push('Telefone: ' + data.telefone);
    lines.push('E-mail: ' + data.email, '');
    lines.push('Entrega:');
    lines.push(
      data.endereco +
        ', ' +
        data.numero +
        (data.complemento ? ' ' + data.complemento : ''),
    );
    lines.push(
      data.cidade +
        ' / ' +
        (data.estado || '').toUpperCase() +
        ' — CEP ' +
        data.cep,
      '',
    );
    lines.push('Pagamento: ' + paymentLabel);
    lines.push('Observações: ' + (data.observacoes || '—'));

    const url =
      'https://wa.me/' +
      STORE_WHATSAPP +
      '?text=' +
      encodeURIComponent(lines.join('\n'));
    window.open(url, '_blank');
    cart.clear();
    renderAll();
    window.location.href = '/index.html?pedido=enviado';
  });
}

export function showOrderBanner() {
  if (!/[?&]pedido=enviado\b/.test(window.location.search)) return;
  const main = document.querySelector('main');
  if (!main) return;
  const banner = document.createElement('div');
  banner.className = 'order-banner';
  banner.innerHTML =
    '<div class="container"><p>Pedido enviado para o WhatsApp do ateliê. Em instantes confirmamos sua fornada. Obrigado!</p></div>';
  main.insertBefore(banner, main.firstChild);
}
