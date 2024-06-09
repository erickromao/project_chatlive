const WebSocket = require('ws')
const {AppError} = require('../utils/AppError')
const knex = require('../database/knex')

let wss

    function setupWebSocket(server){
        wss = new WebSocket.Server({server})
    }

class WebSocketClass{

    async message(request, response){
        const [user] = request.user.userInfo
        const {message} = request.body

        if(!wss){
            throw new AppError('Servidor WebSocket não conectado.')
        }

       wss.clients.forEach(client=>{
            if(client.readyState === WebSocket.OPEN && client !== request.ws){
                client.send(`${user.nome}: ${message}`)
            }})

            const currentMessage = `${user.nome}: ${message}`
            return response.json({
                currentMessage
        })
    }   

    async listen(request, response){
        const [user] = request.user.userInfo
        const {guildid, channelid} = request.params

        if(!wss){
            throw new AppError('Servidor WebSocket não conectado.')
        }

        if(!guildid || !channelid){
            throw new AppError('Ensira o parâmetros: (guildid, channelid)')
        }

        const [server] = await knex('servers').where({id:guildid})
        if(!server){
            throw new AppError('Servidor não encontrado')
        }

        const [room] = await knex('rooms').where({id:channelid})
        if(!room){
            throw new AppError('Sala não encontrada.')
        }       

        const client = user.id

        wss.on('')

    }

}   

 function joinRoom(channelid, request){

}




module.exports = {WebSocketClass, setupWebSocket}