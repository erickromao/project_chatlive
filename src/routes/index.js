const { Router } = require('express')
const router = Router()

const routerUser = require('./user.routes')
const routerServer = require('./server.routes')

router.use('/', routerUser )
router.use('/guilds', routerServer)

module.exports = router