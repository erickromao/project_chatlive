const {AppError} = require('../utils/AppError')
const knex = require('../database/knex')

class RoomsControllers {

    async create(request, response){
        const [user] = request.user.userInfo
        const {guildid} = request.params
        const {nome} = request.body

        if(!nome){
            throw new AppError('Preencha o campo (nome) para criar uma sala de chat.')
        }

        const [server] = await knex('servers').where({id:guildid})
        if(!server){
            throw new AppError('Servidor não encontrado.')
        }

        if(user.id !== server.id_user){
            throw new AppError('Apenas disponível ao criador do servidor.')
        }

        const [checkRoom] = await knex('rooms')
        .where({id_server:server.id})
        .where({nome})
        
        if(checkRoom){
            throw new AppError(`O nome de sala (${nome}) já existe neste servidor (${server.nome}).`)
        }

        const room = await knex('rooms').insert({
            nome, 
            id_server: guildid,
            criador: server.criador,
            servidor: server.nome
        }).returning('*')


        return response.json({
            message: `Sala (${nome}) com sucesso!`,
            sala: room
        })

    }   

    async read(request, response){
        const {guildid} = request.params

        const [checkServer] = await knex('servers').where({id:guildid})
        if(!checkServer){
            throw new AppError('Servidor não encontrado.')
        }

        const rooms = await knex('rooms').where({id_server:guildid})
        if(!rooms){
            throw new AppError('O servidor não possui salas criadas.')
        }

        return response.json({
            message:`Salas encontradas no servidor (${checkServer.nome})`,
            salas:rooms
        })


    }

}

module.exports = RoomsControllers