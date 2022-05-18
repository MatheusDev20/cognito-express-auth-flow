import express from 'express';
import { Application } from 'express';

const app = express();

export class App {

  public app: Application
  public port: number;

  constructor(appInit: { port: number, middlewares: any, controllers: any }) {
    this.app = express();
    this.port = appInit.port
    // Middleawares should be initialize before routes xD
    this.middlewares(appInit.middlewares)
    this.routes(appInit.controllers)
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App has started on port ${this.port}`)
    })
  }

  private routes(controllers: any) {
    this.app.use(express.json())
    controllers.forEach(c => {
      this.app.use(c.path, c.router)
    })
  }

  private middlewares(middlewares: any) {
    middlewares.forEach(m => {
      console.log(m)
      this.app.use(m)
    })
  }
}
