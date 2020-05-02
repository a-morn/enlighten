import type { Request, Response } from 'express'
import { getClient } from './data/client'
import { findOneUserByEmail, createUser } from './data/users'
import { getJWTPayloadFromAuthorizationHeader } from './utils'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import  {OAuth2Client} from 'google-auth-library';

if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
  throw new Error('OOGLE_OAUTH_CLIENT_ID missing')
}

const googleOauthClientId: string = process.env.GOOGLE_OAUTH_CLIENT_ID

const client = new OAuth2Client(googleOauthClientId);

async function verifyGoogle(idToken: string) {
  const ticket = await client.verifyIdToken({
      idToken,
      audience: googleOauthClientId,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('No payload')
  }
  const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
}

export const me = async (req: Request, res: Response) => {
    if (req.headers.authorization) {
      const client = await getClient()
      const { email } = getJWTPayloadFromAuthorizationHeader(
        req.headers.authorization,
      )
  
      if (email) {
        const { profilePictureUrl } = await findOneUserByEmail(client, email)
        res.send({ profilePictureUrl })
        return
      }
    }
    res.status(401)
  }

  const requestGithubUserAndToken = async (credentials: {
    client_id: string
    client_secret: string
    code: string
  }) => {
    const {
      data: { access_token: accessToken },
    } = await axios.post(
      'https://github.com/login/oauth/access_token',
      credentials,
      { headers: { accept: 'application/json' } },
    )
  
    const {
      data: { avatar_url: avatarUrl, email },
    } = await axios.get(`https://api.github.com/user`, {
      headers: { Authorization: `token ${accessToken}` },
    })
    return { accessToken, avatarUrl, email }
  }

  export const callbackGithub = async ({ body: { code } }: Request, res: Response) => {
    const client_id = process.env.GITHUB_OAUTH_CLIENT_ID
    const client_secret = process.env.GITHUB_OAUTH_SECRET
    if (!client_id || !client_secret) {
      throw new Error('Missing GitHub credentials')
    }
  
    let email
    let avatarUrl
    try {
      const user = await requestGithubUserAndToken({
        client_id,
        client_secret,
        code,
      })
      email = user.email
      avatarUrl = user.avatarUrl
    } catch (e) {
      console.log(e)
      return
    }
  
    const client = await getClient()
    const user = await findOneUserByEmail(client, email)
  
    const playerId = user
      ? user._id
      : await createUser(client, { email, profilePictureUrl: avatarUrl })
  
    const token = jwt.sign(
      { playerId, isTempUser: false, email },
      process.env.SECRET || 's3cr37',
    )
  
    res.send({ token })
  }

  export const loginTempUser = (_: unknown, res: Response) => {
    const playerId = uuidv4()
    const token = jwt.sign(
      { playerId, isTempUser: true },
      process.env.SECRET || 's3cr37',
    )
    res.send({
      playerId,
      token,
    })
  }

  export const callbackGoogle = async ({ body: { tokenId, email, profilePictureUrl } }: Request, res: Response) => {
    verifyGoogle(tokenId).catch(console.error);
  
    const client = await getClient()
    const user = await findOneUserByEmail(client, email)
  
    const playerId = user
      ? user._id
      : await createUser(client, { email, profilePictureUrl })
  
    const token = jwt.sign(
      { playerId, isTempUser: false, email },
      process.env.SECRET || 's3cr37',
    )
  
    res.send({ token })
  }