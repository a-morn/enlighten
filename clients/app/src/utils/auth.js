export const getPayloadFromJwt = jwt => {
  if (jwt && typeof jwt === 'string') {
    const base64Url = jwt.split('.')[1]
    const base64 = base64Url.replace('-', '+').replace('_', '/')
    return JSON.parse(atob(base64))
  } else {
    return null
  }
}
