import Midlayer from "./Midlayer/Midlayer.js";
import { AddEventListener, FetchFormValues } from "./Utilities/util.js";

const app = new Midlayer();
app.initialize();

const $ = selector => document.querySelector(selector);

function formatMoney(value) {
  return `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function displaySecurities() {
  const tbody = $("#holdingsBody");

  const rows = app.securityData.map(security => {
    const arrow = security.priceDirection === "up" ? "▲" : "▼";
    const cls = security.priceDirection === "up" ? "price-up" : "price-down";

    return `
      <tr>
        <td><button class="btn small" data-detail="${security.name}">${security.name}</button></td>
        <td>${formatMoney(security.price)}
          <span class="${cls}">${formatMoney(security.livePrice)} ${arrow}</span>
        </td>
        <td>${security.quantity}</td>
        <td>${security.sector}</td>
        <td>${security.fnoAvailable ? "Yes" : "No"}</td>
        <td>
          <button class="btn small primary" data-buy="${security.name}">Buy</button>
          <button class="btn small reset" data-sell="${security.name}">Sell</button>
        </td>
      </tr>`;
  }).join("");

  tbody.innerHTML = rows || `<tr><td colspan="6">No holdings available.</td></tr>`;

  document.querySelectorAll("[data-detail]").forEach(button => {
    AddEventListener(button, "click", () => showDetails(button.dataset.detail));
  });

  document.querySelectorAll("[data-buy]").forEach(button => {
    AddEventListener(button, "click", () => transaction(button.dataset.buy, "buy"));
  });

  document.querySelectorAll("[data-sell]").forEach(button => {
    AddEventListener(button, "click", () => transaction(button.dataset.sell, "sell"));
  });

  $("#balance").textContent = formatMoney(app.availableBalance);
  $("#holdingCount").textContent = app.securityData.length;
}

function displayRecommendations() {
  $("#recommendations").innerHTML = app.recommendations.map(item => `
    <div class="recommendation">
      <span>${item.name}<br><small>${item.sector}</small></span>
      <button class="btn small secondary" data-recommend="${item.name}">View</button>
    </div>
  `).join("");

  document.querySelectorAll("[data-recommend]").forEach(button => {
    AddEventListener(button, "click", () => {
      const item = app.getRecommendedScript(button.dataset.recommend, "");
      $("#details").innerHTML =
        `<b>${item.name}</b><br>Sector: ${item.sector}<br>Suggested Price: ${formatMoney(item.price)}`;
    });
  });
}

function showDetails(name) {
  const security = app.securityData.find(item => item.name === name);
  if (!security) return;

  $("#details").innerHTML = `
    <b>${security.name}</b><br>
    Sector: ${security.sector}<br>
    Purchase Price: ${formatMoney(security.price)}<br>
    Live Price: ${formatMoney(security.livePrice)}<br>
    Quantity: ${security.quantity}<br>
    FNO Available: ${security.fnoAvailable ? "Yes" : "No"}<br>
    Current Value: ${formatMoney(security.value)}
  `;
}

function transaction(name, type) {
  const quantity = Number(prompt(`Enter quantity to ${type}:`, "1"));
  if (!Number.isFinite(quantity) || quantity <= 0) return;

  try {
    type === "buy" ? app.buy(name, quantity) : app.sell(name, quantity);
    $("#formMessage").textContent = `${type.toUpperCase()} successful.`;
    $("#formMessage").className = "message success";
  } catch (error) {
    $("#formMessage").textContent = error.message;
    $("#formMessage").className = "message error";
  }
}

AddEventListener($("#securityForm"), "submit", event => {
  event.preventDefault();
  const values = FetchFormValues(event.target);

  try {
    app.addSecurity({
      name: values.name.trim(),
      price: Number(values.price),
      quantity: Number(values.quantity),
      sector: values.sector,
      fnoAvailable: values.fnoAvailable
    });

    event.target.reset();
    $("#formMessage").textContent = "Security added successfully.";
    $("#formMessage").className = "message success";
  } catch (error) {
    $("#formMessage").textContent = error.message;
    $("#formMessage").className = "message error";
  }
});

app.on("updated", () => {
  displaySecurities();
  displayRecommendations();
});

app.on("balance", displaySecurities);

displaySecurities();
displayRecommendations();

setInterval(() => {
  app.updateLivePrices();
}, 5000);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js")
      .then(() => console.log("Service worker registered"))
      .catch(error => console.error("Service worker error:", error));
  });
}
