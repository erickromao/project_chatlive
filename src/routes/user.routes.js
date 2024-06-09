const { Router } = require('express')
const authentication = require('../middlewares/authentication')
const routerUser = Router()

const UsersControllers = require('../controllers/UsersControllers')

const usersControllers = new UsersControllers()

routerUser.post('/auth/register', usersControllers.create)
routerUser.post('/auth/login', usersControllers.login)
routerUser.get('/user', authentication, usersControllers.show)

module.exports = routerUser