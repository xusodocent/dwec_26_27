export class Repte {
  constructor(dades) {
    Object.assign(this, dades);
  }
  calcularPunts() {
    return this.punts;
  }
}
export class RepteCooperatiu extends Repte {
  calcularPunts(participants = 2) {
    return super.calcularPunts() + participants * 10;
  }
}
export const crearModel = (dades) =>
  dades.id === "r4" ? new RepteCooperatiu(dades) : new Repte(dades);
