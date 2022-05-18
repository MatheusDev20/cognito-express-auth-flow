import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator'
import { CognitoService } from '../services/cognito.service'

export class AuthController {

  public path = '/auth'
  public router = express.Router()

  constructor() {
    this.initRoutes()
  }

  private initRoutes() {
    this.router.post('/signup', this.validateBody('signUp'), this.signUp)
    this.router.post('/signin', this.validateBody('signIn'), this.signIn)
    this.router.post('/verify', this.validateBody('verify'), this.verify)
  }

  signUp(req: Request, res: Response) {
    const result = validationResult(req)
    console.log(req.body)
    if (!result.isEmpty()) {
      return res.status(422).json({
        errors: result.array()
      })
    }

    const { username, password } = req.body

    delete req.body.username
    delete req.body.password
    const userAttr: object[] = []

    Object.keys(req.body).map(key => {
      userAttr.push({ "Name": key, "Value": req.body[key] })
    })

    const cognitoService = new CognitoService()

    cognitoService.signUpUser(username, password, userAttr)
      .then(success => {
        if (success) {
          res.status(200).json({ "message": "Cognito User Created" })
        }
        else {
          res.status(500).end()
        }
      })
    res.status(200).json({
      "message": "Valid"
    })
  }

  signIn(req: Request, res: Response) {
    const result = validationResult(req)

    if (!result.isEmpty()) {
      return res.status(422).json({
        errors: result.array()
      })
    }
    const cognito = new CognitoService()
    const { username, password } = req.body
    cognito.signInUser(username, password)
      .then(success => {
        if (success) {
          res.status(200).json({ "message": "User logged in by Cognito" })
        }
        else {
          res.status(500).end()
        }
      })

  }

  verify(req: Request, res: Response) {
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(422).json({
        errors: result.array()
      })
    }

    const { username, code } = req.body

    const cognito = new CognitoService()
    cognito.verifyAccount(username, code)
      .then(succes => {
        if (succes) {
          return res.status(200).json({ "message": "User now Verified" })
        }
        else {
          res.status(500).end()
        }
      })

  }

  private validateBody(type: string): any {
    switch (type) {
      case 'signUp':
        return [
          body('username').notEmpty().isLength({ min: 6 }),
          body('email').notEmpty().normalizeEmail(),
          body('password').isString().isLength({ min: 8 }),
          body('birthdate').exists().isISO8601(),
          body('name').notEmpty().isString(),
          body('family_name').notEmpty().isString()
        ]

      case 'signIn':

        return [
          body('username').notEmpty().isLength({ min: 6 }),
          body('password').isString().isLength({ min: 8 }),
        ]

      case 'verify':
        return [
          body('username').notEmpty().isLength({ min: 6 }),
          body('code').isString().isLength({ min: 6, max: 6 })
        ]
    }
  }
}