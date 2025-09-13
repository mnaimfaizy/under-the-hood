/// <reference lib="dom" />

declare module "stats-js" {
  export default class Stats {
    dom: HTMLElement;
    showPanel(id: number): void;
    update(): void;
    constructor();
  }
}
