export class Logger {
  private _name: string;

  constructor(name: string) {
    this._name = name;
  }

  log(message: string) {
    console.log({ name: this._name, message });
  }
}
