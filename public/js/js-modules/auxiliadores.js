export function setText(sel, text) {
  document.querySelectorAll(sel).forEach(function (el) {
    el.textContent = text;
  });
}
export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c];
  });
}
export function escapeAttr(s) {
  return escapeHtml(s);
}

export function brl(cents) {
  return 'R$ ' + (cents / 100).toFixed(2).replace('.', ',');
}
