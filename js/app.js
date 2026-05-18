import { renderAll } from './js-modules/renderizar.js';
import {
  wireAddToCartForms,
  wireCartInteractions,
  wireCheckoutForm,
  wireTrioForm,
  showOrderBanner,
} from './js-modules/wiring.js';

document.addEventListener('DOMContentLoaded', () => {
  wireAddToCartForms();
  wireTrioForm();
  wireCartInteractions();
  wireCheckoutForm();
  showOrderBanner();
  renderAll();
});
