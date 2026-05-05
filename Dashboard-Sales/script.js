const dashboardData = {
  spring: {
    metrics: {
      revenue: 284600,
      orders: 4318,
      items: 12740,
      average: 66,
      trends: ["+18.4%", "+12.9%", "+21.6%", "+5.1%"]
    },
    monthly: [
      ["Jan", 32000],
      ["Feb", 38500],
      ["Mar", 46200],
      ["Apr", 52800],
      ["May", 57500],
      ["Jun", 57600]
    ],
    categories: [
      ["Dresses", 86000],
      ["Shirts", 64200],
      ["Denim", 52000],
      ["Activewear", 43800],
      ["Accessories", 38600]
    ],
    regions: [
      ["North", 36, "1,552 orders"],
      ["West", 27, "1,166 orders"],
      ["South", 22, "950 orders"],
      ["East", 15, "650 orders"]
    ],
    orders: [
      ["#CC-1048", "Ava Martin", "Dresses", "Shipped", 184],
      ["#CC-1047", "Mia Chen", "Denim", "Packed", 132],
      ["#CC-1046", "Noah Smith", "Shirts", "Pending", 96],
      ["#CC-1045", "Sofia Patel", "Activewear", "Shipped", 148],
      ["#CC-1044", "Emma Wilson", "Accessories", "Shipped", 74]
    ]
  },
  summer: {
    metrics: {
      revenue: 319850,
      orders: 4984,
      items: 14960,
      average: 64,
      trends: ["+24.7%", "+17.8%", "+26.3%", "+3.8%"]
    },
    monthly: [
      ["Jul", 44600],
      ["Aug", 48200],
      ["Sep", 53100],
      ["Oct", 55950],
      ["Nov", 59200],
      ["Dec", 58800]
    ],
    categories: [
      ["T-Shirts", 90500],
      ["Dresses", 74800],
      ["Shorts", 58800],
      ["Swimwear", 51200],
      ["Accessories", 44550]
    ],
    regions: [
      ["West", 33, "1,645 orders"],
      ["South", 29, "1,445 orders"],
      ["North", 24, "1,196 orders"],
      ["East", 14, "698 orders"]
    ],
    orders: [
      ["#CC-1182", "Lily Brown", "T-Shirts", "Shipped", 118],
      ["#CC-1181", "Ethan Davis", "Shorts", "Packed", 102],
      ["#CC-1180", "Zara Khan", "Dresses", "Shipped", 216],
      ["#CC-1179", "Olivia Lee", "Swimwear", "Pending", 154],
      ["#CC-1178", "Amelia Clark", "Accessories", "Shipped", 88]
    ]
  },
  winter: {
    metrics: {
      revenue: 257900,
      orders: 3720,
      items: 9860,
      average: 69,
      trends: ["+9.2%", "+7.4%", "+8.8%", "+2.9%"]
    },
    monthly: [
      ["Jul", 31200],
      ["Aug", 35600],
      ["Sep", 39700],
      ["Oct", 45100],
      ["Nov", 50300],
      ["Dec", 56000]
    ],
    categories: [
      ["Coats", 81200],
      ["Knitwear", 62100],
      ["Denim", 45800],
      ["Boots", 39400],
      ["Scarves", 29400]
    ],
    regions: [
      ["North", 41, "1,525 orders"],
      ["East", 24, "893 orders"],
      ["West", 20, "744 orders"],
      ["South", 15, "558 orders"]
    ],
    orders: [
      ["#CC-0935", "Grace Hall", "Coats", "Shipped", 248],
      ["#CC-0934", "Lucas King", "Knitwear", "Packed", 126],
      ["#CC-0933", "Ella Young", "Boots", "Pending", 172],
      ["#CC-0932", "Ruby Scott", "Denim", "Shipped", 114],
      ["#CC-0931", "Henry Adams", "Scarves", "Shipped", 58]
    ]
  }
};

const colors = ["#0f8f8c", "#4e5ba6", "#f97066", "#fdb022", "#12b76a"];
const seasonFilter = document.querySelector("#seasonFilter");
const refreshButton = document.querySelector("#refreshButton");
const revenueMetric = document.querySelector("#revenueMetric");
const ordersMetric = document.querySelector("#ordersMetric");
const itemsMetric = document.querySelector("#itemsMetric");
const averageMetric = document.querySelector("#averageMetric");
const revenueTrend = document.querySelector("#revenueTrend");
const ordersTrend = document.querySelector("#ordersTrend");
const itemsTrend = document.querySelector("#itemsTrend");
const averageTrend = document.querySelector("#averageTrend");
const bestMonthBadge = document.querySelector("#bestMonthBadge");
const categoryList = document.querySelector("#categoryList");
const regionList = document.querySelector("#regionList");
const ordersTable = document.querySelector("#ordersTable");
const revenueChart = document.querySelector("#revenueChart");
const chartContext = revenueChart.getContext("2d");

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function renderDashboard() {
  const data = dashboardData[seasonFilter.value];
  renderMetrics(data);
  renderRevenueChart(data.monthly);
  renderCategories(data.categories);
  renderRegions(data.regions);
  renderOrders(data.orders);
}

function renderMetrics(data) {
  const { metrics } = data;
  revenueMetric.textContent = formatCurrency(metrics.revenue);
  ordersMetric.textContent = formatNumber(metrics.orders);
  itemsMetric.textContent = formatNumber(metrics.items);
  averageMetric.textContent = formatCurrency(metrics.average);
  revenueTrend.textContent = `${metrics.trends[0]} vs last season`;
  ordersTrend.textContent = `${metrics.trends[1]} vs last season`;
  itemsTrend.textContent = `${metrics.trends[2]} vs last season`;
  averageTrend.textContent = `${metrics.trends[3]} vs last season`;
}

function renderRevenueChart(monthlyData) {
  const bestMonth = monthlyData.reduce((best, current) => current[1] > best[1] ? current : best);
  bestMonthBadge.textContent = `Best: ${bestMonth[0]}`;

  const ratio = window.devicePixelRatio || 1;
  const width = revenueChart.clientWidth;
  const height = 260;
  revenueChart.width = width * ratio;
  revenueChart.height = height * ratio;
  chartContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  chartContext.clearRect(0, 0, width, height);

  const padding = 34;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const maxValue = Math.max(...monthlyData.map(item => item[1]));
  const barWidth = chartWidth / monthlyData.length - 16;

  chartContext.strokeStyle = "#e4e7ec";
  chartContext.lineWidth = 1;

  for (let i = 0; i < 4; i += 1) {
    const y = padding + (chartHeight / 3) * i;
    chartContext.beginPath();
    chartContext.moveTo(padding, y);
    chartContext.lineTo(width - padding, y);
    chartContext.stroke();
  }

  monthlyData.forEach(([month, value], index) => {
    const x = padding + index * (chartWidth / monthlyData.length) + 8;
    const barHeight = (value / maxValue) * chartHeight;
    const y = height - padding - barHeight;

    chartContext.fillStyle = colors[index % colors.length];
    roundRect(chartContext, x, y, barWidth, barHeight, 8);
    chartContext.fill();

    chartContext.fillStyle = "#667085";
    chartContext.font = "700 12px Inter, sans-serif";
    chartContext.textAlign = "center";
    chartContext.fillText(month, x + barWidth / 2, height - 10);
  });
}

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height);
  context.lineTo(x, y + height);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
}

function renderCategories(categories) {
  const maxValue = Math.max(...categories.map(item => item[1]));
  categoryList.innerHTML = categories.map(([name, value], index) => {
    const width = Math.round((value / maxValue) * 100);
    return `
      <div class="metric-row">
        <div class="metric-top">
          <span>${name}</span>
          <span>${formatCurrency(value)}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width: ${width}%; background: ${colors[index % colors.length]}"></div>
        </div>
      </div>
    `;
  }).join("");
}

function renderRegions(regions) {
  regionList.innerHTML = regions.map(([name, percent, orders], index) => `
    <div class="region-card">
      <span class="region-dot" style="background: ${colors[index % colors.length]}"></span>
      <div>
        <strong>${name}</strong>
        <span>${orders}</span>
      </div>
      <strong>${percent}%</strong>
    </div>
  `).join("");
}

function renderOrders(orders) {
  ordersTable.innerHTML = orders.map(([id, customer, category, status, total]) => {
    const statusClass = status === "Pending" ? "pending" : "";
    return `
      <tr>
        <td>${id}</td>
        <td>${customer}</td>
        <td>${category}</td>
        <td><span class="status-pill ${statusClass}">${status}</span></td>
        <td>${formatCurrency(total)}</td>
      </tr>
    `;
  }).join("");
}

seasonFilter.addEventListener("change", renderDashboard);
refreshButton.addEventListener("click", renderDashboard);
window.addEventListener("resize", renderDashboard);

renderDashboard();
