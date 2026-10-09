import Security from "../Entities/Security.js";
import { MockData, RecommendationData } from "../Data/MockData.js";

class Midlayer {
  constructor() {
    this.securityData = [];
    this.recommendations = RecommendationData;
    this.availableBalance = 26000;
    this.selectedSecurity = null;
    this.listeners = {};
  }

  initialize() {
    for (const currSecurity of MockData) {
      const { name, price, quantity, sector, fnoAvailable } = currSecurity;
      this.securityData.push(
        new Security(name, price, quantity, sector, fnoAvailable)
      );
    }
  }

  on(event, callback) {
    this.listeners[event] = callback;
  }

  emit(event, data) {
    if (this.listeners[event]) this.listeners[event](data);
  }

  setAvailableBalance(amount = 26000) {
    this.availableBalance = Number(amount);
    this.emit("balance", this.availableBalance);
  }

  getRecommendedScript(name, sector) {
    return this.recommendations.find(
      item => item.name === name && item.sector === sector
    ) || this.recommendations.find(item => item.sector === sector)
      || this.recommendations[0];
  }

  validateSecurity(security) {
    const { name, price, quantity } = security;
    if (!name || price <= 0 || quantity <= 0) return false;

    return !this.securityData.some(
      item => item.name.toLowerCase() === name.toLowerCase()
    );
  }

  addSecurity(data) {
    const { name, price, quantity, sector, fnoAvailable } = data;
    const security = new Security(name, price, quantity, sector, fnoAvailable);

    if (!this.validateSecurity(security)) {
      throw new Error("Security already exists or entered values are invalid.");
    }

    const total = security.price * security.quantity;
    if (total > this.availableBalance) {
      throw new Error("Insufficient available balance.");
    }

    this.securityData.push(security);
    this.availableBalance -= total;
    this.emit("updated");
  }

  buy(name, quantity) {
    const security = this.securityData.find(item => item.name === name);
    if (!security) throw new Error("Security not found.");

    const qty = Number(quantity);
    const cost = security.livePrice * qty;
    if (cost > this.availableBalance) throw new Error("Insufficient balance.");

    security.quantity += qty;
    this.availableBalance -= cost;
    this.emit("updated");
  }

  sell(name, quantity) {
    const security = this.securityData.find(item => item.name === name);
    if (!security) throw new Error("Security not found.");

    const qty = Number(quantity);
    if (qty <= 0 || qty > security.quantity) throw new Error("Invalid quantity.");

    security.quantity -= qty;
    this.availableBalance += security.livePrice * qty;

    if (security.quantity === 0) {
      this.securityData = this.securityData.filter(item => item !== security);
    }
    this.emit("updated");
  }

  updateLivePrices() {
    this.securityData.forEach(security => security.updateLivePrice());
    this.emit("updated");
  }
}

export default Midlayer;
