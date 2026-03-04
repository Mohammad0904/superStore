/* ============================================================
   app.js — Global Sales Executive Dashboard
   Author: Your Name | York University CS
   ============================================================ */

// ── Palette ──────────────────────────────────────────────────
const COLORS = {
    blue:   '#58a6ff',
    green:  '#3fb950',
    orange: '#f0883e',
    purple: '#a371f7',
    red:    '#f85149',
    teal:   '#39d353',
    grid:   'rgba(48,54,61,0.6)',
    text:   '#8b949e',
  };
  
  const CATEGORY_COLORS = {
    'Technology':      COLORS.blue,
    'Furniture':       COLORS.orange,
    'Office Supplies': COLORS.green,
  };
  
  // Global state
  let rawData   = [];
  let charts    = {};
  
  // ── 1. LOAD DATA ─────────────────────────────────────────────
  async function loadData() {
    try {
      const res = await fetch('data.json');
      rawData = await res.json();
      initDashboard();
    } catch (err) {
      document.getElementById('loading').innerHTML =
        '⚠️ Could not load data.json. Make sure you are serving this with a local server.';
    }
  }
  
  // ── 2. INIT ───────────────────────────────────────────────────
  function initDashboard() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('app').style.display     = 'block';
  
    renderAll(rawData);
    bindFilters();
  }
  
  // ── 3. BIND FILTER EVENTS ─────────────────────────────────────
  function bindFilters() {
    ['regionFilter', 'categoryFilter'].forEach(id => {
      document.getElementById(id).addEventListener('change', applyFilters);
    });
    document.getElementById('resetBtn').addEventListener('click', () => {
      document.getElementById('regionFilter').value   = 'All';
      document.getElementById('categoryFilter').value = 'All';
      applyFilters();
    });
  }
  
  function applyFilters() {
    const region   = document.getElementById('regionFilter').value;
    const category = document.getElementById('categoryFilter').value;
  
    let filtered = rawData;
    if (region   !== 'All') filtered = filtered.filter(d => d.region   === region);
    if (category !== 'All') filtered = filtered.filter(d => d.category === category);
  
    renderAll(filtered);
  }
  
  // ── 4. RENDER ALL ─────────────────────────────────────────────
  function renderAll(data) {
    updateKPIs(data);
    renderMonthlySales(data);
    renderCategoryDonut(data);
    renderRegionBar(data);
    renderProfitLine(data);
    renderTable(data);
  }
  
  // ── 5. KPI CARDS ──────────────────────────────────────────────
  function updateKPIs(data) {
    const totalSales   = data.reduce((s, d) => s + d.sales,    0);
    const totalProfit  = data.reduce((s, d) => s + d.profit,   0);
    const totalOrders  = data.length;
    const avgOrderVal  = totalOrders ? totalSales / totalOrders : 0;
    const profitMargin = totalSales  ? (totalProfit / totalSales) * 100 : 0;
  
    setText('kpiSales',   fmt(totalSales));
    setText('kpiProfit',  fmt(totalProfit));
    setText('kpiOrders',  totalOrders.toLocaleString());
    setText('kpiAOV',     fmt(avgOrderVal));
    setText('kpiMargin',  profitMargin.toFixed(1) + '%');
  }
  
  // ── 6. MONTHLY SALES BAR CHART ────────────────────────────────
  function renderMonthlySales(data) {
    const monthly = {};
    data.forEach(d => {
      const month = d.date.slice(0, 7); // "2024-01"
      monthly[month] = (monthly[month] || 0) + d.sales;
    });
  
    const labels = Object.keys(monthly).sort();
    const values = labels.map(k => monthly[k]);
  
    const ctx = document.getElementById('monthlySalesChart');
    if (charts.monthly) charts.monthly.destroy();
  
    charts.monthly = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.map(formatMonth),
        datasets: [{
          label: 'Monthly Sales ($)',
          data: values,
          backgroundColor: values.map((_, i) =>
            `rgba(88,166,255,${0.4 + (i / labels.length) * 0.5})`),
          borderColor: COLORS.blue,
          borderWidth: 1,
          borderRadius: 6,
        }]
      },
      options: chartOptions('Sales Revenue ($)', true),
    });
  }
  
  // ── 7. CATEGORY DONUT ─────────────────────────────────────────
  function renderCategoryDonut(data) {
    const cats = {};
    data.forEach(d => { cats[d.category] = (cats[d.category] || 0) + d.sales; });
  
    const labels = Object.keys(cats);
    const values = labels.map(k => cats[k]);
  
    const ctx = document.getElementById('categoryChart');
    if (charts.donut) charts.donut.destroy();
  
    charts.donut = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: labels.map(l => CATEGORY_COLORS[l] || COLORS.purple),
          borderColor: '#161b22',
          borderWidth: 3,
          hoverOffset: 8,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: COLORS.text, padding: 16, font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${fmt(ctx.raw)} (${((ctx.raw / values.reduce((a,b)=>a+b,0))*100).toFixed(1)}%)`
            }
          }
        },
        cutout: '65%',
      }
    });
  }
  
  // ── 8. REGION BAR ─────────────────────────────────────────────
  function renderRegionBar(data) {
    const regions = {};
    data.forEach(d => { regions[d.region] = (regions[d.region] || 0) + d.sales; });
  
    const sorted  = Object.entries(regions).sort((a, b) => b[1] - a[1]);
    const labels  = sorted.map(e => e[0]);
    const values  = sorted.map(e => e[1]);
    const palette = [COLORS.blue, COLORS.green, COLORS.orange, COLORS.purple];
  
    const ctx = document.getElementById('regionChart');
    if (charts.region) charts.region.destroy();
  
    charts.region = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Total Sales ($)',
          data: values,
          backgroundColor: palette.slice(0, labels.length),
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { labels: { color: COLORS.text, font: { size: 12 }, boxWidth: 12 } },
          tooltip: {
            callbacks: { label: ctx => ` Total Sales: ${fmt(ctx.raw)}` }
          }
        },
        scales: {
          x: { ticks: { color: COLORS.text, font: { size: 11 }, callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) }, grid: { color: COLORS.grid } },
          y: { ticks: { color: COLORS.text, font: { size: 11 } }, grid: { color: COLORS.grid } }
        }
      }
    });
  }
  
  // ── 9. PROFIT LINE CHART ──────────────────────────────────────
  function renderProfitLine(data) {
    const monthly = {};
    data.forEach(d => {
      const m = d.date.slice(0, 7);
      if (!monthly[m]) monthly[m] = { sales: 0, profit: 0 };
      monthly[m].sales  += d.sales;
      monthly[m].profit += d.profit;
    });
  
    const labels = Object.keys(monthly).sort();
  
    const ctx = document.getElementById('profitChart');
    if (charts.profit) charts.profit.destroy();
  
    charts.profit = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels.map(formatMonth),
        datasets: [
          {
            label: 'Sales ($)',
            data: labels.map(k => monthly[k].sales),
            borderColor: COLORS.blue,
            backgroundColor: 'rgba(88,166,255,0.08)',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: COLORS.blue,
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Profit ($)',
            data: labels.map(k => monthly[k].profit),
            borderColor: COLORS.green,
            backgroundColor: 'rgba(63,185,80,0.08)',
            borderWidth: 2,
            pointRadius: 4,
            pointBackgroundColor: COLORS.green,
            fill: true,
            tension: 0.4,
          }
        ]
      },
      options: chartOptions('Amount ($)', true),
    });
  }
  
  // ── 10. TOP PRODUCTS TABLE ────────────────────────────────────
  function renderTable(data) {
    // Aggregate by product
    const products = {};
    data.forEach(d => {
      if (!products[d.product]) {
        products[d.product] = { product: d.product, category: d.category, region: d.region, sales: 0, profit: 0, orders: 0 };
      }
      products[d.product].sales  += d.sales;
      products[d.product].profit += d.profit;
      products[d.product].orders += 1;
    });
  
    const top10 = Object.values(products)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);
  
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = top10.map((r, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${r.product}</td>
        <td><span class="badge ${badgeClass(r.category)}">${r.category}</span></td>
        <td>${r.region}</td>
        <td>${fmt(r.sales)}</td>
        <td class="profit-positive">${fmt(r.profit)}</td>
        <td>${((r.profit / r.sales) * 100).toFixed(1)}%</td>
      </tr>
    `).join('');
  }
  
  // ── HELPERS ───────────────────────────────────────────────────
  function fmt(n)       { return '$' + Math.round(n).toLocaleString(); }
  function setText(id, v){ const el = document.getElementById(id); if (el) el.textContent = v; }
  
  function formatMonth(m) {
    const [y, mo] = m.split('-');
    return new Date(y, mo - 1).toLocaleString('default', { month: 'short' }) + " '" + y.slice(2);
  }

  function badgeClass(cat){
    return cat === 'Technology' ? 'badge-tech' : cat === 'Furniture' ? 'badge-furn' : 'badge-office';
  }
  
  function chartOptions(yLabel, dollars = false) {
    return {
      responsive: true,
      plugins: {
        legend: { labels: { color: COLORS.text, font: { size: 12 }, boxWidth: 12 } },
        tooltip: {
          callbacks: dollars
            ? { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` }
            : {}
        }
      },
      scales: {
        x: { ticks: { color: COLORS.text, font: { size: 11 } }, grid: { color: COLORS.grid } },
        y: {
          ticks: {
            color: COLORS.text,
            font: { size: 11 },
            callback: dollars ? v => v < 0 ? '-$' + (Math.abs(v) >= 1000 ? (Math.abs(v)/1000).toFixed(0)+'k' : Math.abs(v)) : '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) : undefined
          },
          grid: { color: COLORS.grid }
        }
      }
    };
  }
  
  // ── START ─────────────────────────────────────────────────────
  loadData();