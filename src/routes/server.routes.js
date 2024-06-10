const { Router } = require('express')
const authentication = require('../middlewares/authentication')
const routerServer = Router()

const ServersControllers = require('../controllers/ServersControllers')
const {httpResponseWebSocket} = require('../websocket/setupWebSocket')
const RoomsControllers = require('../controllers/RoomsControllers')
const {setupWebSocket} = require('../websocket/setupWebSocket')


const serversControllers = new ServersControllers()
const HttpResponseWebSocket = new httpResponseWebSocket()
const roomsControllers = new RoomsControllers()

//servidor
routerServer.post('/', authentication, serversControllers.create)
routerServer.get('/', authentication, serversControllers.read)
routerServer.delete('/:guildid', authentication, serversControllers.delete)

//canal
routerServer.post('/:guildid/channels', authentication, roomsControllers.create)
routerServer.get('/:guildid', authentication, roomsControllers.read)


//mensagens
routerServer.get('/:guildid/channels/:channelid', authentication, HttpResponseWebSocket.listen)



module.exports = routerServer