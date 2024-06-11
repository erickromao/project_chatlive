const WebSocket = require('ws')
const {AppError} = require('../utils/AppError')
const knex = require('../database/knex')

let wss
let users = {}

class httpResponseWebSocket{
    async listen(request, response){
        const {guildid, channelid} = request.params
           const[user] = request.user.userInfo
           
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
            
            response.json({message:`Sala ${checkchannelid.nome} acessada com sucesso.`})
            
           await setupWebSocket(user)
            
    }
}

    function createWebSocket(url){
        if(!wss){
            const server = require('../server')
            wss = new WebSocket.Server({server, path:url})
        }
    
    }
    
    async function setupWebSocket(user){
               
        const [sala] = await knex('rooms')
        .where({id:user.joinRoom})
        .select('nome', 'servidor')

        const url = `/guilds/${user.joinRoom}/channels/${user.joinServer}`
        createWebSocket(url)
        if(wss){
        wss.on('connection', ws =>{

            let userr = user.id
            
            if(!users[userr]){
                users[userr] = new Set()
            }
        
            users[userr].add(ws)
            
            ws.userr = userr

            console.log(`Usuário (${user.nome}) se conectou a (${sala.nome}) do servidor (${sala.servidor})`)

            ws.on('message', message=>{
                messages(ws, message, user)
            })

        
            ws.on('close', async ()=>{
                await knex('users').where({id:user.id}).update({joinRoom:null})
                console.log(`Usuário (${user.nome}) saiu da sala (${sala.nome})`)
            })
        })
    }
        console.log('Servidor Websocket ligado.')
    }

function messages (sender, message, user){
    Object.keys(users).forEach(userr =>{
        users[userr].forEach(client=>{
            if(client !== sender && client.readyState === WebSocket.OPEN){
                return client.send(`${user.nome}: ${message}`)
            }
        })
    })
}

module.exports = {httpResponseWebSocket}


