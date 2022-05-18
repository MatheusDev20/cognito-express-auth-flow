import AWS from 'aws-sdk'
import crypto, { HashOptions } from 'crypto'

export class CognitoService {
  private config = {
    region: 'us-east-1',

  }

  private secretHash = process.env.SECRET_HASH
  private clientId = process.env.CLIENT_ID
  private cognitoIdentity

  constructor() {
    this.cognitoIdentity = new AWS.CognitoIdentityServiceProvider(this.config)
  }

  public async signUpUser(username: string, password: string, userAttr: Array<any>): Promise<boolean> {

    const params = {
      ClientId: this.clientId,
      Password: password,
      Username: username,
      // SecretHash: this.generateHash(username),
      UserAttributes: userAttr
    }
    try {
      const data = await this.cognitoIdentity.signUp(params).promise()
      console.log(data)
      return true
    }
    catch (error) {
      console.log(error)
      return false
    }
  }

  public async verifyAccount(username: string, code: string): Promise<boolean> {
    const params = {
      ClientId: this.clientId,
      ConfirmationCode: code,
      Username: username
    }

    try {
      const data = await this.cognitoIdentity.confirmSignUp(params).promise()
      console.log(data)
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  public async signInUser(username: string, password: string): Promise<boolean> {
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.clientId,
      AuthParameters: {
        'USERNAME': username,
        'PASSWORD': password
      }
    }
    try {
      const data = await this.cognitoIdentity.initiateAuth(params).promise()
      console.log(data)
      return true
    } catch (error) {
      console.log(error)
      return false
    }
  }

  private generateHash(username: string): string {
    return crypto.createHash('SHA256', this.secretHash)
      .update(username + this.clientId)
      .digest('base64')
  }
}