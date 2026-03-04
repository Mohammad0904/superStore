/* ============================================================
   app.js — Global Sales Executive Dashboard
   Author: Mohammad Sadman Shabab Hossain | York University CS

   PURPOSE:
   This file is the entire brain of the dashboard. It is
   responsible for three things:
     1. Pulling the sales records out of data.json
     2. Crunching those records into chart-ready summaries
        whenever the user changes a filter
     3. Drawing (and re-drawing) every visual on the page

   ARCHITECTURE NOTE:
   There is no backend here. Everything — filtering, grouping,
   aggregating — happens in the browser using plain JavaScript
   array methods (.filter, .reduce, .map). This mirrors how a
   frontend analyst would consume a REST API: swap fetch('data.json')
   for fetch('https://api.yourcompany.com/sales') and the rest
   of the code works without a single change.
   ============================================================ */


/* ─────────────────────────────────────────────────────────────
   SECTION 1 — DESIGN TOKENS
   All colours live here so changing the palette is a one-line
   edit, not a grep across the whole file.
   ───────────────────────────────────────────────────────────── */

   const COLORS = {
    blue:   '#58a6ff',   // primary data series, Technology category
    green:  '#3fb950',   // profit lines, Office Supplies category
    orange: '#f0883e',   // Furniture category, second region bar
    purple: '#a371f7',   // fourth region bar, accent
    red:    '#f85149',   // reserved for negative / alert values
    teal:   '#39d353',   // spare — available for future series
    grid:   'rgba(48,54,61,0.6)',  // subtle chart gridlines
    text:   '#8b949e',             // axis labels and legend text
};

/*
   Map each product category to its brand colour.
   Used by the doughnut chart and the table badge colouring.
   Any category not listed here falls back to COLORS.purple
   so the chart never crashes on unexpected data.
*/
const CATEGORY_COLORS = {
    'Technology':      COLORS.blue,
    'Furniture':       COLORS.orange,
    'Office Supplies': COLORS.green,
};


/* ─────────────────────────────────────────────────────────────
   SECTION 2 — GLOBAL STATE
   Keeping rawData at module scope means we only fetch once.
   Every filter operation reads from rawData and produces a
   new filtered array — the original is never mutated.
   charts{} stores Chart.js instances so we can call .destroy()
   before re-drawing; without this, Chart.js stacks canvases
   on top of each other and the page leaks memory.
   ───────────────────────────────────────────────────────────── */

let rawData = [];   // full unfiltered dataset loaded from data.json
let charts  = {};   // live Chart.js instances keyed by chart name


/* ─────────────────────────────────────────────────────────────
   SECTION 3 — DATA LOADING
   ───────────────────────────────────────────────────────────── */

/*
   loadData()
   ----------
   Entry point for the whole application. Called once on page load.

   Why fetch() instead of a <script> tag?
   fetch() is async — the browser keeps the page responsive while
   the JSON is downloading. A <script src="data.json"> would block
   rendering and also doesn't give us a clean Promise to chain from.

   The try/catch replaces a cryptic browser network error with a
   human-readable message directly on the page, which is especially
   useful when someone opens index.html by double-clicking it
   instead of running a local server (CORS blocks fetch in that case).
*/
async function loadData() {
    try {
        const res = await fetch('data.json');   // request the sales dataset
        rawData = await res.json();             // parse JSON text → JS array of objects
        initDashboard();                        // hand off to the initialiser
    } catch (err) {
        // Replace the loading spinner with a plain-English error.
        // Common causes: file not found, CORS block from opening as file://.
        document.getElementById('loading').innerHTML =
            '⚠️ Could not load data.json. Make sure you are serving this with a local server.';
    }
}


/* ─────────────────────────────────────────────────────────────
   SECTION 4 — INITIALISATION
   ───────────────────────────────────────────────────────────── */

/*
   initDashboard()
   ---------------
   Runs once, immediately after the data arrives successfully.

   Sequence:
     1. Hide the loading spinner (it has already done its job)
     2. Reveal the app shell (hidden by default so there is no
        flash of empty charts before data is ready)
     3. Draw every chart and table with the full unfiltered dataset
     4. Attach event listeners to the filter dropdowns

   Separating step 3 (renderAll) from step 4 (bindFilters) keeps
   concerns clean: rendering knows nothing about DOM events, and
   the event system knows nothing about chart internals.
*/
function initDashboard() {
    document.getElementById('loading').style.display = 'none';  // hide spinner
    document.getElementById('app').style.display     = 'block'; // reveal dashboard

    renderAll(rawData);   // first paint using 100% of the dataset
    bindFilters();        // wire up the dropdowns now that charts exist
}


/* ─────────────────────────────────────────────────────────────
   SECTION 5 — FILTER LOGIC
   ───────────────────────────────────────────────────────────── */

/*
   bindFilters()
   -------------
   Attaches a 'change' listener to both dropdown menus using a
   loop rather than two separate addEventListener calls — keeps
   it DRY and makes it easy to add a third filter (e.g. Year)
   later by just adding its id to the array.

   The Reset button restores both selects to 'All' and then calls
   applyFilters() exactly like a manual dropdown change would,
   so there is one code path for rendering regardless of how the
   filter state was reached.
*/
function bindFilters() {
    // Attach the same handler to every filter dropdown
    ['regionFilter', 'categoryFilter'].forEach(id => {
        document.getElementById(id).addEventListener('change', applyFilters);
    });

    // Reset button — clear both dropdowns then re-render
    document.getElementById('resetBtn').addEventListener('click', () => {
        document.getElementById('regionFilter').value   = 'All';
        document.getElementById('categoryFilter').value = 'All';
        applyFilters();  // trigger a fresh render with no filters active
    });
}

/*
   applyFilters()
   --------------
   Called every time a dropdown changes or Reset is clicked.

   Filtering strategy:
     - Start with the full rawData array (never mutate it)
     - Apply region filter first (typically reduces dataset the most)
     - Apply category filter on the already-region-filtered result
     - Pass the final filtered array to renderAll()

   Using .filter() returns a new array each time, so rawData is
   always the ground truth and filters are fully composable.
   Adding a third dimension (e.g. year) means one more if-block here.
*/
function applyFilters() {
    const region   = document.getElementById('regionFilter').value;
    const category = document.getElementById('categoryFilter').value;

    // Start with everything, then narrow down
    let filtered = rawData;

    // Only filter if the user picked something other than "All"
    if (region   !== 'All') filtered = filtered.filter(d => d.region   === region);
    if (category !== 'All') filtered = filtered.filter(d => d.category === category);

    renderAll(filtered);  // repaint every visual with the narrowed dataset
}


/* ─────────────────────────────────────────────────────────────
   SECTION 6 — RENDER ORCHESTRATOR
   ───────────────────────────────────────────────────────────── */

/*
   renderAll(data)
   ---------------
   Single coordination point that repaints the entire dashboard
   with one function call. Every visual on the page is updated
   together, so there is no risk of KPI numbers being out of sync
   with the charts below them.

   Passing 'data' explicitly (rather than reading rawData inside
   each function) keeps each renderer pure — it produces output
   based only on what you hand it, which makes them trivial to
   unit-test in isolation.
*/
function renderAll(data) {
    updateKPIs(data);          // top-row summary numbers
    renderMonthlySales(data);  // bar chart — revenue by month
    renderCategoryDonut(data); // doughnut — revenue split by category
    renderRegionBar(data);     // horizontal bar — revenue by region
    renderProfitLine(data);    // line chart — sales vs profit over time
    renderTable(data);         // ranked top-10 products table
}


/* ─────────────────────────────────────────────────────────────
   SECTION 7 — KPI SUMMARY CARDS
   ───────────────────────────────────────────────────────────── */

/*
   updateKPIs(data)
   ----------------
   Computes five headline business metrics and injects them into
   the five KPI card elements at the top of the page.

   All five metrics are derived from the same filtered array, so
   they always reflect exactly the same slice of data as the charts.

   Metrics explained:
     totalSales   — gross revenue; sum of every order's sale value
     totalProfit  — net earnings; sum of every order's profit value
     totalOrders  — simple record count (one row = one line item)
     avgOrderVal  — revenue ÷ orders; measures typical deal size
     profitMargin — profit ÷ revenue × 100; overall efficiency %

   Guard against division by zero: if data is empty (e.g. a filter
   returns nothing), avgOrderVal and profitMargin default to 0
   rather than returning NaN and breaking the display.
*/
function updateKPIs(data) {
    // Accumulate totals in a single pass through the array
    const totalSales  = data.reduce((sum, d) => sum + d.sales,  0);
    const totalProfit = data.reduce((sum, d) => sum + d.profit, 0);
    const totalOrders = data.length;

    // Derived metrics — guard against empty dataset
    const avgOrderVal  = totalOrders ? totalSales / totalOrders : 0;
    const profitMargin = totalSales  ? (totalProfit / totalSales) * 100 : 0;

    // Push formatted strings into the DOM
    setText('kpiSales',  fmt(totalSales));
    setText('kpiProfit', fmt(totalProfit));
    setText('kpiOrders', totalOrders.toLocaleString());   // comma-separated integer
    setText('kpiAOV',    fmt(avgOrderVal));
    setText('kpiMargin', profitMargin.toFixed(1) + '%'); // one decimal place
}


/* ─────────────────────────────────────────────────────────────
   SECTION 8 — MONTHLY SALES BAR CHART
   ───────────────────────────────────────────────────────────── */

/*
   renderMonthlySales(data)
   ------------------------
   Aggregates daily order records into calendar-month buckets,
   then draws a vertical bar chart showing revenue per month.

   Aggregation approach:
     Each record's date is sliced to "YYYY-MM" (the first 7 chars).
     We use this string as a dictionary key and accumulate sales
     into it. Object.keys().sort() sorts chronologically because
     "YYYY-MM" strings sort correctly as plain strings.

   Visual design choices:
     - Bars get progressively more opaque left-to-right (opacity
       ramps from 0.4 to 0.9) to give a subtle sense of time
       moving forward without adding a legend entry.
     - borderRadius: 6 rounds the bar tops — a small detail that
       makes the chart feel modern rather than default.

   Why destroy() before re-drawing?
     Chart.js attaches a chart instance to the canvas element.
     If you call new Chart() on an already-used canvas without
     destroying the old instance first, Chart.js throws a warning
     and the old chart remains underneath, causing visual glitches.
*/
function renderMonthlySales(data) {
    // ── Step 1: Group sales by "YYYY-MM" month key ──
    const monthly = {};
    data.forEach(d => {
        const month = d.date.slice(0, 7);            // e.g. "2014-01"
        monthly[month] = (monthly[month] || 0) + d.sales; // accumulate
    });

    // ── Step 2: Sort keys chronologically → parallel value array ──
    const labels = Object.keys(monthly).sort();      // ["2014-01", "2014-02", ...]
    const values = labels.map(k => monthly[k]);      // matching revenue totals

    // ── Step 3: Destroy old chart if it exists, then draw fresh ──
    const ctx = document.getElementById('monthlySalesChart');
    if (charts.monthly) charts.monthly.destroy();

    charts.monthly = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(formatMonth),  // "2014-01" → "Jan '14"
            datasets: [{
                label: 'Monthly Sales ($)',
                data: values,
                // Progressive opacity — earlier months are lighter
                backgroundColor: values.map((_, i) =>
                    `rgba(88,166,255,${0.4 + (i / labels.length) * 0.5})`),
                borderColor: COLORS.blue,
                borderWidth: 1,
                borderRadius: 6,   // rounded bar tops
            }]
        },
        options: chartOptions('Sales Revenue ($)', true), // shared axis/tooltip config
    });
}


/* ─────────────────────────────────────────────────────────────
   SECTION 9 — CATEGORY REVENUE DOUGHNUT CHART
   ───────────────────────────────────────────────────────────── */

/*
   renderCategoryDonut(data)
   -------------------------
   Shows what percentage of total revenue comes from each of the
   three product categories (Technology, Furniture, Office Supplies).

   The doughnut format was chosen over a pie chart because the
   hollow centre could be used in a future iteration to display
   the total revenue figure as a centred label.

   Tooltip customisation:
     The default Chart.js tooltip only shows the raw value.
     The custom callback also calculates and appends the percentage
     by dividing ctx.raw (that segment's value) by the running sum
     of all values. This avoids storing a separate total variable
     in outer scope.

   cutout: '65%' controls how thick the ring is. 0% = solid pie,
   100% = invisible. 65% is a common "executive dashboard" aesthetic.
*/
function renderCategoryDonut(data) {
    // ── Step 1: Sum revenue per category ──
    const cats = {};
    data.forEach(d => {
        cats[d.category] = (cats[d.category] || 0) + d.sales;
    });

    const labels = Object.keys(cats);            // category names
    const values = labels.map(k => cats[k]);     // matching revenue sums

    // ── Step 2: Destroy and redraw ──
    const ctx = document.getElementById('categoryChart');
    if (charts.donut) charts.donut.destroy();

    charts.donut = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                // Pull colour from CATEGORY_COLORS map; purple as safe fallback
                backgroundColor: labels.map(l => CATEGORY_COLORS[l] || COLORS.purple),
                borderColor: '#161b22',  // matches card background — "gapped" look
                borderWidth: 3,
                hoverOffset: 8,          // segment lifts slightly on hover
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: COLORS.text, padding: 16, font: { size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        // Show: " Technology: $1,234,567 (53.7%)"
                        label: ctx => {
                            const total = values.reduce((a, b) => a + b, 0);
                            const pct   = ((ctx.raw / total) * 100).toFixed(1);
                            return ` ${ctx.label}: ${fmt(ctx.raw)} (${pct}%)`;
                        }
                    }
                }
            },
            cutout: '65%',  // ring thickness — larger = thinner ring
        }
    });
}


/* ─────────────────────────────────────────────────────────────
   SECTION 10 — SALES BY REGION HORIZONTAL BAR CHART
   ───────────────────────────────────────────────────────────── */

/*
   renderRegionBar(data)
   ---------------------
   Ranks the four sales regions by total revenue using a horizontal
   bar chart. Horizontal orientation was chosen because region names
   are short and read more comfortably on the y-axis than rotated
   x-axis labels would.

   Sorting: regions are sorted descending by revenue so the
   highest-performing region always appears at the top — matching
   the natural reading direction of a leaderboard.

   Axis configuration:
     - x-axis (values): custom tick callback formats numbers as
       "$700k" rather than "700000" — far more readable at a glance
     - y-axis (categories): plain text ticks, no dollar formatting
       This is why renderRegionBar has its OWN options object rather
       than calling the shared chartOptions() helper — the helper
       applies dollar formatting to the y-axis, which would turn
       region names into "$0", "$1", "$2", "$3".
*/
function renderRegionBar(data) {
    // ── Step 1: Sum revenue per region ──
    const regions = {};
    data.forEach(d => {
        regions[d.region] = (regions[d.region] || 0) + d.sales;
    });

    // ── Step 2: Sort regions highest → lowest revenue ──
    const sorted  = Object.entries(regions).sort((a, b) => b[1] - a[1]);
    const labels  = sorted.map(e => e[0]);   // ["West", "East", "Central", "South"]
    const values  = sorted.map(e => e[1]);   // matching totals
    const palette = [COLORS.blue, COLORS.green, COLORS.orange, COLORS.purple];

    // ── Step 3: Destroy and redraw ──
    const ctx = document.getElementById('regionChart');
    if (charts.region) charts.region.destroy();

    charts.region = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Total Sales ($)',
                data: values,
                backgroundColor: palette.slice(0, labels.length), // one colour per region
                borderRadius: 6,
                borderSkipped: false,  // round all four corners, not just top
            }]
        },
        options: {
            indexAxis: 'y',       // flip to horizontal bar orientation
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: COLORS.text, font: { size: 12 }, boxWidth: 12 }
                },
                tooltip: {
                    callbacks: {
                        // Show formatted dollar total in tooltip
                        label: ctx => ` Total Sales: ${fmt(ctx.raw)}`
                    }
                }
            },
            scales: {
                // x-axis carries the numeric sales values → format as $700k
                x: {
                    ticks: {
                        color: COLORS.text,
                        font: { size: 11 },
                        callback: v => '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v)
                    },
                    grid: { color: COLORS.grid }
                },
                // y-axis carries region name strings → no dollar formatting
                y: {
                    ticks: { color: COLORS.text, font: { size: 11 } },
                    grid: { color: COLORS.grid }
                }
            }
        }
    });
}


/* ─────────────────────────────────────────────────────────────
   SECTION 11 — SALES VS PROFIT TREND LINE CHART
   ───────────────────────────────────────────────────────────── */

/*
   renderProfitLine(data)
   ----------------------
   Draws two overlapping line series — monthly Sales and monthly
   Profit — on the same axis so a viewer can instantly see both
   the top-line revenue trend and the bottom-line profit trend
   together, and spot months where costs squeezed the margin.

   Why two series on one chart rather than two separate charts?
     The gap between the Sales line and the Profit line IS the
     story — it represents cost of goods, discounts, and shipping.
     Showing them separately would lose that visual relationship.

   Months where profit dips below zero appear below the $0 gridline.
   The y-axis tick callback formats negatives as "-$20k" rather than
   the browser default of "-20000", keeping the axis readable.

   tension: 0.4 adds a gentle curve to the lines (0 = straight
   segments, 1 = very curvy). 0.4 is a common "clean but not
   cartoonish" setting.

   fill: true shades the area under each line. Combined with very
   low opacity (0.08) this adds depth without obscuring the other
   series.
*/
function renderProfitLine(data) {
    // ── Step 1: Group both sales and profit by "YYYY-MM" ──
    const monthly = {};
    data.forEach(d => {
        const m = d.date.slice(0, 7);    // "2014-01"
        if (!monthly[m]) monthly[m] = { sales: 0, profit: 0 };
        monthly[m].sales  += d.sales;
        monthly[m].profit += d.profit;
    });

    const labels = Object.keys(monthly).sort();  // chronological month keys

    // ── Step 2: Destroy and redraw ──
    const ctx = document.getElementById('profitChart');
    if (charts.profit) charts.profit.destroy();

    charts.profit = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels.map(formatMonth),  // "2014-01" → "Jan '14"
            datasets: [
                {
                    // ── Series A: Revenue (blue) ──
                    label: 'Sales ($)',
                    data: labels.map(k => monthly[k].sales),
                    borderColor: COLORS.blue,
                    backgroundColor: 'rgba(88,166,255,0.08)',  // very faint fill
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: COLORS.blue,
                    fill: true,      // shade area under line
                    tension: 0.4,    // smooth curves
                },
                {
                    // ── Series B: Profit (green, can go negative) ──
                    label: 'Profit ($)',
                    data: labels.map(k => monthly[k].profit),
                    borderColor: COLORS.green,
                    backgroundColor: 'rgba(63,185,80,0.08)',   // very faint fill
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: COLORS.green,
                    fill: true,
                    tension: 0.4,
                }
            ]
        },
        // Re-use the shared chartOptions helper which handles the
        // negative-value tick formatting ("-$20k") on the y-axis
        options: chartOptions('Amount ($)', true),
    });
}


/* ─────────────────────────────────────────────────────────────
   SECTION 12 — TOP 10 PRODUCTS TABLE
   ───────────────────────────────────────────────────────────── */

/*
   renderTable(data)
   -----------------
   The Kaggle dataset has multiple rows per product (one per order),
   so we first consolidate them: all rows sharing the same product
   name are merged into a single summary object that accumulates
   total sales, total profit, and order count.

   We then sort descending by sales and slice the top 10.

   Table columns:
     Rank      — 1-based position in the top-10
     Product   — full product name from the dataset
     Category  — colour-coded badge (Technology/Furniture/Office Supplies)
     Region    — the region that generated the most orders for this product
     Revenue   — total sales across all orders for this product
     Profit    — total profit (green; negative values will also show green
                 because the CSS class is named profit-positive — a future
                 improvement would conditionally apply a red class for negatives)
     Margin    — profit ÷ revenue × 100, one decimal place

   Template literals build each <tr> as a string then join('') produces
   one big HTML string that is set as innerHTML in a single DOM write —
   more efficient than appending one row at a time in a loop.
*/
function renderTable(data) {
    // ── Step 1: Consolidate multiple order rows per product ──
    const products = {};
    data.forEach(d => {
        if (!products[d.product]) {
            // First time we see this product — initialise its summary object
            products[d.product] = {
                product:  d.product,
                category: d.category,
                region:   d.region,   // region from the first order seen
                sales:    0,
                profit:   0,
                orders:   0,
            };
        }
        // Accumulate totals across all orders for this product
        products[d.product].sales  += d.sales;
        products[d.product].profit += d.profit;
        products[d.product].orders += 1;
    });

    // ── Step 2: Sort by revenue descending, keep top 10 ──
    const top10 = Object.values(products)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10);

    // ── Step 3: Build HTML rows and inject into table body ──
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
    `).join('');  // join array of row strings into one HTML block
}


/* ─────────────────────────────────────────────────────────────
   SECTION 13 — SHARED HELPERS
   ───────────────────────────────────────────────────────────── */

/*
   fmt(n)
   ------
   Formats a raw number into a display-ready dollar string.
   Math.round() drops the cents (we don't need $61,600.47 on a
   chart) and toLocaleString() inserts the commas automatically
   using the browser's locale — so Canadian/US users see commas,
   European users see dots, without any extra code.

   Examples:
     fmt(2297201)  → "$2,297,201"
     fmt(230.49)   → "$230"
     fmt(-1811.3)  → "$-1,812"   ← sign stays, still readable
*/
function fmt(n) {
    return '$' + Math.round(n).toLocaleString();
}

/*
   setText(id, value)
   ------------------
   Tiny DOM helper that finds an element by id and sets its text.
   The null-guard (if el) prevents a silent crash if an id is ever
   mistyped — the page keeps working, only that one card goes blank.
*/
function setText(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
}

/*
   formatMonth(m)
   --------------
   Converts an ISO month string into a compact chart label.

   Input:  "2014-01"
   Output: "Jan '14"

   Why not just display "2014-01"?
     With 48 months of data on the x-axis, "2014-01" would cause
     severe label overlap. "Jan '14" is short enough to fit even
     when the chart is narrow.

   new Date(y, mo-1) works because the Date constructor expects a
   0-indexed month (0=Jan, 11=Dec), so we subtract 1 from the
   1-indexed month in the ISO string.
*/
function formatMonth(m) {
    const [y, mo] = m.split('-');
    return new Date(y, mo - 1)
        .toLocaleString('default', { month: 'short' }) + " '" + y.slice(2);
}

/*
   badgeClass(category)
   --------------------
   Maps a category string to the matching CSS class for the
   colour-coded pill badge in the products table.

   Using a ternary chain keeps it concise. If a new category is
   ever added to the dataset, it will silently fall through to
   'badge-office' (green) — not ideal, but safe. A Map lookup
   or object lookup would be a cleaner extension point.
*/
function badgeClass(cat) {
    return cat === 'Technology' ? 'badge-tech'
         : cat === 'Furniture'  ? 'badge-furn'
         :                        'badge-office';
}

/*
   chartOptions(yLabel, dollars)
   -----------------------------
   Factory function that returns a Chart.js options object shared
   by the monthly sales bar chart and the sales/profit line chart.

   Having one place that defines colours, font sizes, and grid
   styling means the two charts always look visually consistent.
   If we decide to change the grid opacity or axis font size, we
   change it here and both charts update.

   The 'dollars' flag controls the y-axis tick formatter:
     dollars=true  → format 80000 as "$80k", -20000 as "-$20k"
     dollars=false → use Chart.js default numeric formatting

   The negative-value branch uses Math.abs() to strip the sign,
   formats the absolute value as "20k", then prepends "-$" manually.
   This avoids a display like "$-20k" which reads ambiguously.

   NOTE: renderRegionBar does NOT use this helper because it
   needs dollars on the x-axis and plain text on the y-axis —
   the inverse of the other charts. That chart defines its own
   options object inline.
*/
function chartOptions(yLabel, dollars = false) {
    return {
        responsive: true,   // chart resizes with its container
        plugins: {
            legend: {
                labels: { color: COLORS.text, font: { size: 12 }, boxWidth: 12 }
            },
            tooltip: {
                callbacks: dollars
                    // Format tooltip values as dollar amounts
                    ? { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.raw)}` }
                    : {}   // fall back to Chart.js default tooltip for non-dollar axes
            }
        },
        scales: {
            // x-axis: plain category labels or month strings — no special formatting
            x: {
                ticks: { color: COLORS.text, font: { size: 11 } },
                grid:  { color: COLORS.grid }
            },
            // y-axis: numeric values with optional dollar + k-suffix formatting
            y: {
                ticks: {
                    color: COLORS.text,
                    font:  { size: 11 },
                    callback: dollars
                        ? v => {
                            if (v < 0) {
                                // Negative values: "-$20k" format
                                const abs = Math.abs(v);
                                return '-$' + (abs >= 1000 ? (abs / 1000).toFixed(0) + 'k' : abs);
                            }
                            // Positive values: "$80k" format
                            return '$' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v);
                        }
                        : undefined   // no callback = Chart.js handles it automatically
                },
                grid: { color: COLORS.grid }
            }
        }
    };
}


/* ─────────────────────────────────────────────────────────────
   SECTION 14 — BOOTSTRAP
   One line. Everything else is triggered by the Promise chain
   inside loadData() → initDashboard() → renderAll() → ...
   ───────────────────────────────────────────────────────────── */
loadData();