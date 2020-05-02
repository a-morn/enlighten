import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import logger from 'morgan'
import { me, callbackGithub, loginTempUser, callbackGoogle } from './routes'

const app = express()

app.use(logger('dev') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser() as any) // eslint-disable-line @typescript-eslint/no-explicit-any
app.use(cors() as any) // eslint-disable-line @typescript-eslint/no-explicit-any
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/login-temp-user', loginTempUser)
app.post('/callback-github', callbackGithub)
app.post('/callback-google', callbackGoogle)
app.get('/me', me)

export default app
