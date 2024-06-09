const { ErrorsClientAndServer } = require('./utils/AppError')
const {setupWebSocket} = require('./websocket/setupWebSocket')
const express = require('express')
const http = require('http')

const router = require('./routes')
const createDB = require('./database')

require('dotenv').config()

const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT ?? 3000

createDB()

app.use(express.json())
app.use(router)

setupWebSocket(server)

app.use(ErrorsClientAndServer)

server.listen(PORT, ()=> console.log(`ServerON [${PORT}]`))

