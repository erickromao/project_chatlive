exports.up = knex => knex.schema.createTable('rooms', (table)=>{
    table.increments('id')
    table.integer('id_server').references('id').inTable('servers')
    table.text('nome')
    table.text('servidor')
    table.text('criador')
    
    table.timestamp('created_at').default(knex.fn.now())
})

exports.down = knex => knex.schema.dropTable('rooms')
