const WebSocket = require('ws')
const {AppError} = require('../utils/AppError')
const knex = require('../database/knex')

let wss

class httpResponseWebSocket{
    async listen(request, response){
        const {guildid, channelid} = request.params
           const [user] = request.user.userInfo

            const checkguidid = await knex('servers').where({id:guildid}).first()
            if(!checkguidid){
                throw new AppError('Servidor não encontrado.')
            }
            const checkchannelid = await knex('rooms').where({id:channelid}).first()
            if(!checkchannelid){
                throw new AppError('Sala não encontrada.')
            }

            await knex('users').where({id: user.id}).update({
                joinRoom: channelid,
                joinServer: guildid
            })
            const server = require('../server')
            await setupWebSocket(server, user)
    }
}

    async function setupWebSocket(server, user){
    if(!wss){
        const [sala] = await knex('rooms').where({id:user.joinRoom}).select('nome', 'servidor')

        const url = `/guilds/${user.joinRoom}/channels/${user.joinServer}`
        
        wss = new WebSocket.Server({server, path:url})
        
        wss.on('connection', ws =>{
            console.log(`Usuário (${user.nome}) se conectou a (${sala.nome}) do servidor (${sala.servidor})`)

            ws.on('close', ()=>{
                console.log(`Usuário (${user.nome}) saiu da sala (${sala.nome})`)
            })
        })
        console.log('Servidor Websocket ligado.')
    }
}
module.exports = {httpResponseWebSocket}


