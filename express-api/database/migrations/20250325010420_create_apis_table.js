exports.up = function(knex) {
    return knex.schema.createTable('apis', function(table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('endpoint').notNullable();
        table.string('url').notNullable();
        table.string('table_name').notNullable();
        table.text('columns').notNullable();
        table.string('token').notNullable();
        table.boolean('is_active').defaultTo(true);
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('apis');
};