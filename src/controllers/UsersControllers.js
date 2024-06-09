const knex = require('../database/knex')
const { AppError } = require('../utils/AppError')
const validator = require('validator')
const { hash, compare } = require('bcryptjs')
const jwt = require('jsonwebtoken')

class UsersControllers {

   async create(request, response){
        const {nome, email, password} = request.body

        if(!nome || (!email, !password)){
            throw new AppError('Preencha todos os campos: (nome, email, password)')
        }

        if(!validator.isEmail(email)){
            throw new AppError('Preencha com um email válido.')
        }
        
        const [checkEmail] = await knex('users').where({email})
        if(checkEmail){
            throw new AppError('Email já existente.')
        }

        const passwordHashed = await hash(password, 8)

        const user = await knex('users').insert({
            nome,
            email,
            password: passwordHashed
        }).returning('*')

        const userCurrent = user.map(({id, password, ...rest})=>rest)

        return response.json({
            message: 'Usuário cadastrado com sucesso!',
            usuario: userCurrent
        })

    }

   async login(request, response) {
        const {email, password} = request.body
        const KEY = '123'

        if(!email || !password){
            throw new AppError('Preencha os campos: (email, password)')
        }

        if(!validator.isEmail(email)){
            throw new AppError('Preencha com um email válido.')
        }

        const [user] = await knex('users').where({email})
        if(!user){
            throw new AppError('Nenhum usuário encontrado.')
        }

        const checkPassword = await compare(password, user.password)
        if(!checkPassword){
            throw new AppError('Senha incorreta.')
        }

        const userCurrent = [user].map(({password, ...rest})=>rest)
        
        const token = jwt.sign({userInfo:userCurrent}, KEY, {expiresIn:"20m"})

        return response.json({
            message:"Login realizado com sucesso!",
            token
        })
    
   }

   async show(request, response){
        const user = request.user.userInfo  

        return response.json({
            message: `Dados do usuário:`,
            user
        })

   }

}

module.exports = UsersControllers