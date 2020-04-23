import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import logger from 'morgan'
import { v4 as uuidv4 } from 'uuid'
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
//const { limitBreakLoop } = require('./src/models/limit-break');

const app = express()

app.use(logger('dev') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser() as any) // eslint-disable-line @typescript-eslint/no-explicit-any
app.use(cors() as any) // eslint-disable-line @typescript-eslint/no-explicit-any

app.get('/login-temp-user', (req, res) => {
  const playerId = uuidv4()
  const token = jwt.sign(
    { playerId, isTempUser: true },
    process.env.SECRET || 's3cr37',
  )
  res.send({
    playerId,
    token,
  })
})

app.get('/login', (req, res) => {
  // authenticate user
  // req.body.username, req.body.password
})

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

export default app
