# 📊 Global Sales Executive Dashboard

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-Visualization-FF6384?logo=chartdotjs)
![HTML5](https://img.shields.io/badge/HTML5-Markup-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Styling-1572B6?logo=css3)
![License](https://img.shields.io/badge/License-MIT-green)

> An interactive, single-page executive sales dashboard built with vanilla JavaScript and Chart.js — enabling real-time filtering and business insight discovery across regions, categories, and time periods.

---

## 💡 Why I Built This

Many small and medium-sized businesses today still track their monthly sales, profits, and inventory using **pen and paper or basic spreadsheets**. While this works at a small scale, it makes it nearly impossible to spot trends, compare regions, or make fast data-driven decisions as the business grows.

This dashboard was built with exactly those businesses in mind — to show what it looks like when you take raw sales records and turn them into a **live, interactive business intelligence tool** that any manager or owner can use without any technical knowledge. No complicated software, no expensive licenses — just open a browser and your data tells its own story.

The goal is simple: **help small businesses stop guessing and start growing**, by making their own numbers visible and understandable in real time.

---

## 📌 Project Overview

This project simulates the kind of internal business intelligence tool used at companies like Amazon, Walmart, or Shopify — where analysts need to quickly slice sales data by region or product category to support executive decisions.

Built entirely with vanilla JavaScript (no frameworks), it demonstrates data engineering logic on the frontend: parsing JSON records, applying filter/reduce operations, and dynamically re-rendering charts without a page reload.

**Dataset:** [Kaggle — Global Superstore Sales Dataset](https://www.kaggle.com/datasets/vivek468/superstore-dataset-final)  
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
| 6 | Which products generate the most revenue and best profit margins? |
| 7 | Are there months where the business operates at a loss? |

---

## 📁 Repository Structure

```
superStore/
│
├── index.html         # SPA layout — canvas elements, dropdowns, structure
├── style.css          # Professional dark-mode corporate styling
├── app.js             # Core engine — data parsing, filter logic, chart updates
├── .gitignore         # Excludes data files and utility scripts
└── README.md          # Project documentation
```

> ⚠️ **Note:** `data.json` and the raw CSV are not included in this repo. See the **How to Run** section below to generate them yourself.

---

## ✨ Features

- **Real-Time Filtering** — Dropdown filters by Region and Category instantly update all charts and KPI cards without any page reload
- **5 KPI Summary Cards** — Total Revenue, Total Profit, Total Orders, Avg Order Value, and Profit Margin always in view
- **4 Interactive Charts** — Bar, Doughnut, Horizontal Bar, and Line charts covering every angle of the business
- **Top 10 Products Table** — Ranked by revenue with profit and margin highlighted
- **Responsive Design** — Works on desktop and tablet screens
- **Zero Dependencies** — No React, no Vue, no build tools — just HTML, CSS, and JS

---

## 🖥️ Dashboard Panels Explained

### 📊 KPI Cards (Top Row)
Five always-visible summary cards give an instant snapshot of business health. All five update in real time when you apply a region or category filter — so a manager can instantly see, for example, the total profit from just the West region's Technology sales.

| Card | What It Shows |
|------|--------------|
| Total Revenue | Gross sales across all filtered orders |
| Total Profit | Net earnings after product costs |
| Total Orders | Count of unique transactions |
| Avg Order Value | Revenue divided by number of orders |
| Profit Margin | Profit as a percentage of total revenue |

---

### 📈 Monthly Sales Revenue (Bar Chart)
Shows total revenue broken down by month across the full dataset (2014–2017). Each bar represents one calendar month. The chart updates when filters are applied, allowing you to isolate — for example — how Technology sales in the East region trended month by month. The x-axis uses a clean `Jan '14` format to keep labels readable across four years of data.

**How to use it:** Look for seasonality patterns. Notice which months spike (typically Nov–Dec due to holiday demand) and which months underperform.

---

### 🍩 Revenue by Category (Doughnut Chart)
Breaks total sales into three product categories: Technology, Furniture, and Office Supplies. Each segment shows its share of the total revenue pie. Hover over any segment to see the exact dollar amount and percentage.

**How to use it:** Combine with the Region filter to see which category dominates in each region. For example, filter to "Central" to compare how heavily that region relies on Office Supplies vs. Technology.

---

### 📊 Sales by Region (Horizontal Bar Chart)
Ranks all four regions — West, East, Central, and South — by their total revenue contribution. The longest bar is the highest-performing region. Colors are distinct per region for easy scanning.

**How to use it:** Use alongside the Category filter to discover which region leads in a specific product line. A business could use this to decide where to invest more sales resources.

---

### 📉 Sales vs. Profit Trend (Line Chart)
Plots both monthly Sales and monthly Profit as two overlapping lines across the full time range. This is the most powerful chart for spotting financial health — when the green profit line dips below zero, the business lost money that month.

**How to use it:** Look for months where sales are high but profit is low — this could signal heavy discounting, high shipping costs, or product returns. The gap between the two lines represents operational costs and inefficiencies.

---

### 🏆 Top 10 Products Table
Lists the ten highest-revenue products in the currently filtered view, with their category badge, region, total revenue, profit in green, and calculated margin percentage. Negative margins appear highlighted to draw attention.

**How to use it:** Filter by a specific category or region and the table updates to show the top performers in that segment. This helps identify which specific products are driving — or dragging — the business.

---

## 🔍 Key Findings (Based on Real Kaggle Data)

### 💰 Revenue
- Total revenue across all regions and years is **$2,297,201** from **9,994 orders**
- The business has grown year-over-year, with **2017 showing the strongest monthly peaks** — some months exceeding $120k in a single month
- November and December consistently show revenue spikes across all years, confirming strong **seasonal demand**

### 🗺️ Regional Performance
- **West leads all regions** in total revenue, followed closely by East
- **Central and South underperform** relative to the other two regions — a signal that either market penetration is lower or product-market fit is weaker there
- The gap between West and South is significant, suggesting uneven sales force distribution or regional demand differences

### 🏷️ Category Insights
- **Technology dominates revenue share**, making it the single most important category for this business
- **Office Supplies** generate steady, low-variance revenue — reliable but low-growth
- **Furniture** has the lowest profit margins despite moderate revenue — likely due to high shipping and handling costs

### 📉 Profit vs. Sales
- Overall profit margin is **12.5%** — healthy but with significant variance month to month
- Several months show **negative profit**, meaning the business sold at a loss — likely due to heavy discounting or bulk orders with thin margins
- The profit line is relatively flat compared to the sales line, suggesting costs scale with revenue rather than being fixed

### 🏆 Product-Level
- The **Canon imageClass 2200 Advanced Copier** is the single highest-revenue product at $61,600 with a strong 40.9% margin
- Several products in the top 10 show **negative margins** (e.g., Cisco TelePresence at -8%) — these are loss leaders or products that should be repriced
- **Office Supplies dominate the top 10 by count** but Technology products lead in individual revenue per product

---

## ⚙️ How the Data Pipeline Works

```
Kaggle CSV (raw download)
     │
     ▼
convert.py — cleans, renames columns, formats dates → data.json
     │
     ▼
app.js loads data.json via fetch()
     │
     ▼
User selects Region / Category from dropdowns
     │
     ▼
.filter() isolates matching records
     │
     ▼
.reduce() aggregates sales by category / month / region
     │
     ▼
chart.update() re-renders all visuals in real time
```

This pattern mirrors how analysts work with REST API responses in production dashboards — just with a local JSON file instead of a live endpoint.

---

## 🛠️ How to Run Locally

**1. Clone the repository**
```bash
git clone https://github.com/Mohammad0904/superStore.git
cd superStore
```

**2. Download the dataset**

Go to [Kaggle — Superstore Dataset](https://www.kaggle.com/datasets/vivek468/superstore-dataset-final), download `Sample - Superstore.csv`, and place it inside a `/data` folder in the project root.

**3. Generate data.json**

Create a file called `convert.py` in the project root:
```python
import pandas as pd

df = pd.read_csv("data/Sample - Superstore.csv", encoding="latin1")
df = df[["Order ID", "Order Date", "Region", "Category", "Sub-Category", "Product Name", "Sales", "Profit", "Quantity"]]
df.columns = ["order_id", "date", "region", "category", "sub_category", "product", "sales", "profit", "quantity"]
df["date"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")
df["sales"]  = df["sales"].round(2)
df["profit"] = df["profit"].round(2)
df.to_json("data.json", orient="records", indent=2)
print(f"Done! {len(df)} records written to data.json")
```

Then run:
```bash
python3 convert.py
```

**4. Serve locally**
```bash
python3 -m http.server 8000
```
Visit `http://localhost:8000`

> You must use a local server — opening `index.html` directly won't work due to browser CORS restrictions on `fetch()`.

---

## 📚 Skills Demonstrated

- ✅ DOM manipulation & event-driven programming
- ✅ JSON data parsing and transformation
- ✅ Functional JS — `filter()`, `reduce()`, `map()`
- ✅ Chart.js integration with dynamic `chart.update()`
- ✅ Single Page Application (SPA) architecture
- ✅ API-ready design (swap `fetch('data.json')` for any REST endpoint)
- ✅ Python data cleaning and format conversion with Pandas
- ✅ Business data interpretation and executive dashboard UX

---

## 🔮 Future Improvements

- [ ] Add date range picker for custom time-based filtering
- [ ] Connect to a live REST API (e.g., mock backend with Node.js/Express)
- [ ] Export filtered data as CSV download
- [ ] Add year-over-year comparison view
- [ ] Mobile-responsive layout improvements
- [ ] Add a profitability alert system for negative-margin products

---

## 🗂️ Data Source

Sales data from the [Kaggle Global Superstore Dataset](https://www.kaggle.com/datasets/vivek468/superstore-dataset-final). Used here for educational and portfolio purposes only. Raw data is not included in this repository.

---

## 👤 Author

**Mohammad Sadman Shabab Hossain**  
Computer Science Graduate — York University  
📧 sadmanshabab31@gmail.com  
🔗 [LinkedIn](https://linkedin.com/in/msshossain) | [GitHub](https://github.com/Mohammad0904)

---

*Built as a portfolio project to demonstrate frontend data engineering and business analysis skills — and to show how simple technology can replace pen-and-paper processes for small businesses.*