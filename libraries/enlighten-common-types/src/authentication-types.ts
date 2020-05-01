export type UserToken = {
  playerId: string
  isTempUser: boolean
  email?: string
}

export function isUserToken(x: unknown): x is UserToken {
  return typeof (x as UserToken).playerId === 'string'
}
