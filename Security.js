export default class Security {
  constructor(name, price, quantity, sector, fnoAvailable = false) {
    this.name = name;
    this.price = Number(price);
    this.quantity = Number(quantity);
    this.sector = sector;
    this.fnoAvailable = Boolean(fnoAvailable);
    this.livePrice = this.price;
  }

  updateLivePrice() {
    const change = (Math.random() * 0.04) - 0.02;
    this.livePrice = +(this.livePrice * (1 + change)).toFixed(2);
    return this.livePrice;
  }

  get priceDirection() {
    return this.price < this.livePrice ? "up" : "down";
  }

  get value() {
    return +(this.livePrice * this.quantity).toFixed(2);
  }
}
