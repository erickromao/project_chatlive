const knex = require('../database/knex')
const {AppError} = require('../utils/AppError')
const validator = require('validator')

class ServersControllers{
    async create (request, response){
        const [user] = request.user.userInfo
        const {nome} = request.body

        if(!nome){
            throw new AppError('Preencha o campo: (nome)')
        }

        const [checkNome] = await knex('servers').where({nome}).where({id_user:user.id})
        if(checkNome){
            throw new AppError('Este nome de servidor já existe.')
        }

        const server = await knex('servers')
        .insert({
            nome,
            id_user: user.id,
            criador: user.nome
        }).returning('*')

        await knex('users').where({id:user.id})

        const serverCurrent = server.map(({id_user, ...rest })=> rest)

        return response.json({
            message: `O servidor ( ${nome} ), foi criado com sucesso! `,
            servidor: serverCurrent
        })

    }

    async read (request, response){
        
        const servers = await knex('servers')

        const serversCurrent = servers.map(({id, id_user, ...rest})=>rest)

        return response.json({
            message:`Servidores disponíveis:`,
            servers: serversCurrent
        })
    }

    async delete (request, response){
        const [user] = request.user.userInfo
        const {guildid} = request.params

        if(!validator.isNumeric(guildid)){
            throw new AppError('Preencha o campo (id) com o id do servidor.')
        }

        const [server] = await knex('servers').where({id:guildid})
        if(!server){
            throw new AppError('Servidor não encontrado.')
        }

        if(user.id != server.id_user){
            throw new AppError('Apenas disponível ao criador do servidor.')
        }

        const serverCurrent = [server].map(({id, id_user, ...rest})=> rest)

        await knex('servers').where({id:guildid}).delete()

        return response.json({
            message:`Servidor (${serverCurrent.nome}) deletado com sucesso!`,
            infos: serverCurrent
        })
    }   

}

module.exports = ServersControllers
