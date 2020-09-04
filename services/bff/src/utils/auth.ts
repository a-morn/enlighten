import { AuthenticationError } from 'apollo-server-express'
import { isUserToken, UserToken } from 'enlighten-common-types'
import jwt from 'jsonwebtoken'

export const getJWTPayloadFromAuthorizationHeader = (
  authHeader: string,
): UserToken => {
  const token = authHeader.split('Bearer ')[1]

  const decoded = jwt.verify(token, process.env.SECRET || 's3cr37')

  if (typeof decoded === 'string' || !isUserToken(decoded)) {
    throw new AuthenticationError('Incorrect token')
  }
  return decoded
}
