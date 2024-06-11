const WebSocket = require('ws')
const knex = require('../database/knex')
const {URL} = require('url')
const {AppError} = require('../utils/AppError')

async function Messages(request, response){
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

    const [checkServerJoin] = await knex('users')
    .where({id:user.id}).where({joinServer:guildid})

    await knex('users')
    .where({id:user.id})
    .update({
        joinServer: guildid,
        joinRoom: channelid
    }).increment('qtd_servers', 1)

    return response.json({
        message: `Sala (${checkRoom.nome}) do servidor (${checkRoom.servidor}) adicionada com sucesso.`
    })
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

        if(user.joinServer != server.id){
            ws.send(`Usuário não está no servidor (${server.nome})`)
            ws.close()
            return
        }


        const [room] = await knex('rooms').where({id:roomid}).where({id_server:server.id})
        if(!room){
            ws.send(`Sala não encontra1da no servidor (${server.nome})`)
            ws.close()
            return
        }
        
        if(user.joinRoom != room.id){
            ws.send(`Usuário não está na sala (${room.nome})`)
            ws.close()
            return
        }


        const currentURL = `/${user.id}/guilds/${user.joinServer}/channels/${user.joinRoom}`
        
        if(pathname != currentURL){
            ws.send('Url incorreta.')
            ws.close()
            return
        }

        console.log(`Usuário (${user.nome}) conectado a sala (${room.nome}) do servidor (${room.servidor}).`)
        ws.send(`Você entrou na sala (${room.nome})`)
        wss.clients.forEach(client=>{
            if(client!== ws && client.readyState === WebSocket.OPEN){
                client.send(`Usuário ${user.nome} entrou na sala (${room.nome})`)
            }
        })

        ws.on('message', async message=>{
            const data = new Date()
            wss.clients.forEach(client=>{
                if(client!== ws && client.readyState === WebSocket.OPEN){
                    client.send(JSON.stringify({
                        usuário: user.nome,
                        message: `${message}`,
                        data: `${data.getDay()}/${data.getMonth()}/${data.getFullYear()}`,
                        horas: `${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`
                    } ))
                }
            })

            await knex('users').where({id:user.id}).increment('qtd_messages', 1)
            await knex('messages').insert({
                
            })
        })

        ws.on('close', async()=>{
            if(user.joinRoom){
                await knex('users')
                .where({id:user.id})
                .update({joinRoom: null, joinServer: null}).decrement('qtd_servers', 1)
                console.log(`Usuário (${user.nome}) saiu da sala (${room.nome}).`)
                ws.close()
                return
            }else{
                ws.close()
                return
            }
        })
    })

}



module.exports = {Messages, setupWebSocket}




