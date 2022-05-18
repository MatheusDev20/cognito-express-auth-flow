import { App } from './app'
import { json } from 'express'

import { HomeController } from './controllers/home.controller';
import { AuthController } from './controllers/auth.controller';

const bodyParser = json()
const app = new App({
  port: 3000,
  controllers: [
    new HomeController,
    new AuthController
  ],
  middlewares: [
    bodyParser
  ]
})
app.listen()