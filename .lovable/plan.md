# Cookie Shop — Static HTML5 + CSS Site

A pure static, multi-page cookie shop. No JavaScript, no frameworks, no build step. Just HTML files and one shared stylesheet, served from the project's `public/` folder so the preview can serve them directly.

## File structure

```
public/
  index.html       Landing + Products
  trio.html        Build Your Trio (checkbox-only)
  carrinho.html    Cart with mocked items
  checkout.html    Checkout form (HTML5 validation)
  sobre.html       About
  css/
    style.css      Single shared stylesheet
```

The existing React app stays in place but the static site lives under `public/` so each page is reachable directly (e.g. `/index.html`, `/trio.html`). The published preview entry point will be the static `index.html`.

## Design system

- Background: `#FAF7F2`
- Text: `#1A1208`
- CTA / accent: `#3B2507`
- Subtle dividers / muted text: derived warm browns (e.g. `#C9BFB1`, `#5C4632`) — earthy only, no neon
- Typography (Google Fonts):
  - Headings: Playfair Display (editorial serif, generous sizes, tight leading)
  - Body: Lora (warm, readable serif)
- No icons, no gradients, no shadows beyond a soft hairline border
- Generous whitespace, large hero type, image-led product cards, editorial captions
- Buttons: solid `#3B2507` background, cream text, square or 2px radius, uppercase tracked label

## Pages

### 1. index.html — Landing + Products
- Top nav: Início, Produtos, Carrinho, Sobre (Trio is intentionally NOT in nav)
- Hero: large editorial headline + subcopy + CTA "Monte seu trio" → `trio.html`
- Story strip: short paragraph about the bakery
- Products grid: 6–8 cookie cards (image placeholder, name, short description, price). CSS Grid, 1 col mobile → 2 col tablet → 3 col desktop
- Secondary CTA band linking again to `trio.html`
- Footer with links to Sobre and Carrinho

### 2. trio.html — Build Your Trio
- Linked only from the Landing page (hero CTA + band), not from main nav
- Intro copy explaining "pick any 3 cookies for a fixed price"
- A `<form>` (action `carrinho.html`, method `get`) with a grid of cookie options as `<label>` + `<input type="checkbox">`. Each label shows cookie name, short note, and uses CSS to style the selected state via `:checked + ...` / `:has()` where supported
- Submit button "Adicionar ao carrinho" → goes to `carrinho.html`
- Note: with no JS we can't enforce "exactly 3" — copy will state the rule, and the cart page will show a fixed mocked trio

### 3. carrinho.html — Cart (mocked)
- Heading "Seu carrinho"
- Table/list of 3–4 mocked line items (name, qty, unit price, line total) using semantic `<table>` styled as an editorial list on desktop and stacked cards on mobile
- Order summary block: subtotal, shipping, total
- Two actions: "Continuar comprando" → `index.html`, and primary "Finalizar compra" → `checkout.html` (only entry point to checkout)

### 4. checkout.html — Checkout
- Heading + short reassurance copy
- Two-column layout on desktop (form left, order summary right), single column on mobile
- Native HTML5 form with required validation:
  - Nome completo (`required`, `minlength`)
  - Email (`type="email"`, `required`)
  - Telefone (`type="tel"`, `pattern`, `required`)
  - CEP (`pattern="\d{5}-?\d{3}"`, `required`)
  - Endereço, Número, Cidade, Estado (`required`)
  - Forma de pagamento (`<select required>`: Pix, Cartão, Boleto)
  - Observações (`<textarea>`, optional)
- Submit button "Confirmar pedido" (form `action="#"` since no backend)
- Order summary mirrors cart totals

### 5. sobre.html — About
- Editorial long-form layout: large headline, lede paragraph, two-column body text on desktop
- Sections: Nossa história, Ingredientes, Onde encontrar
- Quiet footer

## Navigation rules
- Main nav (every page except trio/checkout for clarity): Início · Produtos (anchor to `#produtos` on index) · Carrinho · Sobre
- `trio.html` reachable only via Landing CTAs
- `checkout.html` reachable only via the Cart's "Finalizar compra" button
- All navigation is plain `<a href="...">` — no JS routing

## Responsive approach
- Mobile-first base styles
- Breakpoints: `min-width: 640px` (tablet), `min-width: 960px` (desktop)
- Layouts use Flexbox for nav/footer/summary rows and CSS Grid for product/trio grids
- Fluid type using `clamp()` for headings

## Technical notes
- Files placed in `public/` so Vite serves them as-is at the root path; no React involvement on those routes
- Google Fonts loaded via `<link rel="preconnect">` + stylesheet link in each page's `<head>`
- One shared `public/css/style.css` imported by every page
- Cookie images: use neutral placeholder image (`/placeholder.svg` already in project) so no external assets are required; real photography can be swapped in later
- No JavaScript anywhere; checkbox "selected" visuals done purely with CSS sibling/`:has()` selectors with a graceful fallback border
