## Goal

Make the 5 static pages communicate via a single vanilla JS file: products and the trio builder add items to a shared cart (persisted in `localStorage`), the cart page reads/edits that cart, and the checkout form — after passing native HTML5 validation — opens WhatsApp with the full order pre-written to the store number **+55 11 95149-0211**.

No frameworks, no build step. The original earthy/editorial design stays untouched.

## Files

### New
- `public/js/app.js` — single shared script, loaded with `defer` on every page.

### Edited
- `public/index.html` — add cart badge in header, wrap each product in a small add-to-cart form, include `app.js`.
- `public/trio.html` — change the final CTA into a form that reads checked flavors and adds a single "Trio editorial" line item; include `app.js`.
- `public/carrinho.html` — replace mocked `<tbody>` rows with a JS-rendered list; add empty state; include `app.js`.
- `public/checkout.html` — order summary aside becomes JS-rendered from cart; form submission builds the WhatsApp message; include `app.js`.
- `public/sobre.html` — include `app.js` so the header cart badge updates.
- `public/css/style.css` — small additions only: cart-count badge, qty input styling, empty-cart state, add-to-cart confirmation toast.

## How it works

### Cart module (in `app.js`)
- Storage key: `forno-lento-cart`
- Shape: `[{ id, name, price, qty }]` (price in BRL cents to avoid float issues)
- API: `add(item)`, `update(id, qty)`, `remove(id)`, `clear()`, `getAll()`, `getSubtotal()`, `getCount()`
- After every mutation: persist to localStorage and refresh any `[data-cart-count]`, `[data-cart-body]`, `[data-cart-summary]`, `[data-cart-subtotal]`, `[data-cart-total]` nodes on the current page.

### Per-page wiring
- **All pages**: header gets a small `<span data-cart-count>` badge next to the Carrinho link.
- **index.html**: each product card wrapped in `<form data-add-to-cart>` with hidden `id`, `name`, `price` inputs and an "Adicionar ao carrinho" button. Submit handler `preventDefault`s and calls `cart.add(...)`, then shows a brief inline confirmation under the button.
- **trio.html**: existing checkboxes kept. Final CTA becomes a form; on submit, JS reads the 3 checked flavors (validates exactly 3) and adds one item: `{ id: "trio-" + sortedIds, name: "Trio editorial (Flavor A, Flavor B, Flavor C)", price: 3600, qty: 1 }`. Then redirects to `/carrinho.html`.
- **carrinho.html**: `<tbody data-cart-body>` rendered from cart. Each row has a numeric qty input (`min=1`) that calls `update`, and a "Remover" button that calls `remove`. Subtotal, fixed delivery (R$ 12,00 if cart not empty, else R$ 0), and total rendered live. Empty state replaces table when cart is empty, with a link back to products.
- **checkout.html**: order summary aside rendered from cart. Form keeps native HTML5 validation. On `submit`:
  1. `if (!form.checkValidity()) { form.reportValidity(); return; }`
  2. Build message (template below).
  3. `window.open("https://wa.me/5511951490211?text=" + encodeURIComponent(message), "_blank")`.
  4. `cart.clear()`, redirect to `/index.html` with a `?pedido=enviado` query param so the landing can show a thank-you banner.

### WhatsApp message template
```
*Novo pedido — Forno Lento*

Itens:
• Trio editorial (Limão, Cardamomo, Cacau) × 1 — R$ 36,00
• Limão Siciliano × 2 — R$ 26,00
Subtotal: R$ 62,00
Entrega: R$ 12,00
*Total: R$ 74,00*

Cliente: <nome>
Telefone: <telefone>
E-mail: <email>

Entrega:
<endereço>, <número> <complemento>
<cidade> / <estado> — CEP <cep>

Pagamento: <pix | cartão de crédito | boleto>
Observações: <…ou "—" se vazio>
```

## Constants

```js
const STORE_WHATSAPP = "5511951490211"; // wa.me format, digits only
const DELIVERY_BRL_CENTS = 1200;
```

## Out of scope

- No backend, no real payment, no order persistence beyond localStorage.
- Stock/availability checks.
- Discount codes.
- Server-side WhatsApp Business API (the wa.me link opens the user's WhatsApp with the message pre-filled; they tap send).

## Acceptance

- Adding a product on the landing increments the header cart badge on every page.
- Building a trio adds a single "Trio editorial" line and navigates to the cart.
- Cart page reflects current state, supports qty change and remove, shows empty state.
- Checkout summary matches cart; submitting an invalid form shows native validation; submitting a valid form opens WhatsApp to **+55 11 95149-0211** with the full order message and clears the cart.
