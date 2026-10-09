/**
 * Shree Sai Enterprises - Quotation Cart Manager
 */

const SSE_Cart = (function () {
  const STORAGE_KEY = 'sse_quote_cart_v1';

  function getCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Cart load error:', e);
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
      updateCartBadge();
      window.dispatchEvent(new CustomEvent('sse_cart_updated', { detail: cart }));
    } catch (e) {
      console.error('Cart save error:', e);
    }
  }

  function addItem(product, quantity = 1) {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === product.id);

    const qty = parseInt(quantity, 10) || 1;

    if (existingIndex > -1) {
      cart[existingIndex].quantity += qty;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        category_name: product.category_name || 'Solar Equipment',
        hsn_code: product.hsn_code || '85414011',
        approx_price: parseFloat(product.approx_price) || 0,
        gst_rate: parseFloat(product.gst_rate) || 12,
        primary_image: product.primary_image || '/images/products/mono-perc-550w.svg',
        warranty: product.warranty || 'Standard Warranty',
        quantity: qty
      });
    }

    saveCart(cart);
    if (typeof showToast === 'function') {
      showToast(`Added "${product.name}" to Quotation Cart!`, 'success');
    }
    return cart;
  }

  function updateQuantity(productId, newQty) {
    let cart = getCart();
    const qty = parseInt(newQty, 10);
    if (qty <= 0) {
      cart = cart.filter(item => item.id !== productId);
    } else {
      const item = cart.find(item => item.id === productId);
      if (item) item.quantity = qty;
    }
    saveCart(cart);
    return cart;
  }

  function removeItem(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    if (typeof showToast === 'function') {
      showToast('Item removed from quotation.', 'info');
    }
    return cart;
  }

  function clearCart() {
    saveCart([]);
  }

  function getCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  }

  function getSubtotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + ((item.approx_price || 0) * (item.quantity || 1)), 0);
  }

  function updateCartBadge() {
    const count = getCount();
    const badges = document.querySelectorAll('.cart-badge-count');
    badges.forEach(b => {
      b.textContent = count;
      if (count > 0) {
        b.classList.remove('hidden');
      } else {
        b.classList.add('hidden');
      }
    });
  }

  return {
    getCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getCount,
    getSubtotal,
    updateCartBadge
  };
})();

// Initialize badge when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  SSE_Cart.updateCartBadge();
});
