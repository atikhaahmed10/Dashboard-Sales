const censusData = {
  north: {
    name: "North",
    density: 420,
    urban: 68,
    medianAge: 32,
    population: { 2000: 18.4, 2005: 20.1, 2010: 22.6, 2015: 25.3, 2020: 28.1, 2025: 31.4 },
    ages: { "0-14": 22, "15-24": 16, "25-44": 31, "45-64": 21, "65+": 10 }
  },
  south: {
    name: "South",
    density: 365,
    urban: 59,
    medianAge: 29,
    population: { 2000: 15.2, 2005: 17.5, 2010: 20.9, 2015: 24.7, 2020: 29.2, 2025: 34.6 },
    ages: { "0-14": 26, "15-24": 18, "25-44": 30, "45-64": 18, "65+": 8 }
  },
  east: {
    name: "East",
    density: 510,
    urban: 72,
    medianAge: 35,
    population: { 2000: 20.6, 2005: 21.8, 2010: 23.1, 2015: 24.4, 2020: 26.2, 2025: 28.0 },
    ages: { "0-14": 19, "15-24": 14, "25-44": 30, "45-64": 24, "65+": 13 }
  },
  west: {
    name: "West",
    density: 285,
    urban: 64,
    medianAge: 31,
    population: { 2000: 12.8, 2005: 14.3, 2010: 16.4, 2015: 19.5, 2020: 22.7, 2025: 26.9 },
    ages: { "0-14": 24, "15-24": 17, "25-44": 32, "45-64": 19, "65+": 8 }
  },
  central: {
    name: "Central",
    density: 338,
    urban: 55,
    medianAge: 30,
    population: { 2000: 14.1, 2005: 15.6, 2010: 17.8, 2015: 20.1, 2020: 22.4, 2025: 25.2 },
    ages: { "0-14": 25, "15-24": 17, "25-44": 29, "45-64": 20, "65+": 9 }
  }
};

const colors = ["#087f7b", "#4267ac", "#f26d5b", "#f2aa4c", "#7a5af8"];
const years = [2000, 2005, 2010, 2015, 2020, 2025];
const regionSelect = document.querySelector("#regionSelect");
const yearSlider = document.querySelector("#yearSlider");
const yearValue = document.querySelector("#yearValue");
const animateButton = document.querySelector("#animateButton");
const populationMetric = document.querySelector("#populationMetric");
const growthMetric = document.querySelector("#growthMetric");
const urbanMetric = document.querySelector("#urbanMetric");
const ageMetric = document.querySelector("#ageMetric");
const densityMetric = document.querySelector("#densityMetric");
const ageList = document.querySelector("#ageList");
const regionMap = document.querySelector("#regionMap");
const detailList = document.querySelector("#detailList");
const trendChart = document.querySelector("#trendChart");
const context = trendChart.getContext("2d");

let animationTimer = null;

function selectedYear() {
  return Number(yearSlider.value);
}

function selectedRegions() {
  const selected = regionSelect.value;
  if (selected === "all") {
    return Object.values(censusData);
  }
  return [censusData[selected]];
}

function formatPopulation(value) {
  return `${value.toFixed(1)}M`;
}

function weightedAverage(items, key) {
  const year = selectedYear();
  const totalPopulation = items.reduce((sum, item) => sum + item.population[year], 0);
  return items.reduce((sum, item) => sum + item[key] * item.population[year], 0) / totalPopulation;
}

function combinedPopulation(year) {
  return selectedRegions().reduce((sum, item) => sum + item.population[year], 0);
}

function combinedAges() {
  const items = selectedRegions();
  const year = selectedYear();
  const totalPopulation = items.reduce((sum, item) => sum + item.population[year], 0);
  const groups = Object.keys(items[0].ages);

  return groups.map(group => {
    const value = items.reduce((sum, item) => {
      return sum + item.ages[group] * item.population[year];
    }, 0) / totalPopulation;
    return [group, Math.round(value)];
  });
}

function renderDashboard() {
  yearValue.textContent = selectedYear();
  renderMetrics();
  renderTrendChart();
  renderAgeList();
  renderRegionMap();
  renderDetails();
}

function renderMetrics() {
  const items = selectedRegions();
  const year = selectedYear();
  const totalPopulation = combinedPopulation(year);
  const basePopulation = combinedPopulation(2000);
  const growth = ((totalPopulation - basePopulation) / basePopulation) * 100;

  populationMetric.textContent = formatPopulation(totalPopulation);
  growthMetric.textContent = `${growth.toFixed(1)}% growth since 2000`;
  urbanMetric.textContent = `${Math.round(weightedAverage(items, "urban"))}%`;
  ageMetric.textContent = Math.round(weightedAverage(items, "medianAge"));
  densityMetric.textContent = Math.round(weightedAverage(items, "density"));
}

function renderTrendChart() {
  const ratio = window.devicePixelRatio || 1;
  const width = trendChart.clientWidth;
  const height = 280;
  trendChart.width = width * ratio;
  trendChart.height = height * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);

  const values = years.map(year => combinedPopulation(year));
  const max = Math.max(...values) * 1.12;
  const padding = 42;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  context.strokeStyle = "#d9e4e0";
  context.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    const y = padding + (chartHeight / 3) * i;
    context.beginPath();
    context.moveTo(padding, y);
    context.lineTo(width - padding, y);
    context.stroke();
  }

  const points = values.map((value, index) => {
    const x = padding + (chartWidth / (years.length - 1)) * index;
    const y = height - padding - (value / max) * chartHeight;
    return [x, y, value];
  });

  context.strokeStyle = "#087f7b";
  context.lineWidth = 4;
  context.beginPath();
  points.forEach(([x, y], index) => {
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });
  context.stroke();

  points.forEach(([x, y, value], index) => {
    const isActive = years[index] === selectedYear();
    context.fillStyle = isActive ? "#f26d5b" : "#ffffff";
    context.strokeStyle = "#087f7b";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(x, y, isActive ? 8 : 6, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.fillStyle = "#667085";
    context.font = "700 12px Inter, sans-serif";
    context.textAlign = "center";
    context.fillText(years[index], x, height - 12);

    if (isActive) {
      context.fillStyle = "#172026";
      context.fillText(formatPopulation(value), x, y - 16);
    }
  });
}

function renderAgeList() {
  ageList.innerHTML = combinedAges().map(([group, value], index) => `
    <div class="metric-row">
      <div class="metric-top">
        <span>${group}</span>
        <span>${value}%</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${value}%; background: ${colors[index]}"></div>
      </div>
    </div>
  `).join("");
}

function renderRegionMap() {
  const year = selectedYear();
  const maxPopulation = Math.max(...Object.values(censusData).map(region => region.population[year]));

  regionMap.innerHTML = Object.entries(censusData).map(([key, region], index) => {
    const size = 34 + (region.population[year] / maxPopulation) * 54;
    const active = regionSelect.value === key ? "active" : "";
    return `
      <button class="region-card ${active}" type="button" data-region="${key}">
        <div class="bubble" style="--size: ${size}px; --color: ${colors[index]}"></div>
        <strong>${region.name}</strong>
        <span>${formatPopulation(region.population[year])} population</span>
      </button>
    `;
  }).join("");

  document.querySelectorAll(".region-card").forEach(card => {
    card.addEventListener("click", () => {
      regionSelect.value = card.dataset.region;
      renderDashboard();
    });
  });
}

function renderDetails() {
  const items = selectedRegions();
  const year = selectedYear();
  detailList.innerHTML = items.map(region => `
    <div class="detail-card">
      <span>${region.name} population</span>
      <strong>${formatPopulation(region.population[year])}</strong>
      <span>Urban share</span>
      <strong>${region.urban}%</strong>
      <span>Median age</span>
      <strong>${region.medianAge}</strong>
      <span>Density</span>
      <strong>${region.density}/sq km</strong>
    </div>
  `).join("");
}

function animateYears() {
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = null;
    animateButton.textContent = "Animate years";
    return;
  }

  animateButton.textContent = "Stop animation";
  let index = years.indexOf(selectedYear());
  animationTimer = setInterval(() => {
    index = (index + 1) % years.length;
    yearSlider.value = years[index];
    renderDashboard();
  }, 900);
}

regionSelect.addEventListener("change", renderDashboard);
yearSlider.addEventListener("input", renderDashboard);
animateButton.addEventListener("click", animateYears);
window.addEventListener("resize", renderDashboard);

renderDashboard();
