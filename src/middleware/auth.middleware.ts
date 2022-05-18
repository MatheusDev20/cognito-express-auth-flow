import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import jwkToPem from 'jwk-to-pem'
import fetch from 'node-fetch';

let pems = {};
class AuthMiddleware {
  private poolRegion: string = ''
  private userPoolId = process.env.USER_POOL_REGION
  constructor() {
    this.setUp()
  }


  verifyToken(req: Request, res: Response, next): void {
    const { token } = req.headers
    console.log(token)

    if (!token) {
      res.status(401).json({ "message": "Unauthorized" })
    }

    let decodeJwt: any = jwt.decode(token, { complete: true })
    if (!decodeJwt) {
      res.status(401).json({ "Message": "Unauthorized" })
    }

    let kid = decodeJwt.kid
    let pem = pems[kid]

  }

  private async setUp() {
    const URL = `https://cognito-idp.${this.poolRegion}.amazonaws.com/${this.userPoolId}/.well-know/jwks.json`

    try {
      const response = await fetch(URL);
      if (response.status == 200) {
        throw new Error()
      }

      const data: any = response.json()
      const keys = data.keys;
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const key_id = key.kid
        const modules = key.n
        const exponent = key.e
        const key_type = key.kty1
        const jwk = { kty: key_type, n: modules, e: exponent }
        const pem = jwkToPem(jwk)
        pems[key_id] = pem
      }

      console.log('Got all pems')
    } catch (error) {
      console.log(error)
    }
  }
}