// ── Translations ──
const TRANSLATIONS = {
  en: {
    'nav-shop': 'Shop', 'nav-deals': 'Deals', 'nav-contact': 'Contact',
    'nav-cta': 'Shop Now',
    'hero-h1': 'Shop smarter with us today.',
    'hero-text': 'Shopping with us today and buy our best quality products. Sign up to have the best deal on our website.',
    'hero-cta': 'View Deals',
    'stat-rating': 'Customer rating', 'stat-ordering': 'Online ordering', 'stat-checkout': 'Secure checkout',
    'float-label': "Today's Pick", 'float-discount': 'Up to 35% off',
    'brand-shipping': 'Fast shipping', 'brand-payments': 'Secure payments', 'brand-quality': 'Quality products', 'brand-returns': 'Easy returns',
    'shop-eyebrow': 'Featured collection', 'shop-h2': 'Products your customers will notice.', 'shop-p': 'Replace these sample products with your real inventory anytime.',
    'deal-eyebrow': 'Limited offer', 'deal-h2': 'Make your first order feel special.', 'deal-p': 'Use this section for discounts, bundles, or seasonal promotions that push customers to buy today.', 'deal-cta': 'Shop the Deal',
    'news-eyebrow': 'Stay connected', 'news-h2': 'Get updates, deals, and new arrivals.', 'news-btn': 'Subscribe',
    'footer-copy': '© 2026 BlindersPower LLC. All rights reserved.', 'footer-privacy': 'Privacy', 'footer-terms': 'Terms', 'footer-support': 'Support',
    'footer-tagline': 'Premium products, trusted service.',
    'footer-contact-title': 'Contact Us',
    'footer-address': '123 Main Street, Miami, FL 33101',
    'footer-hours': 'Mon – Fri: 9 AM – 6 PM EST',
    'cart-title': 'Your Cart', 'cart-subtotal': 'Subtotal', 'cart-shipping-note': 'Shipping & taxes calculated at checkout', 'cart-checkout-btn': 'Proceed to Checkout',
    'checkout-title': 'Checkout', 'checkout-contact': 'Contact & Shipping', 'checkout-submit': 'Place Order →',
    'checkout-success-h3': 'Order Placed!', 'checkout-success-p': "Thank you! You'll receive a confirmation email shortly.", 'checkout-done': 'Continue Shopping',
    // placeholders
    'checkout-name': 'Full name', 'checkout-email': 'Email address', 'checkout-address': 'Shipping address', 'checkout-city': 'City', 'checkout-zip': 'ZIP / Postal code',
    'news-email': 'Enter your email',
  },
  fr: {
    'nav-shop': 'Boutique', 'nav-deals': 'Offres', 'nav-contact': 'Contact',
    'nav-cta': 'Acheter',
    'hero-h1': 'Achetez mieux avec nous.',
    'hero-text': "Faites vos achats chez nous et découvrez nos produits de qualité supérieure. Inscrivez-vous pour profiter des meilleures offres.",
    'hero-cta': 'Voir les offres',
    'stat-rating': 'Avis clients', 'stat-ordering': 'Commande en ligne', 'stat-checkout': 'Paiement sécurisé',
    'float-label': 'Sélection du jour', 'float-discount': "Jusqu'à 35% de réduction",
    'brand-shipping': 'Livraison rapide', 'brand-payments': 'Paiements sécurisés', 'brand-quality': 'Produits de qualité', 'brand-returns': 'Retours faciles',
    'shop-eyebrow': 'Collection vedette', 'shop-h2': 'Des produits que vos clients remarqueront.', 'shop-p': 'Remplacez ces exemples par votre vrai inventaire à tout moment.',
    'deal-eyebrow': 'Offre limitée', 'deal-h2': 'Rendez votre première commande inoubliable.', 'deal-p': 'Utilisez cette section pour des remises, des lots ou des promotions saisonnières.', 'deal-cta': "Profiter de l'offre",
    'news-eyebrow': 'Restez connecté', 'news-h2': 'Recevez offres, nouveautés et mises à jour.', 'news-btn': "S'abonner",
    'footer-copy': '© 2026 BlindersPower LLC. Tous droits réservés.', 'footer-privacy': 'Confidentialité', 'footer-terms': 'Conditions', 'footer-support': 'Assistance',
    'footer-tagline': 'Produits premium, service de confiance.',
    'footer-contact-title': 'Contactez-nous',
    'footer-address': '123 rue Principale, Miami, FL 33101',
    'footer-hours': 'Lun – Ven : 9h – 18h HNE',
    'cart-title': 'Votre panier', 'cart-subtotal': 'Sous-total', 'cart-shipping-note': 'Livraison et taxes calculées à la caisse', 'cart-checkout-btn': 'Passer à la caisse',
    'checkout-title': 'Caisse', 'checkout-contact': 'Contact et livraison', 'checkout-submit': 'Passer la commande →',
    'checkout-success-h3': 'Commande passée !', 'checkout-success-p': 'Merci ! Vous recevrez un e-mail de confirmation sous peu.', 'checkout-done': 'Continuer les achats',
    // placeholders
    'checkout-name': 'Nom complet', 'checkout-email': 'Adresse e-mail', 'checkout-address': 'Adresse de livraison', 'checkout-city': 'Ville', 'checkout-zip': 'Code postal',
    'news-email': 'Votre adresse e-mail',
  }
};

function setLang(lang) {
  localStorage.setItem('novamart-lang', lang);
  document.documentElement.lang = lang;
  const t = TRANSLATIONS[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key] !== undefined) el.placeholder = t[key];
  });
  updateLangButtons(lang);
}

function updateLangButtons(lang) {
  document.getElementById('lang-en')?.classList.toggle('active', lang === 'en');
  document.getElementById('lang-fr')?.classList.toggle('active', lang === 'fr');
}

// Restore saved language
(function () {
  const saved = localStorage.getItem('novamart-lang') || 'en';
  setLang(saved);
})();

document.getElementById('lang-en')?.addEventListener('click', () => { setLang('en'); navLinks?.classList.remove('open'); });
document.getElementById('lang-fr')?.addEventListener('click', () => { setLang('fr'); navLinks?.classList.remove('open'); });

// ── Theme ──
function setTheme(theme) {
  document.body.classList.toggle('theme-light', theme === 'light');
  localStorage.setItem('novamart-theme', theme);
  updateThemeButtons(theme);
}

function updateThemeButtons(theme) {
  document.getElementById('theme-dark')?.classList.toggle('active', theme !== 'light');
  document.getElementById('theme-light')?.classList.toggle('active', theme === 'light');
}

// Restore saved theme on load
(function () {
  const saved = localStorage.getItem('novamart-theme') || 'dark';
  if (saved === 'light') document.body.classList.add('theme-light');
  updateThemeButtons(saved);
})();

document.getElementById('theme-dark')?.addEventListener('click', () => {
  setTheme('dark');
  navLinks?.classList.remove('open');
});
document.getElementById('theme-light')?.addEventListener('click', () => {
  setTheme('light');
  navLinks?.classList.remove('open');
});

// ── Nav menu ──
const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

menuBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  navLinks.classList.toggle('open');
});

// Close when a link is clicked
navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// Close when clicking outside the menu
document.addEventListener('click', (e) => {
  if (!e.target.closest('.menu-btn') && !e.target.closest('.nav-links')) {
    navLinks?.classList.remove('open');
  }
});

// ── Brand strip marquee ──
const strip = document.querySelector('.strip-inner');
if (strip) {
  [...strip.children].forEach(item => strip.appendChild(item.cloneNode(true)));
}

// ── Scroll animations ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.animate-up, .animate-left, .animate-right').forEach(el => observer.observe(el));

// ── Stat counter ──
function animateCounter(el, target, suffix, decimals) {
  const duration = 1600;
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = decimals ? (target * eased).toFixed(decimals) : Math.round(target * eased);
    el.textContent = value + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    animateCounter(el, parseFloat(el.dataset.target), el.dataset.suffix || '', parseInt(el.dataset.decimals || '0'));
    counterObserver.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// ── Products catalogue (loaded from Supabase, seeded with defaults) ──
const DEFAULT_PRODUCTS = [
  { id: 'urban-sneakers', name: 'Urban Sneakers', price: 89.99, tag: 'Trending', description: 'Comfortable everyday style with a premium streetwear look.', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'] },
  { id: 'smart-watch', name: 'Classic Smart Watch', price: 129.00, tag: 'Best Seller', description: 'A clean, modern accessory for work, gym, and daily life.', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'] },
  { id: 'headphones', name: 'Wireless Headphones', price: 74.50, tag: 'New Arrival', description: 'Deep sound, clean design, and all-day comfort.', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'] }
];

let PRODUCTS = {};

async function getStoreProducts() {
  const { data, error } = await db.from('products').select('*').order('created_at');
  if (error || !data || data.length === 0) return DEFAULT_PRODUCTS;
  return data.map(p => ({
    id:          p.id,
    name:        p.name,
    price:       parseFloat(p.price),
    tag:         p.tag || '',
    description: p.description || '',
    img:         p.img_url || '',
    images:      Array.isArray(p.images) ? p.images : (p.img_url ? [p.img_url] : [])
  }));
}

// Render product cards into #product-grid
async function renderProductGrid() {
  const grid = document.getElementById('product-grid');
  if (!grid) return;

  grid.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:40px 0">Loading products…</p>';

  const products = await getStoreProducts();
  PRODUCTS = Object.fromEntries(products.map(p => [p.id, p]));

  if (products.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted);text-align:center;grid-column:1/-1">No products available right now.</p>';
    return;
  }

  grid.innerHTML = products.map((p, i) => `
    <article class="product-card animate-up" style="--delay:${(i * 0.13).toFixed(2)}s" data-pid="${p.id}">
      <div class="product-img-wrap">
        <img src="${p.img || ''}" alt="${p.name}" loading="lazy">
        ${p.tag ? `<span class="tag">${p.tag}</span>` : ''}
        ${(p.images && p.images.length > 1) ? `<span class="pd-img-count">${p.images.length} photos</span>` : ''}
        <button class="quick-add-btn">Quick Add +</button>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.description || ''}</p>
        <div class="price-row">
          <strong>$${parseFloat(p.price).toFixed(2)}</strong>
          <button class="add-cart-btn">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.animate-up').forEach(el => observer.observe(el));
}

// ── Cart state (persisted to localStorage) ──
let cart = JSON.parse(localStorage.getItem('novamart-cart') || '[]');

// Per-browser session ID for abandoned cart tracking
const BPG_SESSION = (() => {
  let id = localStorage.getItem('bpg-session-id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('bpg-session-id', id); }
  return id;
})();

let _cartSyncTimer;
function scheduleCartSync() {
  clearTimeout(_cartSyncTimer);
  _cartSyncTimer = setTimeout(async () => {
    if (typeof db === 'undefined') return;
    if (cart.length === 0) {
      db.from('carts').delete().eq('session_id', BPG_SESSION);
      return;
    }
    await db.from('carts').upsert([{
      session_id:  BPG_SESSION,
      items:       cart,
      total:       cartTotal(),
      updated_at:  new Date().toISOString()
    }], { onConflict: 'session_id' });
  }, 2000);
}

function saveCart() {
  localStorage.setItem('novamart-cart', JSON.stringify(cart));
  scheduleCartSync();
}

function addToCart(pid) {
  const product = PRODUCTS[pid];
  if (!product) return;
  const existing = cart.find(i => i.id === pid);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: pid, name: product.name, price: product.price, img: product.img, qty: 1 });
  }
  saveCart();
  renderCart();
}

function removeFromCart(pid) {
  cart = cart.filter(i => i.id !== pid);
  saveCart();
  renderCart();
}

function updateQty(pid, delta) {
  const item = cart.find(i => i.id === pid);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty === 0) cart = cart.filter(i => i.id !== pid);
  saveCart();
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function cartCount() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

// ── Render cart ──
function renderCart() {
  const body     = document.getElementById('cart-body');
  const foot     = document.getElementById('cart-foot');
  const badge    = document.getElementById('cart-count');
  const subtotal = document.getElementById('cart-subtotal');
  const count    = cartCount();

  badge.textContent = count;
  badge.classList.toggle('visible', count > 0);
  subtotal.textContent = '$' + cartTotal().toFixed(2);
  foot.style.display = count > 0 ? '' : 'none';

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <p>Your cart is empty.</p>
        <a href="#shop" id="cart-shop-link">Start shopping &rarr;</a>
      </div>`;
    document.getElementById('cart-shop-link')?.addEventListener('click', closeCart);
    return;
  }

  body.innerHTML = cart.map(item => `
    <div class="cart-item" data-pid="${item.id}">
      <img class="cart-item-img" src="${item.img}" alt="${item.name}" loading="lazy">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        <div class="cart-item-controls">
          <button class="qty-btn qty-dec" aria-label="Decrease quantity">&minus;</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn qty-inc" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="cart-item-remove" aria-label="Remove ${item.name}">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    </div>
  `).join('');
}

// Quantity / remove via event delegation on cart body
document.getElementById('cart-body').addEventListener('click', (e) => {
  const item = e.target.closest('.cart-item');
  if (!item) return;
  const pid = item.dataset.pid;
  if (e.target.closest('.qty-dec'))          updateQty(pid, -1);
  else if (e.target.closest('.qty-inc'))     updateQty(pid, 1);
  else if (e.target.closest('.cart-item-remove')) removeFromCart(pid);
});

// ── Cart open / close ──
function openCart() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('cart-open').addEventListener('click', openCart);
document.getElementById('cart-close').addEventListener('click', closeCart);
document.getElementById('cart-overlay').addEventListener('click', closeCart);

// ── Add to cart (product card buttons) ──
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-cart-btn, .quick-add-btn');
  if (!btn) return;
  const card = btn.closest('[data-pid]');
  if (!card) return;

  addToCart(card.dataset.pid);
  openCart();

  // Button feedback
  const original = btn.textContent;
  btn.textContent = '✓ Added';
  btn.style.cssText = 'background:linear-gradient(135deg,#4ade80,#16a34a);color:#fff;border-color:transparent';
  setTimeout(() => {
    btn.textContent = original;
    btn.style.cssText = '';
  }, 1500);
});

// ── Checkout ──
function openCheckout() {
  if (cart.length === 0) return;

  const form    = document.getElementById('checkout-form');
  const success = document.getElementById('checkout-success');
  form.style.display = '';
  form.reset();
  success.hidden = true;

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.textContent = 'Place Order →';
  submitBtn.disabled = false;

  document.getElementById('checkout-summary').innerHTML = [
    ...cart.map(item => `
      <div class="checkout-summary-item">
        <span>${item.name} &times; ${item.qty}</span>
        <strong>$${(item.price * item.qty).toFixed(2)}</strong>
      </div>`),
    `<div class="checkout-summary-item">
       <span>Shipping</span>
       <span style="font-weight:700">Free</span>
     </div>`,
    `<div class="checkout-summary-total">
       <span>Total</span>
       <span>$${cartTotal().toFixed(2)}</span>
     </div>`
  ].join('');

  document.getElementById('checkout-modal').classList.add('open');
  closeCart();
}

function closeCheckout() {
  document.getElementById('checkout-modal').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('cart-checkout').addEventListener('click', openCheckout);
document.getElementById('checkout-close').addEventListener('click', closeCheckout);

// Close checkout when clicking backdrop (outside the panel)
document.getElementById('checkout-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeCheckout();
});

// Form submit → save order to Supabase + show success
const CHECKOUT_FN_URL = 'https://yrtuuzwegnjzhvxsbtaq.supabase.co/functions/v1/create-checkout';

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const btn  = form.querySelector('button[type="submit"]');
  btn.textContent = 'Redirecting to payment…';
  btn.disabled = true;

  const fd = new FormData(form);
  const customer = {
    name:    fd.get('name')    || '',
    email:   fd.get('email')   || '',
    address: fd.get('address') || '',
    city:    fd.get('city')    || '',
    zip:     fd.get('zip')     || '',
  };

  try {
    const res  = await fetch(CHECKOUT_FN_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        cart:     cart.map(i => ({ ...i })),
        customer,
        origin:   window.location.origin,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Checkout failed');

    // Clear cart before Stripe redirect so it's clean on return
    cart = [];
    saveCart();

    window.location.href = data.url;
  } catch (err) {
    console.error('Stripe checkout error:', err);
    btn.textContent = 'Place Order →';
    btn.disabled = false;
    alert('Payment setup failed. Please try again.');
  }
});

document.getElementById('checkout-done').addEventListener('click', () => {
  closeCheckout();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Newsletter subscribe ──
document.getElementById('newsletter-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('newsletter-email');
  const btn   = e.target.querySelector('button[type="submit"]');
  const email = input.value.trim();
  if (!email) return;

  const orig = btn.textContent;
  btn.disabled = true;
  btn.textContent = '…';

  const { error } = await db.from('subscribers').insert([{ email }]);

  btn.disabled = false;
  if (error) {
    if (error.code === '23505') {
      btn.textContent = 'Already subscribed!';
    } else {
      btn.textContent = 'Try again';
    }
  } else {
    input.value = '';
    btn.textContent = '✓ Subscribed!';
  }
  setTimeout(() => { btn.textContent = orig; }, 3000);
});

// ── Product Detail Overlay ──
let _pdImages  = [];
let _pdIndex   = 0;
let _pdPid     = '';

function openProductDetail(pid) {
  const p = PRODUCTS[pid];
  if (!p) return;
  _pdPid    = pid;
  _pdImages = (p.images && p.images.length > 0) ? p.images : (p.img ? [p.img] : []);
  _pdIndex  = 0;

  document.getElementById('pd-name').textContent  = p.name;
  document.getElementById('pd-desc').textContent  = p.description || '';
  document.getElementById('pd-price').textContent = '$' + parseFloat(p.price).toFixed(2);

  const tagEl = document.getElementById('pd-tag');
  if (p.tag) { tagEl.textContent = p.tag; tagEl.style.display = ''; }
  else        { tagEl.style.display = 'none'; }

  pdSetImage(0);
  pdRenderThumbs();

  document.getElementById('pd-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function pdSetImage(i) {
  _pdIndex = i;
  const img = document.getElementById('pd-main-img');
  img.style.opacity = '0.4';
  setTimeout(() => {
    img.src = _pdImages[i] || '';
    img.style.opacity = '1';
  }, 80);
  document.querySelectorAll('.pd-thumb').forEach((t, ti) => t.classList.toggle('active', ti === i));
  document.getElementById('pd-prev').classList.toggle('hidden', _pdImages.length <= 1);
  document.getElementById('pd-next').classList.toggle('hidden', _pdImages.length <= 1);
}

function pdRenderThumbs() {
  const container = document.getElementById('pd-thumbs');
  if (_pdImages.length <= 1) { container.innerHTML = ''; return; }
  container.innerHTML = _pdImages.map((url, i) => `
    <button class="pd-thumb${i === 0 ? ' active' : ''}" data-ti="${i}">
      <img src="${url}" alt="" loading="lazy">
    </button>`).join('');
}

function closePd() {
  document.getElementById('pd-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('pd-back')?.addEventListener('click', closePd);
document.getElementById('pd-overlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closePd();
});
document.getElementById('pd-prev')?.addEventListener('click', (e) => {
  e.stopPropagation();
  pdSetImage((_pdIndex - 1 + _pdImages.length) % _pdImages.length);
});
document.getElementById('pd-next')?.addEventListener('click', (e) => {
  e.stopPropagation();
  pdSetImage((_pdIndex + 1) % _pdImages.length);
});
document.getElementById('pd-thumbs')?.addEventListener('click', (e) => {
  const btn = e.target.closest('.pd-thumb');
  if (btn) pdSetImage(parseInt(btn.dataset.ti));
});
document.getElementById('pd-add-cart')?.addEventListener('click', () => {
  addToCart(_pdPid);
  closePd();
  openCart();
});

// Open detail when clicking card body (but not the "Add to Cart" buttons)
document.addEventListener('click', (e) => {
  if (e.target.closest('.add-cart-btn, .quick-add-btn')) return;
  const card = e.target.closest('.product-card[data-pid]');
  if (card) openProductDetail(card.dataset.pid);
});

// ── Legal Modals (Privacy & Terms) ──
document.getElementById('open-privacy')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('privacy-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
});
document.getElementById('close-privacy')?.addEventListener('click', () => {
  document.getElementById('privacy-modal').classList.remove('open');
  document.body.style.overflow = '';
});
document.getElementById('privacy-modal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.remove('open');
    document.body.style.overflow = '';
  }
});

document.getElementById('open-terms')?.addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('terms-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
});
document.getElementById('close-terms')?.addEventListener('click', () => {
  document.getElementById('terms-modal').classList.remove('open');
  document.body.style.overflow = '';
});
document.getElementById('terms-modal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.remove('open');
    document.body.style.overflow = '';
  }
});

// ── Init ──
renderProductGrid();
renderCart();
