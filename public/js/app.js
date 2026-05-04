/* Forno Lento — shared client behavior (no framework) */
(function () {
  "use strict";

  var STORE_WHATSAPP = "5511951490211"; // wa.me format, digits only
  var DELIVERY_BRL_CENTS = 1200;
  var STORAGE_KEY = "forno-lento-cart";

  // ---------- Cart ----------
  function readCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(items) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {}
  }

  var cart = {
    getAll: function () { return readCart(); },
    getCount: function () {
      return readCart().reduce(function (n, i) { return n + (i.qty || 0); }, 0);
    },
    getSubtotal: function () {
      return readCart().reduce(function (s, i) { return s + (i.price || 0) * (i.qty || 0); }, 0);
    },
    add: function (item) {
      var items = readCart();
      var existing = items.find(function (i) { return i.id === item.id; });
      if (existing) {
        existing.qty += item.qty || 1;
      } else {
        items.push({
          id: item.id,
          name: item.name,
          price: item.price, // cents
          qty: item.qty || 1
        });
      }
      writeCart(items);
      renderAll();
    },
    update: function (id, qty) {
      var items = readCart();
      var it = items.find(function (i) { return i.id === id; });
      if (!it) return;
      it.qty = Math.max(1, parseInt(qty, 10) || 1);
      writeCart(items);
      renderAll();
    },
    remove: function (id) {
      var items = readCart().filter(function (i) { return i.id !== id; });
      writeCart(items);
      renderAll();
    },
    clear: function () { writeCart([]); renderAll(); }
  };

  // ---------- Formatting ----------
  function brl(cents) {
    return "R$ " + (cents / 100).toFixed(2).replace(".", ",");
  }

  // ---------- Renderers ----------
  function renderCount() {
    var count = cart.getCount();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = count > 0 ? "(" + count + ")" : "";
    });
  }

  function renderCartPage() {
    var body = document.querySelector("[data-cart-body]");
    if (!body) return;
    var items = cart.getAll();
    var wrap = document.querySelector("[data-cart-wrap]");
    var empty = document.querySelector("[data-cart-empty]");
    var summary = document.querySelector("[data-cart-summary-block]");

    if (items.length === 0) {
      if (wrap) wrap.style.display = "none";
      if (summary) summary.style.display = "none";
      if (empty) empty.style.display = "block";
      return;
    }
    if (wrap) wrap.style.display = "";
    if (summary) summary.style.display = "";
    if (empty) empty.style.display = "none";

    body.innerHTML = items.map(function (i) {
      var line = i.price * i.qty;
      return (
        '<tr>' +
          '<td>' +
            '<div class="item-name">' + escapeHtml(i.name) + '</div>' +
            '<button type="button" class="link-remove" data-remove="' + escapeAttr(i.id) + '">Remover</button>' +
          '</td>' +
          '<td class="num" data-label="Qtd">' +
            '<input type="number" min="1" class="qty-input" value="' + i.qty + '" data-qty="' + escapeAttr(i.id) + '" aria-label="Quantidade" />' +
          '</td>' +
          '<td class="num" data-label="Unitário">' + brl(i.price) + '</td>' +
          '<td class="num" data-label="Total">' + brl(line) + '</td>' +
        '</tr>'
      );
    }).join("");

    var subtotal = cart.getSubtotal();
    var delivery = items.length ? DELIVERY_BRL_CENTS : 0;
    setText("[data-cart-subtotal]", brl(subtotal));
    setText("[data-cart-delivery]", brl(delivery));
    setText("[data-cart-total]", brl(subtotal + delivery));
  }

  function renderCheckoutSummary() {
    var summary = document.querySelector("[data-cart-summary]");
    if (!summary) return;
    var items = cart.getAll();
    var subtotal = cart.getSubtotal();
    var delivery = items.length ? DELIVERY_BRL_CENTS : 0;

    if (items.length === 0) {
      summary.innerHTML =
        '<h2>Seu pedido</h2>' +
        '<p style="color:var(--muted)">Seu carrinho está vazio. <a href="/index.html#produtos">Ver produtos</a>.</p>';
      return;
    }

    var rows = items.map(function (i) {
      return '<div class="row"><span>' + escapeHtml(i.name) + ' × ' + i.qty + '</span><span>' + brl(i.price * i.qty) + '</span></div>';
    }).join("");

    summary.innerHTML =
      '<h2>Seu pedido</h2>' +
      rows +
      '<div class="row"><span>Subtotal</span><span>' + brl(subtotal) + '</span></div>' +
      '<div class="row"><span>Entrega</span><span>' + brl(delivery) + '</span></div>' +
      '<div class="row total"><span>Total</span><span>' + brl(subtotal + delivery) + '</span></div>';
  }

  function renderAll() {
    renderCount();
    renderCartPage();
    renderCheckoutSummary();
  }

  // ---------- Helpers ----------
  function setText(sel, text) {
    document.querySelectorAll(sel).forEach(function (el) { el.textContent = text; });
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function escapeAttr(s) { return escapeHtml(s); }

  // ---------- Page wiring ----------
  function wireAddToCartForms() {
    document.querySelectorAll("form[data-add-to-cart]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var id = form.elements["id"].value;
        var name = form.elements["name"].value;
        var price = parseInt(form.elements["price"].value, 10);
        if (!id || !name || isNaN(price)) return;
        cart.add({ id: id, name: name, price: price, qty: 1 });

        // brief inline confirmation
        var note = form.querySelector(".add-confirm");
        if (!note) {
          note = document.createElement("span");
          note.className = "add-confirm";
          form.appendChild(note);
        }
        note.textContent = "Adicionado ✓";
        clearTimeout(form._t);
        form._t = setTimeout(function () { note.textContent = ""; }, 1800);
      });
    });
  }

  function wireTrioForm() {
    var form = document.querySelector("form[data-trio-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var checked = Array.from(form.querySelectorAll('input[name="cookie"]:checked'));
      var msg = form.querySelector("[data-trio-msg]");
      if (checked.length !== 3) {
        if (msg) msg.textContent = "Selecione exatamente três receitas para montar o trio.";
        return;
      }
      if (msg) msg.textContent = "";
      var labels = checked.map(function (c) {
        var lab = form.querySelector('label[for="' + c.id + '"] h3');
        return lab ? lab.textContent.trim() : c.value;
      });
      var ids = checked.map(function (c) { return c.value; }).sort();
      cart.add({
        id: "trio-" + ids.join("-"),
        name: "Trio editorial (" + labels.join(", ") + ")",
        price: 3600,
        qty: 1
      });
      window.location.href = "/carrinho.html";
    });
  }

  function wireCartInteractions() {
    document.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.matches("[data-remove]")) {
        cart.remove(t.getAttribute("data-remove"));
      }
    });
    document.addEventListener("change", function (e) {
      var t = e.target;
      if (t && t.matches("[data-qty]")) {
        cart.update(t.getAttribute("data-qty"), t.value);
      }
    });
  }

  function wireCheckoutForm() {
    var form = document.querySelector("form[data-checkout-form]");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var items = cart.getAll();
      if (items.length === 0) {
        alert("Seu carrinho está vazio.");
        window.location.href = "/index.html#produtos";
        return;
      }
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var data = {};
      Array.from(form.elements).forEach(function (el) {
        if (el.name) data[el.name] = (el.value || "").trim();
      });

      var subtotal = cart.getSubtotal();
      var delivery = DELIVERY_BRL_CENTS;
      var total = subtotal + delivery;

      var paymentLabel = ({ pix: "Pix", cartao: "Cartão de crédito", boleto: "Boleto bancário" })[data.pagamento] || data.pagamento;

      var lines = [];
      lines.push("*Novo pedido — Forno Lento*", "");
      lines.push("Itens:");
      items.forEach(function (i) {
        lines.push("• " + i.name + " × " + i.qty + " — " + brl(i.price * i.qty));
      });
      lines.push("Subtotal: " + brl(subtotal));
      lines.push("Entrega: " + brl(delivery));
      lines.push("*Total: " + brl(total) + "*", "");
      lines.push("Cliente: " + data.nome);
      lines.push("Telefone: " + data.telefone);
      lines.push("E-mail: " + data.email, "");
      lines.push("Entrega:");
      lines.push(data.endereco + ", " + data.numero + (data.complemento ? " " + data.complemento : ""));
      lines.push(data.cidade + " / " + (data.estado || "").toUpperCase() + " — CEP " + data.cep, "");
      lines.push("Pagamento: " + paymentLabel);
      lines.push("Observações: " + (data.observacoes || "—"));

      var url = "https://wa.me/" + STORE_WHATSAPP + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank");

      cart.clear();
      window.location.href = "/index.html?pedido=enviado";
    });
  }

  function showOrderBanner() {
    if (!/[?&]pedido=enviado\b/.test(window.location.search)) return;
    var main = document.querySelector("main");
    if (!main) return;
    var banner = document.createElement("div");
    banner.className = "order-banner";
    banner.innerHTML = '<div class="container"><p>Pedido enviado para o WhatsApp do ateliê. Em instantes confirmamos sua fornada. Obrigado!</p></div>';
    main.insertBefore(banner, main.firstChild);
  }

  // ---------- Boot ----------
  document.addEventListener("DOMContentLoaded", function () {
    wireAddToCartForms();
    wireTrioForm();
    wireCartInteractions();
    wireCheckoutForm();
    showOrderBanner();
    renderAll();
  });
})();
