
exports.up = knex => knex.schema.createTable("messages", (table)=>{
    table.increments('id')
    table.integer('id_room').references('id').inTable('rooms')
    table.text('nome_user')
    table.text('message')
    
    table.text('datatime')
    table.timestamp('created_at').default(knex.fn.now())

})

exports.down = knex => knex.schema.createTable("messages")
