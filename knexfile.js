const path = require('path')

module.exports = {

  development: {
    client: 'pg',
    connection: {
      user:'postgres',
      host:'localhost',
      database:'chatlive',
      password: '123'
    },
    migrations:{
      directory: path.resolve(__dirname, "src", "database", "knex", "migrations")
    }
  }
  }

