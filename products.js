/**
 * Shree Sai Enterprises - Products Catalog Logic
 */

let allProducts = [];
let activeCategory = 'all';
let currentSearch = '';
let currentSort = 'default';

async function fetchProducts() {
  const container = document.getElementById('products-grid');
  if (!container) return;

  try {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-slate-500">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mb-3"></div>
        <p class="font-medium text-slate-600">Loading solar equipment catalog...</p>
      </div>
    `;

    const params = new URLSearchParams();
    if (activeCategory !== 'all') params.append('category', activeCategory);
    if (currentSearch) params.append('search', currentSearch);
    if (currentSort !== 'default') params.append('sort', currentSort);

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();

    if (data.success) {
      allProducts = data.products;
      renderProductsGrid(allProducts);
      const countEl = document.getElementById('product-count-label');
      if (countEl) countEl.textContent = `Showing ${allProducts.length} Products`;
    }
  } catch (err) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-red-500">
        <p class="font-semibold">Unable to load products. Please check your network or try again.</p>
      </div>
    `;
  }
}

function renderProductsGrid(products) {
  const container = document.getElementById('products-grid');
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div class="text-5xl mb-4">🔍</div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">No matching solar products found</h3>
        <p class="text-slate-500 mb-6">Try adjusting your search terms or filter category to find what you are looking for.</p>
        <button onclick="resetFilters()" class="px-5 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition shadow">
          Clear All Filters
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(product => {
    const isLimited = product.stock_status === 'limited_stock';
    const isOut = product.stock_status === 'out_of_stock';
    
    let stockBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> In Stock (${product.stock_qty || 10})
    </span>`;

    if (isLimited) {
      stockBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Limited Stock (${product.stock_qty})
      </span>`;
    } else if (isOut) {
      stockBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
        <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span> Out of Stock
      </span>`;
    }

    return `
      <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group card-hover">
        <!-- Image Container -->
        <div class="relative bg-slate-50 aspect-[4/3] p-4 flex items-center justify-center overflow-hidden border-b border-slate-100">
          <img src="${product.primary_image || '/images/products/mono-perc-550w.svg'}" 
               alt="${product.name}" 
               class="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
               loading="lazy">
          
          <div class="absolute top-3 left-3">
            <span class="px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide uppercase bg-slate-900/80 text-white backdrop-blur-sm">
              ${product.category_name || 'Solar Equipment'}
            </span>
          </div>

          <div class="absolute top-3 right-3">
            ${stockBadge}
          </div>
        </div>

        <!-- Content -->
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
              <a href="/product/${product.slug || product.id}">${product.name}</a>
            </h3>
            
            <p class="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
              ${product.short_info || ''}
            </p>

            <div class="mt-3 flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 p-2 rounded-lg">
              <span class="text-amber-500">🛡️</span>
              <span class="truncate">${product.warranty || '25 Years Performance Warranty'}</span>
            </div>
          </div>

          <!-- Price & Action -->
          <div class="mt-5 pt-4 border-t border-slate-100">
            <div class="mb-3">
              <div class="flex items-baseline gap-2">
                <span class="text-2xl font-black text-slate-900">${formatINR(product.approx_price)}</span>
                <span class="text-xs font-semibold text-slate-400">approx.*</span>
              </div>
              <p class="text-[11px] text-amber-700 font-medium">Final price & subsidy on formal quotation</p>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <a href="/product/${product.slug || product.id}" 
                 class="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-center font-semibold text-xs hover:bg-slate-50 hover:border-slate-400 transition">
                View Details
              </a>
              <button onclick="handleAddToQuote(${product.id})" 
                      class="px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm hover:shadow">
                <span>+ Add to Quote</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function handleAddToQuote(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (product) {
    SSE_Cart.addItem(product, 1);
  }
}

function resetFilters() {
  activeCategory = 'all';
  currentSearch = '';
  currentSort = 'default';
  
  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'default';

  document.querySelectorAll('.cat-filter-btn').forEach(btn => {
    btn.classList.remove('bg-amber-500', 'text-white', 'shadow');
    btn.classList.add('bg-white', 'text-slate-700');
    if (btn.dataset.category === 'all') {
      btn.classList.add('bg-amber-500', 'text-white', 'shadow');
      btn.classList.remove('bg-white', 'text-slate-700');
    }
  });

  fetchProducts();
}

// Initialise Products Page Listeners
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('products-grid');
  if (!container) return;

  // Read URL query params if any
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('category')) activeCategory = urlParams.get('category');
  if (urlParams.get('search')) currentSearch = urlParams.get('search');

  // Category filter buttons
  document.querySelectorAll('.cat-filter-btn').forEach(btn => {
    if (btn.dataset.category === activeCategory) {
      btn.classList.add('bg-amber-500', 'text-white', 'shadow');
      btn.classList.remove('bg-white', 'text-slate-700');
    }

    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-filter-btn').forEach(b => {
        b.classList.remove('bg-amber-500', 'text-white', 'shadow');
        b.classList.add('bg-white', 'text-slate-700');
      });
      btn.classList.add('bg-amber-500', 'text-white', 'shadow');
      btn.classList.remove('bg-white', 'text-slate-700');

      activeCategory = btn.dataset.category;
      fetchProducts();
    });
  });

  // Search input with debounce
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    if (currentSearch) searchInput.value = currentSearch;
    let timer = null;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        currentSearch = e.target.value.trim();
        fetchProducts();
      }, 350);
    });
  }

  // Sort select
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      fetchProducts();
    });
  }

  fetchProducts();
});
