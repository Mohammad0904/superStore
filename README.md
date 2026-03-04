# 📊 Global Sales Executive Dashboard

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-Visualization-FF6384?logo=chartdotjs)
![HTML5](https://img.shields.io/badge/HTML5-Markup-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?logo=css3)
![License](https://img.shields.io/badge/License-MIT-green)

> An interactive, single-page executive sales dashboard built with vanilla JavaScript and Chart.js — enabling real-time filtering and business insight discovery across regions, categories, and time periods.

---

## 📌 Project Overview

This project simulates the kind of internal business intelligence tool used at companies like Amazon, Walmart, or Shopify — where analysts need to quickly slice sales data by region or product category to support executive decisions.

Built entirely with vanilla JavaScript (no frameworks), it demonstrates data engineering logic on the frontend: parsing JSON records, applying filter/reduce operations, and dynamically re-rendering charts without a page reload.

**Dataset:** Global Superstore Sales (JSON)  
**Tools:** HTML5, CSS3, Vanilla JavaScript (ES6+), Chart.js

---

## 🎯 Business Questions Answered

| # | Question |
|---|----------|
| 1 | Which region generates the highest total sales revenue? |
| 2 | How does each product category perform across regions? |
| 3 | What are the monthly sales trends over time? |
| 4 | Which category drives the most revenue in a given region? |
| 5 | Where should the business focus its sales resources? |

---

## 📁 Repository Structure

```
sales-dashboard-js/
│
├── index.html         # SPA layout — canvas elements, dropdowns, structure
├── style.css          # Professional dark-mode corporate styling
├── app.js             # Core engine — data parsing, filter logic, chart updates
└── data.json          # Sales dataset (region, category, sales, date)
```

---

## ✨ Features

- **Real-Time Filtering** — Dropdown filters instantly update all charts without page reload
- **Multi-Chart Layout** — Bar chart (monthly sales) + Doughnut chart (category breakdown) side by side
- **Data Engineering Logic** — `.filter()`, `.reduce()`, and `.groupBy`-style aggregations on raw JSON
- **Responsive Design** — Works on desktop and tablet screens
- **Zero Dependencies** — No React, no Vue, no build tools — just HTML, CSS, and JS

---

## 🖥️ Live Demo

> 📎 **[View Live Dashboard →](https://YOUR_USERNAME.github.io/sales-dashboard-js)**  
> *(Enable GitHub Pages from Settings → Pages → main branch → / root)*

---

## 🛠️ How to Run Locally

**1. Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/sales-dashboard-js.git
cd sales-dashboard-js
```

**2. Open in browser**
```bash
# Option A — just open directly
open index.html

# Option B — serve locally (recommended to avoid CORS on fetch)
npx serve .
# then visit http://localhost:3000
```

> No installs, no build step. It runs in any modern browser.

---

## ⚙️ How the Data Pipeline Works

```
data.json (raw records)
     │
     ▼
app.js loads data via fetch()
     │
     ▼
User selects region from dropdown
     │
     ▼
.filter() isolates matching records
     │
     ▼
.reduce() aggregates sales by category / month
     │
     ▼
chart.update() re-renders visuals in real time
```

This pattern mirrors how analysts work with REST API responses in production dashboards — just with a local JSON file instead of a live endpoint.

---

## 📊 Dashboard Panels

| Panel | Chart Type | What It Shows |
|-------|------------|---------------|
| Monthly Sales Trend | Bar Chart | Revenue over time, filterable by region |
| Category Breakdown | Doughnut Chart | Sales share by product category |

---

## 🔍 Key Insights (Sample Data)

- **Technology** is the highest-revenue category across all regions, accounting for the majority of total sales.
- The **West region** leads in Technology sales, while **Central** underperforms relative to population size.
- **Furniture** shows strong performance in Q1 but dips mid-year — a seasonal signal worth monitoring.
- **Office Supplies** contribute steady, low-variance revenue — a reliable but low-growth segment.

> ⚠️ *Insights above are based on sample data. Update this section after loading your full dataset.*

---

## 📚 Skills Demonstrated

- ✅ DOM manipulation & event-driven programming
- ✅ JSON data parsing and transformation
- ✅ Functional JS — `filter()`, `reduce()`, `map()`
- ✅ Chart.js integration with dynamic `chart.update()`
- ✅ Single Page Application (SPA) architecture
- ✅ API-ready design (swap `fetch('data.json')` for any REST endpoint)
- ✅ Business data interpretation and dashboard UX

---

## 🔮 Future Improvements

- [ ] Add date range picker for time-based filtering
- [ ] Connect to a live REST API (e.g., mock backend with Node.js/Express)
- [ ] Export filtered data as CSV download
- [ ] Add KPI summary cards (Total Revenue, Avg Order Value, Top Region)
- [ ] Mobile-responsive layout improvements

---

## 🗂️ Data Source

Sales data adapted from the [Superstore Sales Dataset](https://www.kaggle.com/datasets/vivek468/superstore-dataset-final) available on Kaggle. Used here for educational and portfolio purposes.

---

## 👤 Author

**Mohammad Sadman Shabab Hossain**  
Computer Science Graduate — York University  
📧 sadmanshabab31@example.com  
🔗 [LinkedIn](https://linkedin.com/in/msshossain) | [GitHub](https://github.com/Mohammad0904)

---

*Built as a portfolio project to demonstrate frontend data engineering and business analysis skills for analyst and relevant roles.*