import { readCart, writeCart } from './cartSubmit.js';

export const cart = {
  getAll() {
    return readCart();
  },
  getCount() {
    return readCart().reduce((n, i) => n + (i.qty || 0), 0);
  },
  getSubtotal() {
    return readCart().reduce((s, i) => s + (i.price || 0) * (i.qty || 0), 0);
  },
  add(item) {
    const items = readCart();
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      existing.qty += item.qty || 1;
    } else {
      items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty || 1,
      });
    }
    writeCart(items);
  },
  update(id, qty) {
    const items = readCart();
    const it = items.find((i) => i.id === id);
    if (!it) return;
    it.qty = Math.max(1, parseInt(qty, 10) || 1);
    writeCart(items);
  },
  remove(id) {
    writeCart(readCart().filter((i) => i.id !== id));
  },
  clear() {
    writeCart([]);
  },
};
