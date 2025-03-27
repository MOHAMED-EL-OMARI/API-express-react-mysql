exports.up = function(knex) {
    return knex.schema.createTable('applications', function(table) {
        table.increments('id').primary();
        table.string('host').notNullable();
        table.string('user').notNullable();
        table.string('password').notNullable();
        table.string('database_name').notNullable();
        table.string('nom').notNullable();
        table.integer('port').notNullable().defaultTo(3306);
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('applications');
};