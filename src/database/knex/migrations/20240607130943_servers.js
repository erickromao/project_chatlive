
exports.up = knex => knex.schema.createTable('servers', (table)=>{
    table.increments('id')
    table.integer('id_user').references('id').inTable('users')
    table.text('nome')
    table.text('criador')
    table.integer('qtd_rooms').defaultTo(0)

    table.timestamp('created_at').default(knex.fn.now())
})
  
exports.down = knex => knex.schema.dropTable('servers')
