
exports.up =  knex =>  knex.schema.createTable('users', (table)=>{
    table.increments('id')
    table.text('nome')
    table.text('email')
    table.text('password')
    
    table.text('joinServer')
    table.text('joinRoom')
    

    table.integer('qtd_servers').defaultTo(0)
    table.integer('qtd_messages').defaultTo(0)
    
    table.timestamp('created_at').default(knex.fn.now())

})

exports.down = knex => knex.schema.dropTable('users')
