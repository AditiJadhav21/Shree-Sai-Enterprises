/**
 * Shree Sai Enterprises - Quotation & Billing Engine
 */

let activeDiscount = 0;
let lastGeneratedQuote = null;

// Number to Indian words (client side mirror)
function clientNumberToIndianWords(num) {
  num = Math.round(num);
  if (num === 0) return 'Rupees Zero Only';

  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n) {
    if (n < 20) return single[n];
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '');
  }

  function convertThreeDigits(n) {
    let str = '';
    if (Math.floor(n / 100) > 0) {
      str += single[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      str += convertTwoDigits(n);
    }
    return str.trim();
  }

  let result = '';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundredAndRest = num;

  if (crore > 0) result += convertTwoDigits(crore) + ' Crore ';
  if (lakh > 0) result += convertTwoDigits(lakh) + ' Lakh ';
  if (thousand > 0) result += convertTwoDigits(thousand) + ' Thousand ';
  if (hundredAndRest > 0) result += convertThreeDigits(hundredAndRest);

  return 'Rupees ' + result.trim() + ' Only';
}

function renderQuoteCartItems() {
  const container = document.getElementById('quote-cart-table-body');
  const emptyState = document.getElementById('quote-cart-empty');
  const tableWrapper = document.getElementById('quote-cart-wrapper');
  if (!container) return;

  const cart = SSE_Cart.getCart();

  if (cart.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (tableWrapper) tableWrapper.classList.add('hidden');
    calculateAndRenderTotals([]);
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (tableWrapper) tableWrapper.classList.remove('hidden');

  container.innerHTML = cart.map((item, idx) => {
    const qty = item.quantity || 1;
    const price = item.approx_price || 0;
    const itemSubtotal = price * qty;
    const gstRate = item.gst_rate || 12;

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50/60 transition">
        <td class="py-4 px-3 text-xs font-semibold text-slate-400 text-center">${idx + 1}</td>
        <td class="py-4 px-4">
          <div class="flex items-center gap-3">
            <img src="${item.primary_image || '/images/products/mono-perc-550w.svg'}" 
                 class="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-white p-1 flex-shrink-0" alt="${item.name}">
            <div>
              <p class="font-bold text-slate-800 text-sm">${item.name}</p>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[11px] text-slate-500 font-medium">HSN: ${item.hsn_code || '85414011'}</span>
                <span class="text-[11px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">GST ${gstRate}%</span>
              </div>
            </div>
          </div>
        </td>
        <td class="py-4 px-4 text-center">
          <div class="inline-flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-xs">
            <button onclick="handleCartQty(${item.id}, ${qty - 1})" 
                    class="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold transition">−</button>
            <input type="number" min="1" value="${qty}" 
                   onchange="handleCartQty(${item.id}, this.value)"
                   class="w-12 text-center text-xs font-bold text-slate-800 focus:outline-none border-x border-slate-200 py-1">
            <button onclick="handleCartQty(${item.id}, ${qty + 1})" 
                    class="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold transition">+</button>
          </div>
        </td>
        <td class="py-4 px-4 text-right font-semibold text-slate-800 text-sm">
          ${formatINR(price)}
        </td>
        <td class="py-4 px-4 text-right font-bold text-slate-900 text-sm">
          ${formatINR(itemSubtotal)}
        </td>
        <td class="py-4 px-3 text-center">
          <button onclick="handleRemoveQuoteItem(${item.id})" 
                  title="Remove item" 
                  class="w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition flex items-center justify-center">
            ✕
          </button>
        </td>
      </tr>
    `;
  }).join('');

  calculateAndRenderTotals(cart);
}

function handleCartQty(productId, newQty) {
  SSE_Cart.updateQuantity(productId, parseInt(newQty, 10));
  renderQuoteCartItems();
}

function handleRemoveQuoteItem(productId) {
  SSE_Cart.removeItem(productId);
  renderQuoteCartItems();
}

function calculateAndRenderTotals(cart) {
  let subtotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;

  cart.forEach(item => {
    const qty = item.quantity || 1;
    const price = item.approx_price || 0;
    const itemTaxable = price * qty;
    const gstRate = item.gst_rate || 12;

    const cgst = itemTaxable * (gstRate / 200);
    const sgst = itemTaxable * (gstRate / 200);

    subtotal += itemTaxable;
    totalCgst += cgst;
    totalSgst += sgst;
  });

  const discountInput = document.getElementById('quote-discount-input');
  if (discountInput) {
    activeDiscount = Math.max(0, parseFloat(discountInput.value) || 0);
  }

  const taxableTotal = Math.max(0, subtotal - activeDiscount);
  // Re-adjust GST proportionally if general discount is applied
  const ratio = subtotal > 0 ? (taxableTotal / subtotal) : 1;
  const adjustedCgst = totalCgst * ratio;
  const adjustedSgst = totalSgst * ratio;
  const totalGst = adjustedCgst + adjustedSgst;
  const grandTotal = Math.round(taxableTotal + totalGst);
  const words = clientNumberToIndianWords(grandTotal);

  // Update Summary card elements
  const subtotalEl = document.getElementById('summary-subtotal');
  const discountEl = document.getElementById('summary-discount');
  const taxableEl = document.getElementById('summary-taxable');
  const cgstEl = document.getElementById('summary-cgst');
  const sgstEl = document.getElementById('summary-sgst');
  const grandTotalEl = document.getElementById('summary-grand-total');
  const wordsEl = document.getElementById('summary-words');

  if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);
  if (discountEl) discountEl.textContent = `- ${formatINR(activeDiscount)}`;
  if (taxableEl) taxableEl.textContent = formatINR(taxableTotal);
  if (cgstEl) cgstEl.textContent = formatINR(adjustedCgst);
  if (sgstEl) sgstEl.textContent = formatINR(adjustedSgst);
  if (grandTotalEl) grandTotalEl.textContent = formatINR(grandTotal);
  if (wordsEl) wordsEl.textContent = words;
}

// Submit Quotation Form and Display GST Invoice
async function handleGenerateQuoteSubmit(e) {
  e.preventDefault();

  const cart = SSE_Cart.getCart();
  if (cart.length === 0) {
    showToast('Please add at least one product to your quotation cart.', 'error');
    return;
  }

  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const email = document.getElementById('customer-email').value.trim();
  const address = document.getElementById('customer-address').value.trim();
  const city = document.getElementById('customer-city').value.trim() || 'Dindori';
  const pincode = document.getElementById('customer-pincode').value.trim() || '422202';
  const notes = document.getElementById('customer-notes').value.trim();

  if (!name || !phone) {
    showToast('Name and Mobile Number are required for quotation generation.', 'error');
    return;
  }

  const submitBtn = document.getElementById('btn-submit-quote');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `
    <span class="inline-block animate-spin mr-2">🔄</span> Processing Official GST Quotation...
  `;

  try {
    const payload = {
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      customer_address: address || 'Dindori, Nashik',
      city,
      district: 'Nashik',
      pincode,
      customer_notes: notes,
      discount_amount: activeDiscount,
      items: cart.map(i => ({
        product_id: i.id,
        product_name: i.name,
        category_name: i.category_name,
        hsn_code: i.hsn_code,
        quantity: i.quantity,
        unit_price: i.approx_price,
        discount: 0,
        gst_rate: i.gst_rate
      }))
    };

    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success && data.quote) {
      lastGeneratedQuote = data.quote;
      showToast('Quotation successfully generated and recorded!', 'success');
      renderInvoiceView(lastGeneratedQuote);
      // Scroll to quotation preview
      const previewSection = document.getElementById('quotation-preview-container');
      if (previewSection) {
        previewSection.classList.remove('hidden');
        previewSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      showToast(data.message || 'Error creating quotation.', 'error');
    }
  } catch (err) {
    showToast('Network error while generating quotation. Please retry.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Render the official GST Quotation Sheet
function renderInvoiceView(quote) {
  const invoicePaper = document.getElementById('quotation-invoice-paper');
  if (!invoicePaper) return;

  const quoteDate = new Date(quote.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const validUntil = new Date(Date.now() + 15 * 86400000).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  invoicePaper.innerHTML = `
    <!-- INVOICE HEADER -->
    <div class="border-b-2 border-slate-900 pb-6 mb-6">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="flex items-center gap-3">
            <span class="text-3xl font-black text-slate-900 tracking-tight">SHREE SAI <span class="text-amber-500">ENTERPRISES</span></span>
            <span class="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
              MNRE Authorised
            </span>
          </div>
          <p class="text-xs font-semibold text-sky-700 uppercase tracking-wider mt-1">Solar Rooftop, Solar Water Heaters &amp; Storage Solutions</p>
          <p class="text-xs text-slate-600 mt-1 max-w-xl">
            Sai Sankul Apartment, Palkhed Road, A/P &amp; Tal. Dindori, Dist. Nashik - 422202, Maharashtra
          </p>
          <div class="flex flex-wrap gap-4 text-xs font-medium text-slate-700 mt-2">
            <span><strong>GSTIN:</strong> 27AFSPJ0957J1ZX</span>
            <span><strong>Phone:</strong> 9822414748 / 9422941187</span>
            <span><strong>Email:</strong> samadhanj182@gmail.com</span>
          </div>
        </div>

        <div class="text-left md:text-right bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-xl border md:border-0 border-slate-200 w-full md:w-auto">
          <span class="inline-block px-3 py-1 bg-slate-900 text-white rounded text-xs font-bold tracking-widest uppercase mb-2">
            OFFICIAL ESTIMATE / QUOTATION
          </span>
          <p class="text-lg font-black text-amber-600">${quote.quote_number}</p>
          <p class="text-xs text-slate-600"><strong>Date:</strong> ${quoteDate}</p>
          <p class="text-xs text-slate-600"><strong>Validity:</strong> 15 Days (Till ${validUntil})</p>
        </div>
      </div>
    </div>

    <!-- CUSTOMER DETAILS / BILLED TO -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 text-xs">
      <div>
        <p class="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Customer / Client Details</p>
        <p class="text-sm font-bold text-slate-900">${quote.customer_name}</p>
        <p class="text-slate-600 mt-0.5"><strong>Phone:</strong> +91 ${quote.customer_phone}</p>
        ${quote.customer_email ? `<p class="text-slate-600"><strong>Email:</strong> ${quote.customer_email}</p>` : ''}
        <p class="text-slate-600 mt-0.5"><strong>Installation Site:</strong> ${quote.customer_address}, ${quote.city || 'Dindori'}, ${quote.district || 'Nashik'} - ${quote.pincode || '422202'}</p>
      </div>
      <div>
        <p class="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-1">Project &amp; Subsidy Scheme</p>
        <p class="font-bold text-slate-800">PM Surya Ghar: Muft Bijli Yojana</p>
        <p class="text-slate-600 mt-0.5">Eligible Central Financial Assistance (CFA): <strong>Up to ₹78,000</strong></p>
        <p class="text-slate-600 mt-0.5">DisCom Liaison: <strong>MSEDCL (Mahavitaran) Nashik Circle</strong></p>
        ${quote.customer_notes ? `<p class="text-slate-500 italic mt-1">Customer Notes: "${quote.customer_notes}"</p>` : ''}
      </div>
    </div>

    <!-- ITEMIZED QUOTATION TABLE -->
    <div class="overflow-x-auto mb-6">
      <table class="w-full text-left text-xs border border-slate-200">
        <thead class="bg-slate-900 text-white uppercase text-[10px] font-bold">
          <tr>
            <th class="p-2.5 text-center w-10">#</th>
            <th class="p-2.5">Item Description</th>
            <th class="p-2.5 text-center">HSN/SAC</th>
            <th class="p-2.5 text-center">Qty</th>
            <th class="p-2.5 text-right">Unit Rate (₹)</th>
            <th class="p-2.5 text-right">Taxable Amt (₹)</th>
            <th class="p-2.5 text-center">GST %</th>
            <th class="p-2.5 text-right">CGST (₹)</th>
            <th class="p-2.5 text-right">SGST (₹)</th>
            <th class="p-2.5 text-right">Total (₹)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          ${quote.items.map((it, idx) => `
            <tr class="hover:bg-slate-50/50">
              <td class="p-2.5 text-center text-slate-500 font-semibold">${idx + 1}</td>
              <td class="p-2.5 font-bold text-slate-900">
                ${it.product_name}
                <div class="text-[10px] text-slate-400 font-normal">${it.category_name}</div>
              </td>
              <td class="p-2.5 text-center text-slate-600">${it.hsn_code || '85414011'}</td>
              <td class="p-2.5 text-center font-bold text-slate-800">${it.quantity}</td>
              <td class="p-2.5 text-right text-slate-700">${formatINR(it.unit_price).replace('₹', '')}</td>
              <td class="p-2.5 text-right font-semibold text-slate-800">${formatINR(it.taxable_amount).replace('₹', '')}</td>
              <td class="p-2.5 text-center font-semibold text-amber-700">${it.gst_rate}%</td>
              <td class="p-2.5 text-right text-slate-600">${formatINR(it.cgst_amount).replace('₹', '')}</td>
              <td class="p-2.5 text-right text-slate-600">${formatINR(it.sgst_amount).replace('₹', '')}</td>
              <td class="p-2.5 text-right font-black text-slate-900">${formatINR(it.total_amount).replace('₹', '')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- TOTALS & TAX BREAKDOWN SUMMARY -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-6 text-xs">
      <div>
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
          <p class="font-bold text-slate-700 mb-1">Amount in Words:</p>
          <p class="font-bold text-amber-700 italic">${quote.grand_total_words}</p>
        </div>

        <div class="border border-slate-200 rounded-xl p-3 bg-white">
          <p class="font-bold text-slate-800 mb-1">Bank Payment Details:</p>
          <p class="text-slate-600"><strong>Bank:</strong> Bank of Maharashtra / HDFC Bank</p>
          <p class="text-slate-600"><strong>Account Name:</strong> SHREE SAI ENTERPRISES</p>
          <p class="text-slate-600"><strong>Account No:</strong> 60341829012 (Current A/C)</p>
          <p class="text-slate-600"><strong>IFSC Code:</strong> MAHB0000213 (Dindori Branch)</p>
          <p class="text-slate-600"><strong>UPI / GPay:</strong> 9822414748@upi</p>
        </div>
      </div>

      <div class="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div class="space-y-2">
          <div class="flex justify-between py-1 border-b border-slate-200">
            <span class="text-slate-600">Total Taxable Subtotal:</span>
            <span class="font-bold text-slate-800">${formatINR(quote.taxable_amount)}</span>
          </div>
          ${quote.discount_amount > 0 ? `
            <div class="flex justify-between py-1 border-b border-slate-200 text-emerald-600">
              <span>Special Applied Discount:</span>
              <span class="font-bold">- ${formatINR(quote.discount_amount)}</span>
            </div>
          ` : ''}
          <div class="flex justify-between py-1 border-b border-slate-200">
            <span class="text-slate-600">Central GST (CGST Total):</span>
            <span class="font-semibold text-slate-700">${formatINR(quote.cgst_amount)}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-200">
            <span class="text-slate-600">State GST (SGST Total):</span>
            <span class="font-semibold text-slate-700">${formatINR(quote.sgst_amount)}</span>
          </div>
          <div class="flex justify-between py-1 border-b border-slate-200">
            <span class="text-slate-600">Total Goods &amp; Service Tax (GST):</span>
            <span class="font-bold text-slate-800">${formatINR(quote.total_gst)}</span>
          </div>
          <div class="flex justify-between py-2 border-t-2 border-slate-900 text-sm">
            <span class="font-black text-slate-900 uppercase">Estimated Grand Total:</span>
            <span class="font-black text-amber-600 text-base">${formatINR(quote.grand_total)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- TERMS & AUTHORIZED SIGNATORY -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-[11px] text-slate-600">
      <div>
        <p class="font-bold text-slate-800 mb-1">Standard Terms &amp; Conditions:</p>
        <ol class="list-decimal pl-4 space-y-1">
          <li>Prices are approximate and subject to physical rooftop/site inspection in Dindori/Nashik.</li>
          <li>PM Surya Ghar subsidy will be credited directly to the customer's Aadhaar-linked bank account upon MSEDCL net meter commissioning.</li>
          <li>Payment Terms: 20% advance with work order, 60% upon material delivery at site, 20% post testing &amp; inspection.</li>
          <li>All components backed by official manufacturer warranties (25 yrs panels, 5-8 yrs inverters).</li>
        </ol>
      </div>

      <div class="flex flex-col justify-end items-end text-right">
        <p class="font-bold text-slate-800">For SHREE SAI ENTERPRISES</p>
        <div class="h-14 flex items-center justify-end">
          <span class="text-amber-600 font-serif text-lg font-bold italic tracking-wide">Samadhan R. Jadhav</span>
        </div>
        <p class="font-bold text-slate-900">Samadhan R. Jadhav</p>
        <p class="text-[10px] text-slate-500">Authorised Signatory / Managing Director</p>
      </div>
    </div>
  `;

  // Update actions
  setupQuotationActions(quote);
}

function setupQuotationActions(quote) {
  const printBtn = document.getElementById('btn-print-quote');
  const whatsappBtn = document.getElementById('btn-whatsapp-quote');

  if (printBtn) {
    printBtn.onclick = () => window.print();
  }

  if (whatsappBtn) {
    whatsappBtn.onclick = () => {
      const text = encodeURIComponent(
        `Namaskar Samadhan ji, I have generated a solar quote (${quote.quote_number}) for ₹${quote.grand_total} on your website for Shree Sai Enterprises. My name is ${quote.customer_name}, Mobile: ${quote.customer_phone}. Please let me know the next steps for site inspection and PM Surya Ghar subsidy.`
      );
      window.open(`https://wa.me/919822414748?text=${text}`, '_blank');
    };
  }
}

// Initialise page listeners
document.addEventListener('DOMContentLoaded', () => {
  renderQuoteCartItems();

  const form = document.getElementById('quotation-customer-form');
  if (form) {
    form.addEventListener('submit', handleGenerateQuoteSubmit);
  }

  const discountInput = document.getElementById('quote-discount-input');
  if (discountInput) {
    discountInput.addEventListener('input', () => {
      calculateAndRenderTotals(SSE_Cart.getCart());
    });
  }

  // Listen to external cart additions
  window.addEventListener('sse_cart_updated', () => {
    renderQuoteCartItems();
  });
});
