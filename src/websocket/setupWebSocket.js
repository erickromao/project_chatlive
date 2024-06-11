const WebSocket = require('ws')
const knex = require('../database/knex')
const {URL} = require('url')
const {AppError} = require('../utils/AppError')

async function listenMessages(request, response){
    const {guildid, channelid} = request.params
    const [user] = request.user.userInfo

    const checkServer = await knex('servers').where({id:guildid}).first()
    if(!checkServer){
        throw new AppError('Servidor não encontrado')
    }

    const checkRoom = await knex('rooms').where({id:channelid}).first()
    if(!checkRoom){
        throw new AppError('Sala não encontrada.')
    }

    await knex('users')
    .where({id:user.id})
    .update({
        joinServer: guildid,
        joinRoom: channelid
    })

    return response.json({
        message: `Sala (${checkRoom.nome}) do servidor (${checkRoom.servidor}) adicionada com sucesso.`
    })
}
1
async function SendMessages(request, response){

}


async function setupWebSocket (server){   
    
    const wss = new WebSocket.Server({server})

    wss.on('connection', async (ws, request)=>{

        const {pathname} = new URL (request.url, `ws://${request.headers.host}`)
        const [,userid, ,serverid,,roomid] = pathname.split('/')

        
        const [user] = await knex('users').where({id:userid})
        if(!user){
            ws.send('Usuário não encontrado.')
            ws.close()
            return
        }
        const [server] = await knex('servers').where({id:serverid})
        if(!server){
            ws.send('Servidor não econtrado.')
            ws.close()
            return
        } 
        const [room] = await knex('rooms').where({id:roomid}).where({id_server:server.id})
        if(!room){
            ws.send(`Sala não encontrada no servidor (${server.nome})`)
            ws.close()
            return
        }

        const currentURL = `/${userid}/guilds/${serverid}/channels/${roomid}`
        
        if(pathname != currentURL){
            ws.send('Url incorreta.')
            ws.close()
            return
        }

        console.log(`Usuário (${user.nome}) conectado a sala (${room.nome}) do servidor (${room.servidor}).`)
        wss.clients.forEach(client=>{
            if(client!== ws && client.readyState === WebSocket.OPEN){
                client.send(`Usuário ${user.nome} entrou na sala (${room.nome})`)
            }
        })
        
        ws.on('message', message=>{
            
            wss.clients.forEach(client=>{
                if(client!== ws && client.readyState === WebSocket.OPEN){
                    const data = new Date()
                    client.send(JSON.stringify({
                        usuário: user.nome,
                        message: `${message}`,
                        data: `${data.getDay()}/${data.getMonth()}/${data.getFullYear()}`,
                        horas: `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`
                    } ))
                }
            })
        })
    })

}



module.exports = {listenMessages, setupWebSocket}




