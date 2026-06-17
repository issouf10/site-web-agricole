/* ====================================================
   AgriConnect — script.js (version améliorée)
   Panier avec quantités, toast, modal de confirmation
   ==================================================== */

// ── État du panier (tableau d'objets {name, price, qty, emoji}) ──
let cart = JSON.parse(localStorage.getItem('agriCart')) || [];

// Emojis liés aux produits
const EMOJIS = {
  'Tomates Bio': '🍅',
  'Sac de Riz':  '🌾',
  'Aubergines':  '🍆',
  'Piment fort': '🌶️',
  'Gombo':       '🥦',
  'Igname':      '🥔',
  'Banane Plantain': '🍌',
  'Banane Douce':    '🍌',
  'Mangues':     '🥭',
  'Cacao':       '🍫',
  'Café':        '☕',
  'Manioc':      '🌿',
  'Avocats':     '🥑',
  'Coton':       '⚪',
  'Anacarde':    '🥜',
  'Citron':      '🍋',
  'Pack Vente Directe':       '🛒',
  'Consultation Expert':      '👨‍🌾',
  'Abonnement Communauté':    '🤝',
};

function getEmoji(name) {
  for (const [key, val] of Object.entries(EMOJIS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return '🌱';
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  injectCartHTML();
  updateCartUI();
  setupAddButtons();
  setupCartToggle();
  setupNavbarScroll();
});

// ── Injecter le HTML du panier + overlay + toast + modal ──────────
function injectCartHTML() {
  // Overlay sombre
  if (!document.getElementById('cart-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'cart-overlay';
    overlay.className = 'cart-overlay';
    overlay.addEventListener('click', closeCart);
    document.body.appendChild(overlay);
  }

  // Drawer panier
  if (!document.getElementById('cart-drawer')) {
    const drawer = document.createElement('div');
    drawer.id = 'cart-drawer';
    drawer.className = 'cart-drawer';
    drawer.innerHTML = `
      <div class="cart-header">
        <div>
          <h3>🛒 Mon Panier</h3>
          <div class="cart-header-count" id="cart-header-count">0 article</div>
        </div>
        <button class="cart-close" id="close-cart" title="Fermer">✕</button>
      </div>
      <div class="cart-items-wrap" id="cart-items"></div>
      <div class="cart-footer" id="cart-footer" style="display:none;">
        <div class="cart-total-row">
          <span class="cart-total-label">Total</span>
          <span class="cart-total-amount" id="cart-total">0 FCFA</span>
        </div>
        <button class="btn-checkout" id="btn-checkout">
          Passer la commande &nbsp;→
        </button>
        <p class="cart-note">🔒 Paiement sécurisé · Livraison locale</p>
      </div>
    `;
    document.body.appendChild(drawer);

    document.getElementById('close-cart').addEventListener('click', closeCart);
    document.getElementById('btn-checkout').addEventListener('click', handleCheckout);
  }

  // Toast notification
  if (!document.getElementById('toast')) {
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  // Modal de confirmation
  if (!document.getElementById('order-modal')) {
    const modal = document.createElement('div');
    modal.id = 'order-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <span class="modal-icon">🎉</span>
        <h3>Commande confirmée !</h3>
        <p>Merci pour votre achat. Un producteur local va vous contacter bientôt.</p>
        <div class="modal-total" id="modal-total"></div>
        <button class="modal-close-btn" id="modal-close">Continuer mes achats</button>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  }
}

// ── Navbar scroll effect ──────────────────────────────────────────
function setupNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ── Boutons "Ajouter au panier" ───────────────────────────────────
function setupAddButtons() {
  document.querySelectorAll('.btn-add').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const card = button.closest('.card');
      if (!card) return;
      const name  = card.getAttribute('data-name');
      const price = parseInt(card.getAttribute('data-price'), 10) || 0;
      addToCart(name, price);

      // Feedback visuel sur le bouton
      button.textContent = '✓ Ajouté !';
      button.classList.add('added');
      setTimeout(() => {
        button.textContent = 'Ajouter au panier';
        button.classList.remove('added');
      }, 1600);
    });
  });
}

// ── Ouverture/fermeture ───────────────────────────────────────────
function setupCartToggle() {
  // Délégation : le bouton panier dans la nav
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.cart-nav a, .cart-nav-btn');
    if (btn) {
      e.preventDefault();
      toggleCart();
    }
  });
}

function toggleCart() {
  const open = document.getElementById('cart-drawer').classList.contains('active');
  open ? closeCart() : openCart();
}

function openCart() {
  document.getElementById('cart-drawer').classList.add('active');
  document.getElementById('cart-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-drawer')?.classList.remove('active');
  document.getElementById('cart-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

// ── Logique panier ────────────────────────────────────────────────
function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1, emoji: getEmoji(name) });
  }
  saveCart();
  updateCartUI();
  openCart();
  showToast(`${getEmoji(name)} ${name} ajouté au panier`);
  animateBadge();
}

function changeQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.name !== name);
  }
  saveCart();
  updateCartUI();
}

function removeFromCart(name) {
  cart = cart.filter(i => i.name !== name);
  saveCart();
  updateCartUI();
  showToast('Article retiré du panier');
}

function saveCart() {
  localStorage.setItem('agriCart', JSON.stringify(cart));
}

// ── Mise à jour de l'UI ───────────────────────────────────────────
function updateCartUI() {
  const countEls   = document.querySelectorAll('#cart-count');
  const itemsEl    = document.getElementById('cart-items');
  const totalEl    = document.getElementById('cart-total');
  const footerEl   = document.getElementById('cart-footer');
  const headerCount= document.getElementById('cart-header-count');

  const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Badge nav
  countEls.forEach(el => { el.textContent = totalQty; });

  // Header count
  if (headerCount) {
    headerCount.textContent = totalQty === 0 ? 'Panier vide'
      : `${totalQty} article${totalQty > 1 ? 's' : ''}`;
  }

  // Items
  if (itemsEl) {
    if (cart.length === 0) {
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <p>Votre panier est vide.<br>Ajoutez des produits frais !</p>
        </div>`;
      if (footerEl) footerEl.style.display = 'none';
    } else {
      itemsEl.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-emoji">${item.emoji}</div>
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${(item.price * item.qty).toLocaleString('fr-FR')} FCFA</div>
            <div class="cart-item-qty">
              <button class="qty-btn" onclick="changeQty('${escHtml(item.name)}', -1)">−</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn" onclick="changeQty('${escHtml(item.name)}', 1)">+</button>
            </div>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart('${escHtml(item.name)}')" title="Retirer">✕</button>
        </div>
      `).join('');
      if (footerEl) footerEl.style.display = 'block';
    }
  }

  // Total
  if (totalEl) totalEl.textContent = totalPrice.toLocaleString('fr-FR') + ' FCFA';
}

function escHtml(str) {
  return str.replace(/'/g, "\\'");
}

// ── Badge animation ───────────────────────────────────────────────
function animateBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => {
    b.classList.remove('bump');
    void b.offsetWidth; // reflow
    b.classList.add('bump');
    setTimeout(() => b.classList.remove('bump'), 400);
  });
}

// ── Toast ─────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── Checkout ──────────────────────────────────────────────────────
function handleCheckout() {
  if (cart.length === 0) return;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const modalTotal = document.getElementById('modal-total');
  if (modalTotal) {
    modalTotal.textContent = `💰 Total : ${total.toLocaleString('fr-FR')} FCFA`;
  }
  closeCart();
  document.getElementById('order-modal')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('order-modal')?.classList.remove('active');
  document.body.style.overflow = '';
  // Vider le panier après commande
  cart = [];
  saveCart();
  updateCartUI();
}