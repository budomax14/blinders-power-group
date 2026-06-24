// ══════════════════════════════════════════
//  BLINDERS POWER GROUP — ADMIN PANEL
//  Backend: Supabase
// ══════════════════════════════════════════

// ── Default products shown when the Supabase table is empty ──
const DEFAULT_PRODUCTS = [
  { id: 'urban-sneakers', name: 'Urban Sneakers', price: 89.99, tag: 'Trending', description: 'Comfortable everyday style with a premium streetwear look.', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80' },
  { id: 'smart-watch', name: 'Classic Smart Watch', price: 129.00, tag: 'Best Seller', description: 'A clean, modern accessory for work, gym, and daily life.', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80' },
  { id: 'headphones', name: 'Wireless Headphones', price: 74.50, tag: 'New Arrival', description: 'Deep sound, clean design, and all-day comfort.', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80' }
];

// ── Row mappers ──
function mapProduct(row) {
  return {
    id:          row.id,
    name:        row.name,
    price:       parseFloat(row.price),
    tag:         row.tag || '',
    description: row.description || '',
    img:         row.img_url || ''
  };
}

function mapOrder(row) {
  return {
    id:     row.id,
    date:   row.date || row.created_at,
    status: row.status || 'pending',
    total:  parseFloat(row.total) || 0,
    items:  Array.isArray(row.items) ? row.items : [],
    customer: {
      name:    row.customer_name    || '',
      email:   row.customer_email   || '',
      address: row.customer_address || '',
      city:    row.customer_city    || '',
      zip:     row.customer_zip     || ''
    }
  };
}

// ── Data fetchers ──
async function getProducts() {
  const { data, error } = await db.from('products').select('*').order('created_at');
  if (error) { console.error('getProducts:', error); return [...DEFAULT_PRODUCTS]; }
  return data && data.length > 0 ? data.map(mapProduct) : [...DEFAULT_PRODUCTS];
}

async function getOrders() {
  const { data, error } = await db.from('orders').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getOrders:', error); return []; }
  return (data || []).map(mapOrder);
}

async function getAbandonedCarts() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await db
    .from('carts')
    .select('*')
    .lt('updated_at', cutoff)
    .order('updated_at', { ascending: false });
  if (error) { console.error('getAbandonedCarts:', error); return []; }
  return (data || []).filter(c => Array.isArray(c.items) && c.items.length > 0);
}

// ── EmailJS config (stays in localStorage) ──
function getEmailSettings() { return JSON.parse(localStorage.getItem('novamart-emailjs') || '{}'); }
function saveEmailSettings(cfg) { localStorage.setItem('novamart-emailjs', JSON.stringify(cfg)); }
function initEmailJS() {
  const cfg = getEmailSettings();
  if (cfg.publicKey) {
    try { emailjs.init({ publicKey: cfg.publicKey }); } catch (e) {}
  }
}

// ── Email sending ──
async function sendReceiptEmail(order) {
  const cfg = getEmailSettings();
  if (!cfg.serviceId || !cfg.publicKey || !cfg.receiptTplId)
    throw new Error('EmailJS not configured. Go to Settings to add your credentials.');
  const itemsList = order.items.map(i => `• ${i.name} x${i.qty} = $${(i.price * i.qty).toFixed(2)}`).join('\n');
  return emailjs.send(cfg.serviceId, cfg.receiptTplId, {
    to_email:         order.customer.email,
    to_name:          order.customer.name,
    order_id:         order.id,
    order_date:       new Date(order.date).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }),
    order_items:      itemsList,
    order_total:      '$' + order.total.toFixed(2),
    shipping_address: `${order.customer.address}, ${order.customer.city} ${order.customer.zip}`
  }, cfg.publicKey);
}

async function sendShippingEmail(order, trackingNumber) {
  const cfg = getEmailSettings();
  if (!cfg.serviceId || !cfg.publicKey || !cfg.shippingTplId)
    throw new Error('EmailJS not configured. Go to Settings to add your credentials.');
  return emailjs.send(cfg.serviceId, cfg.shippingTplId, {
    to_email:         order.customer.email,
    to_name:          order.customer.name,
    order_id:         order.id,
    tracking_number:  trackingNumber || 'Will be provided separately',
    shipping_address: `${order.customer.address}, ${order.customer.city} ${order.customer.zip}`
  }, cfg.publicKey);
}

// ── Toast ──
let toastTimer;
function showToast(msg, type = 'success') {
  const toast  = document.getElementById('toast');
  const msgEl  = document.getElementById('toast-msg');
  const iconEl = document.getElementById('toast-icon');
  toast.className = `toast toast-${type}`;
  msgEl.textContent = msg;
  const icons = {
    success: '<polyline points="20 6 9 17 4 12"/>',
    error:   '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
  };
  iconEl.innerHTML = icons[type] || icons.info;
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3400);
}

// ── Modal helpers ──
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// ── Tabs ──
let currentFilter = 'all';

function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-btn[data-tab]').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`)?.classList.add('active');
  document.querySelector(`.sidebar-btn[data-tab="${tab}"]`)?.classList.add('active');
  if (tab === 'dashboard')   renderDashboard();
  if (tab === 'products')    renderProductsTable();
  if (tab === 'orders')      renderOrdersTable();
  if (tab === 'carts')       renderCartsTab();
  if (tab === 'subscribers') renderSubscribersTab();
  if (tab === 'settings')    loadSettings();
}

document.querySelectorAll('.sidebar-btn[data-tab]').forEach(btn => {
  btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ── Chart instances ──
let chartRevenue = null;
let chartStatus  = null;

// ── Badge helper ──
function statusBadge(status) {
  const labels = { pending:'Pending', processing:'Processing', shipped:'Shipped', delivered:'Delivered' };
  return `<span class="badge badge-${status}">${labels[status] || status}</span>`;
}

// ══════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════
async function renderDashboard() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('dash-subtitle')?.textContent && (document.getElementById('dash-subtitle').textContent = `${greeting}, Admin`);
  document.getElementById('dash-date-text') && (document.getElementById('dash-date-text').textContent = dateStr);

  const [orders, products] = await Promise.all([getOrders(), getProducts()]);
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pending = orders.filter(o => o.status === 'pending').length;

  document.getElementById('stat-orders').textContent   = orders.length;
  document.getElementById('stat-revenue').textContent  = '$' + revenue.toFixed(2);
  document.getElementById('stat-products').textContent = products.length;
  document.getElementById('stat-pending').textContent  = pending;

  const badge = document.getElementById('pending-badge');
  badge.textContent = pending || '';
  badge.classList.toggle('show', pending > 0);

  renderCharts(orders);

  const el = document.getElementById('dashboard-orders');
  const recent = orders.slice(0, 5);
  if (recent.length === 0) {
    el.innerHTML = `<div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      <p>No orders yet.</p><small>Orders placed on your store will appear here.</small></div>`;
    return;
  }
  el.innerHTML = `<table>
    <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
    <tbody>${recent.map(o => `<tr>
      <td><strong>${o.id}</strong></td>
      <td>${o.customer.name}<br><small style="color:var(--muted)">${o.customer.email}</small></td>
      <td><strong style="color:var(--gold)">$${o.total.toFixed(2)}</strong></td>
      <td>${statusBadge(o.status)}</td>
    </tr>`).join('')}</tbody></table>`;
}

// ══════════════════════════════════════════
//  CHARTS
// ══════════════════════════════════════════
function renderCharts(orders) {
  // Revenue — last 7 days
  const days = [], revenues = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const dayStr = d.toISOString().slice(0, 10);
    revenues.push(orders
      .filter(o => o.date && o.date.slice(0, 10) === dayStr)
      .reduce((s, o) => s + (o.total || 0), 0));
  }

  const weekTotal = revenues.reduce((s, v) => s + v, 0);
  const revenueEl = document.getElementById('chart-revenue-total');
  if (revenueEl) revenueEl.textContent = '$' + weekTotal.toFixed(2);

  const gridColor = 'rgba(255,255,255,0.05)';
  const tickColor = '#8896aa';
  const tooltipTheme = {
    backgroundColor: '#0f1825', titleColor: '#8896aa', bodyColor: '#f1f5f9',
    borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1
  };

  const ctxRev = document.getElementById('chart-revenue')?.getContext('2d');
  if (ctxRev) {
    if (chartRevenue) chartRevenue.destroy();
    chartRevenue = new Chart(ctxRev, {
      type: 'line',
      data: {
        labels: days,
        datasets: [{
          data: revenues,
          borderColor: '#f7c948',
          backgroundColor: 'rgba(247,201,72,0.07)',
          borderWidth: 2.5,
          pointBackgroundColor: '#f7c948',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.42,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { ...tooltipTheme, callbacks: { label: c => ' $' + c.parsed.y.toFixed(2) } } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 } } },
          y: { grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 11 }, callback: v => '$' + v }, beginAtZero: true }
        }
      }
    });
  }

  // Order status donut
  const counts = { pending: 0, processing: 0, shipped: 0, delivered: 0 };
  orders.forEach(o => { if (counts.hasOwnProperty(o.status)) counts[o.status]++; });

  const ctxStatus = document.getElementById('chart-status')?.getContext('2d');
  if (ctxStatus) {
    if (chartStatus) chartStatus.destroy();
    chartStatus = new Chart(ctxStatus, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'Processing', 'Shipped', 'Delivered'],
        datasets: [{
          data: [counts.pending, counts.processing, counts.shipped, counts.delivered],
          backgroundColor: ['rgba(251,146,60,0.75)', 'rgba(96,165,250,0.75)', 'rgba(74,222,128,0.75)', 'rgba(136,150,170,0.45)'],
          borderColor:     ['rgba(251,146,60,1)',    'rgba(96,165,250,1)',    'rgba(74,222,128,1)',    'rgba(136,150,170,0.7)'],
          borderWidth: 1.5,
          hoverOffset: 5
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: tickColor, padding: 14, font: { size: 11 }, usePointStyle: true, pointStyleWidth: 8 }
          },
          tooltip: tooltipTheme
        }
      }
    });
  }
}

// ══════════════════════════════════════════
//  ABANDONED CARTS
// ══════════════════════════════════════════
async function renderCartsTab() {
  const label = document.getElementById('carts-count-label');
  const badge = document.getElementById('carts-badge');
  const tbody = document.getElementById('carts-tbody');
  const empty = document.getElementById('carts-empty');

  if (label) label.textContent = 'Loading…';

  const carts = await getAbandonedCarts();

  if (label) label.textContent = `${carts.length} abandoned cart${carts.length !== 1 ? 's' : ''} (idle > 24 h)`;
  if (badge) { badge.textContent = carts.length || ''; badge.classList.toggle('show', carts.length > 0); }

  if (!tbody) return;
  if (carts.length === 0) { tbody.innerHTML = ''; if (empty) empty.hidden = false; return; }
  if (empty) empty.hidden = true;

  tbody.innerHTML = carts.map(c => {
    const items    = Array.isArray(c.items) ? c.items : [];
    const itemQty  = items.reduce((s, i) => s + (i.qty || 1), 0);
    const hoursAgo = Math.round((Date.now() - new Date(c.updated_at)) / 3_600_000);
    const timeLabel = hoursAgo < 48 ? `${hoursAgo}h ago` : `${Math.round(hoursAgo / 24)}d ago`;
    const products  = items.map(i => i.name).join(', ');
    return `<tr>
      <td>
        <div style="font-size:0.75rem;font-family:monospace;color:var(--muted)">${c.session_id.slice(0,14)}…</div>
        ${c.email
          ? `<div style="color:var(--blue);font-weight:600;font-size:0.82rem;margin-top:2px">${c.email}</div>`
          : `<div style="color:var(--muted);font-size:0.78rem;margin-top:2px">Unknown visitor</div>`}
      </td>
      <td>
        <strong>${itemQty} item${itemQty !== 1 ? 's' : ''}</strong>
        <div style="color:var(--muted);font-size:0.76rem;margin-top:2px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${products}</div>
      </td>
      <td><strong style="color:var(--gold)">$${parseFloat(c.total || 0).toFixed(2)}</strong></td>
      <td><span style="color:var(--orange)">${timeLabel}</span></td>
      <td class="td-actions">
        <button class="btn btn-danger btn-sm btn-icon" title="Remove record" onclick="clearAbandonedCart('${c.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');
}

async function clearAbandonedCart(id) {
  if (!confirm('Remove this cart record?')) return;
  await db.from('carts').delete().eq('id', id);
  renderCartsTab();
  showToast('Cart record removed.', 'info');
}

// ══════════════════════════════════════════
//  PRODUCTS
// ══════════════════════════════════════════
async function renderProductsTable() {
  const products = await getProducts();
  const tbody = document.getElementById('products-tbody');
  const empty = document.getElementById('products-empty');
  if (products.length === 0) { tbody.innerHTML = ''; empty.hidden = false; return; }
  empty.hidden = true;
  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img class="product-thumb" src="${p.img || ''}" alt="${p.name}" onerror="this.style.opacity=0.3"></td>
      <td><strong>${p.name}</strong></td>
      <td><strong style="color:var(--gold)">$${parseFloat(p.price).toFixed(2)}</strong></td>
      <td>${p.tag ? `<span class="badge" style="background:rgba(247,201,72,0.12);color:var(--gold)">${p.tag}</span>` : '<span style="color:var(--muted)">—</span>'}</td>
      <td style="color:var(--muted);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.description || '—'}</td>
      <td class="td-actions">
        <button class="btn btn-secondary btn-sm btn-icon" title="Edit" onclick="openEditProduct('${p.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn btn-danger btn-sm btn-icon" title="Delete" onclick="deleteProduct('${p.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </button>
      </td>
    </tr>`).join('');
}

document.getElementById('add-product-btn').addEventListener('click', () => {
  document.getElementById('product-modal-title').textContent = 'Add Product';
  document.getElementById('edit-pid').value = '';
  document.getElementById('product-form').reset();
  resetImgField();
  openModal('product-modal');
});

async function openEditProduct(id) {
  const products = await getProducts();
  const p = products.find(p => p.id === id);
  if (!p) return;
  document.getElementById('product-modal-title').textContent = 'Edit Product';
  document.getElementById('edit-pid').value  = p.id;
  document.getElementById('p-name').value    = p.name;
  document.getElementById('p-price').value   = p.price;
  document.getElementById('p-tag').value     = p.tag || '';
  document.getElementById('p-desc').value    = p.description || '';
  resetImgField();
  setImgPreview(p.img || '');
  openModal('product-modal');
}

// ── Image upload ──
let _pendingImgFile = null;

const imgUploadArea = document.getElementById('img-upload-area');
const imgFileInput  = document.getElementById('p-img-file');
const imgPreview    = document.getElementById('img-preview');
const imgUrlToggle  = document.getElementById('img-url-toggle');
const imgUrlInput   = document.getElementById('p-img');

imgUploadArea.addEventListener('click', (e) => {
  if (e.target === imgUrlToggle) return;
  imgFileInput.click();
});

imgFileInput.addEventListener('change', () => {
  const file = imgFileInput.files[0];
  if (!file) return;
  _pendingImgFile = file;
  const reader = new FileReader();
  reader.onload = (ev) => {
    imgPreview.src = ev.target.result;
    imgUploadArea.classList.add('has-image');
    imgUrlInput.style.display = 'none';
    imgUrlToggle.textContent = 'use an image URL instead';
  };
  reader.readAsDataURL(file);
});

imgUploadArea.addEventListener('dragover', (e) => { e.preventDefault(); imgUploadArea.classList.add('drag-over'); });
imgUploadArea.addEventListener('dragleave', () => imgUploadArea.classList.remove('drag-over'));
imgUploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  imgUploadArea.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  imgFileInput.files = e.dataTransfer.files;
  imgFileInput.dispatchEvent(new Event('change'));
});

imgUrlToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const showing = imgUrlInput.style.display !== 'none';
  imgUrlInput.style.display = showing ? 'none' : '';
  imgUrlToggle.textContent = showing ? 'use an image URL instead' : 'hide URL field';
});

function resetImgField() {
  _pendingImgFile = null;
  imgPreview.src = '';
  imgUploadArea.classList.remove('has-image', 'drag-over');
  imgFileInput.value = '';
  imgUrlInput.value = '';
  imgUrlInput.style.display = 'none';
  imgUrlToggle.textContent = 'use an image URL instead';
}

function setImgPreview(src) {
  if (!src) { resetImgField(); return; }
  imgPreview.src = src;
  imgUploadArea.classList.add('has-image');
  imgUrlInput.value = src;
  imgUrlInput.style.display = '';
  imgUrlToggle.textContent = 'hide URL field';
}

// Save product
document.getElementById('product-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('save-product-btn');
  btn.disabled = true;
  btn.textContent = 'Saving…';

  let imgUrl = imgUrlInput.value.trim();

  // Upload file to Supabase Storage if one was selected
  if (_pendingImgFile) {
    const ext  = _pendingImgFile.name.split('.').pop();
    const path = `products/${Date.now()}.${ext}`;
    const { error: uploadErr } = await db.storage
      .from('product-images')
      .upload(path, _pendingImgFile, { upsert: true });
    if (uploadErr) {
      showToast('Image upload failed: ' + uploadErr.message, 'error');
      btn.disabled = false; btn.textContent = 'Save Product';
      return;
    }
    const { data: { publicUrl } } = db.storage.from('product-images').getPublicUrl(path);
    imgUrl = publicUrl;
  }

  const editId  = document.getElementById('edit-pid').value;
  const payload = {
    name:        document.getElementById('p-name').value.trim(),
    price:       parseFloat(document.getElementById('p-price').value),
    tag:         document.getElementById('p-tag').value,
    img_url:     imgUrl,
    description: document.getElementById('p-desc').value.trim()
  };

  if (!payload.name || isNaN(payload.price)) {
    btn.disabled = false; btn.textContent = 'Save Product'; return;
  }

  let error;
  if (editId) {
    ({ error } = await db.from('products').update(payload).eq('id', editId));
  } else {
    payload.id = 'prod-' + Date.now();
    ({ error } = await db.from('products').insert([payload]));
  }

  btn.disabled = false; btn.textContent = 'Save Product';
  if (error) { showToast('Failed to save: ' + error.message, 'error'); return; }

  closeModal('product-modal');
  renderProductsTable();
  renderDashboard();
  showToast(editId ? 'Product updated successfully.' : 'Product added to store.', 'success');
});

async function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  const { error } = await db.from('products').delete().eq('id', id);
  if (error) { showToast('Failed to delete: ' + error.message, 'error'); return; }
  renderProductsTable();
  renderDashboard();
  showToast('Product deleted.', 'info');
}

// ══════════════════════════════════════════
//  ORDERS
// ══════════════════════════════════════════
async function renderOrdersTable() {
  const allOrders = await getOrders();
  const orders = currentFilter === 'all'
    ? allOrders
    : allOrders.filter(o => o.status === currentFilter);
  const tbody = document.getElementById('orders-tbody');
  const empty = document.getElementById('orders-empty');
  if (orders.length === 0) { tbody.innerHTML = ''; empty.hidden = false; return; }
  empty.hidden = true;
  tbody.innerHTML = orders.map(o => {
    const date  = new Date(o.date).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
    const items = o.items.reduce((s, i) => s + i.qty, 0);
    return `<tr>
      <td><strong style="font-family:monospace;font-size:0.82rem">${o.id}</strong></td>
      <td><div style="font-weight:600">${o.customer.name}</div>
        <div style="color:var(--muted);font-size:0.78rem">${o.customer.email}</div></td>
      <td style="color:var(--muted)">${date}</td>
      <td>${items} item${items !== 1 ? 's' : ''}</td>
      <td><strong style="color:var(--gold)">$${o.total.toFixed(2)}</strong></td>
      <td>${statusBadge(o.status)}</td>
      <td class="td-actions">
        <button class="btn btn-secondary btn-sm" onclick="openOrderDetail('${o.id}')">View</button>
      </td>
    </tr>`;
  }).join('');
}

document.getElementById('order-filters').addEventListener('click', (e) => {
  const tab = e.target.closest('.filter-tab');
  if (!tab) return;
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  currentFilter = tab.dataset.filter;
  renderOrdersTable();
});

async function openOrderDetail(orderId) {
  const orders = await getOrders();
  const order  = orders.find(o => o.id === orderId);
  if (!order) return;

  document.getElementById('order-modal-title').textContent = `Order ${order.id}`;
  const date = new Date(order.date).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });

  const itemsHtml = order.items.map(i => `
    <div class="order-item-row">
      <img class="order-item-img" src="${i.img || ''}" alt="${i.name}" onerror="this.style.opacity=0.3">
      <div>
        <div class="order-item-name">${i.name}</div>
        <div class="order-item-meta">Qty: ${i.qty} &times; $${i.price.toFixed(2)}</div>
      </div>
      <div class="order-item-price">$${(i.price * i.qty).toFixed(2)}</div>
    </div>`).join('');

  document.getElementById('order-modal-body').innerHTML = `
    <div class="order-section"><h4>Order Info</h4>
      <div class="info-grid">
        <div class="info-item"><div class="lbl">Order ID</div><div class="val" style="font-family:monospace">${order.id}</div></div>
        <div class="info-item"><div class="lbl">Date</div><div class="val">${date}</div></div>
        <div class="info-item"><div class="lbl">Status</div><div class="val">${statusBadge(order.status)}</div></div>
        <div class="info-item"><div class="lbl">Total</div><div class="val" style="color:var(--gold);font-size:1.05rem">$${order.total.toFixed(2)}</div></div>
      </div>
    </div>
    <div class="order-section"><h4>Customer</h4>
      <div class="info-grid">
        <div class="info-item"><div class="lbl">Name</div><div class="val">${order.customer.name}</div></div>
        <div class="info-item"><div class="lbl">Email</div><div class="val">${order.customer.email}</div></div>
        <div class="info-item" style="grid-column:1/-1"><div class="lbl">Shipping Address</div>
          <div class="val">${order.customer.address}, ${order.customer.city} ${order.customer.zip}</div></div>
      </div>
    </div>
    <div class="order-section"><h4>Items</h4>
      <div class="order-items-list">
        ${itemsHtml}
        <div class="order-total-bar"><span>Order Total</span><span>$${order.total.toFixed(2)}</span></div>
      </div>
    </div>
    <div class="order-actions-bar">
      <button class="btn btn-blue btn-sm" onclick="handleSendReceipt('${order.id}', this)">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        Send Receipt Email
      </button>
      ${order.status !== 'shipped' && order.status !== 'delivered' ? `
        <div style="width:100%">
          <div class="tracking-row">
            <div class="field"><label>Tracking Number (optional)</label>
              <input type="text" id="tracking-${order.id}" placeholder="e.g. 1Z999AA10123456784">
            </div>
            <button class="btn btn-success btn-sm" onclick="handleMarkShipped('${order.id}', this)" style="margin-bottom:0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 12 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              Mark as Shipped + Notify
            </button>
          </div>
        </div>
      ` : `<span class="badge badge-${order.status}" style="font-size:0.82rem">Order ${order.status}</span>`}
      ${order.status !== 'delivered' ? `
        <button class="btn btn-secondary btn-sm" onclick="handleUpdateStatus('${order.id}', 'delivered', this)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Mark as Delivered
        </button>` : ''}
    </div>`;
  openModal('order-modal');
}

async function handleSendReceipt(orderId, btn) {
  const orders = await getOrders();
  const order  = orders.find(o => o.id === orderId);
  if (!order) return;
  const orig = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Sending…';
  try {
    await sendReceiptEmail(order);
    showToast(`Receipt sent to ${order.customer.email}`, 'success');
  } catch (err) {
    showToast(err.message || 'Failed to send email. Check Settings.', 'error');
  } finally {
    btn.disabled = false; btn.innerHTML = orig;
  }
}

async function handleMarkShipped(orderId, btn) {
  const orders = await getOrders();
  const order  = orders.find(o => o.id === orderId);
  if (!order) return;
  const tracking = document.getElementById(`tracking-${orderId}`)?.value.trim() || '';
  const orig = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Sending…';
  try {
    await sendShippingEmail(order, tracking);
    await db.from('orders').update({ status: 'shipped' }).eq('id', orderId);
    showToast(`Shipping notification sent to ${order.customer.email}`, 'success');
    closeModal('order-modal');
    renderOrdersTable();
    renderDashboard();
  } catch (err) {
    showToast(err.message || 'Failed to send email. Check Settings.', 'error');
    btn.disabled = false; btn.innerHTML = orig;
  }
}

async function handleUpdateStatus(orderId, status) {
  const { error } = await db.from('orders').update({ status }).eq('id', orderId);
  if (error) { showToast('Failed to update status.', 'error'); return; }
  showToast(`Order marked as ${status}.`, 'success');
  closeModal('order-modal');
  renderOrdersTable();
  renderDashboard();
}

// ══════════════════════════════════════════
//  SUBSCRIBERS
// ══════════════════════════════════════════
async function getSubscribers() {
  const { data, error } = await db.from('subscribers').select('*').order('subscribed_at', { ascending: false });
  if (error) { console.error('getSubscribers:', error); return []; }
  return data || [];
}

async function renderSubscribersTab() {
  const subs  = await getSubscribers();
  const tbody = document.getElementById('subscribers-tbody');
  const empty = document.getElementById('subscribers-empty');
  const label = document.getElementById('sub-count-label');

  label.textContent = `${subs.length} subscriber${subs.length !== 1 ? 's' : ''} total`;

  const badge = document.getElementById('sub-badge');
  if (badge) { badge.textContent = subs.length || ''; badge.classList.toggle('show', subs.length > 0); }

  if (subs.length === 0) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  tbody.innerHTML = subs.map(s => {
    const date = new Date(s.subscribed_at).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
    return `<tr>
      <td><strong>${s.email}</strong></td>
      <td style="color:var(--muted)">${date}</td>
      <td class="td-actions">
        <button class="btn btn-danger btn-sm btn-icon" title="Remove" onclick="removeSubscriber('${s.id}')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
        </button>
      </td>
    </tr>`;
  }).join('');
}

async function removeSubscriber(id) {
  if (!confirm('Remove this subscriber?')) return;
  const { error } = await db.from('subscribers').delete().eq('id', id);
  if (error) { showToast('Failed to remove subscriber.', 'error'); return; }
  renderSubscribersTab();
  showToast('Subscriber removed.', 'info');
}

document.getElementById('broadcast-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const cfg = getEmailSettings();
  if (!cfg.announceTplId) {
    showToast('Set an Announcement Template ID in Settings first.', 'error'); return;
  }
  const subject = document.getElementById('broadcast-subject').value.trim();
  const message = document.getElementById('broadcast-msg').value.trim();
  if (!subject || !message) return;

  const subs = await getSubscribers();
  if (subs.length === 0) { showToast('No subscribers to send to.', 'info'); return; }

  const btn    = document.getElementById('broadcast-btn');
  const status = document.getElementById('broadcast-status');
  btn.disabled = true;

  let sent = 0, failed = 0;
  for (const sub of subs) {
    status.textContent = `Sending ${sent + failed + 1} / ${subs.length}…`;
    try {
      await emailjs.send(cfg.serviceId, cfg.announceTplId, {
        to_email: sub.email,
        subject,
        message
      }, cfg.publicKey);
      sent++;
    } catch (err) {
      failed++;
    }
  }

  btn.disabled = false;
  status.textContent = '';
  if (failed === 0) {
    showToast(`Announcement sent to ${sent} subscriber${sent !== 1 ? 's' : ''}!`, 'success');
    document.getElementById('broadcast-form').reset();
  } else {
    showToast(`Sent: ${sent} — Failed: ${failed}. Check EmailJS settings.`, 'error');
  }
});

// ══════════════════════════════════════════
//  SETTINGS
// ══════════════════════════════════════════
function loadSettings() {
  const cfg = getEmailSettings();
  document.getElementById('ejs-service').value       = cfg.serviceId     || '';
  document.getElementById('ejs-pubkey').value        = cfg.publicKey     || '';
  document.getElementById('ejs-receipt-tpl').value   = cfg.receiptTplId  || '';
  document.getElementById('ejs-ship-tpl').value      = cfg.shippingTplId || '';
  document.getElementById('ejs-announce-tpl').value  = cfg.announceTplId || '';
}

document.getElementById('pwd-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const np  = document.getElementById('new-pwd').value;
  const cp  = document.getElementById('confirm-pwd').value;
  const err = document.getElementById('pwd-error');
  if (!np) { err.textContent = 'Password cannot be empty.'; return; }
  if (np !== cp) { err.textContent = 'Passwords do not match.'; return; }
  err.textContent = '';
  const { error } = await db.auth.updateUser({ password: np });
  if (error) { err.textContent = error.message; return; }
  document.getElementById('pwd-form').reset();
  showToast('Password updated successfully.', 'success');
});

document.getElementById('emailjs-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const cfg = {
    serviceId:     document.getElementById('ejs-service').value.trim(),
    publicKey:     document.getElementById('ejs-pubkey').value.trim(),
    receiptTplId:  document.getElementById('ejs-receipt-tpl').value.trim(),
    shippingTplId: document.getElementById('ejs-ship-tpl').value.trim(),
    announceTplId: document.getElementById('ejs-announce-tpl').value.trim()
  };
  saveEmailSettings(cfg);
  initEmailJS();
  showToast('Email settings saved.', 'success');
});

// ══════════════════════════════════════════
//  LOGIN / LOGOUT
// ══════════════════════════════════════════
function showApp() {
  document.getElementById('login-screen').hidden = true;
  document.getElementById('admin-app').hidden    = false;
  initEmailJS();
  renderDashboard();
}

function showLogin() {
  document.getElementById('login-screen').hidden = false;
  document.getElementById('admin-app').hidden    = true;
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const pwd   = document.getElementById('login-pwd').value;
  const err   = document.getElementById('login-error');
  const btn   = e.target.querySelector('button[type="submit"]');
  btn.disabled = true; btn.textContent = 'Signing in…';

  const { error } = await db.auth.signInWithPassword({ email, password: pwd });

  btn.disabled = false; btn.textContent = 'Sign In';
  if (error) {
    err.textContent = 'Incorrect email or password.';
    document.getElementById('login-pwd').value = '';
    document.getElementById('login-pwd').focus();
  } else {
    err.textContent = '';
    showApp();
  }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
  await db.auth.signOut();
  showLogin();
});

// ── Init: restore session ──
(async () => {
  const { data: { session } } = await db.auth.getSession();
  if (session) showApp(); else showLogin();
})();
