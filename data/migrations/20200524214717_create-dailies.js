exports.up = async function(knex) {
  await knex.schema.createTable("users", tbl => {
    tbl.increments("id").primary();
    tbl.text("chat_id");
    tbl.text("name");
    tbl.timestamps(true, true);
  });

  await knex.schema.createTable("dailies", tbl => {
    tbl.increments("id").primary();
    tbl.integer("user_id").unsigned();

    tbl.text("name");
    tbl.integer("count");
    tbl.boolean("active");
    tbl.timestamps(true, true);

    tbl
      .foreign("user_id")
      .references("id")
      .inTable("users");
  });

  await knex.schema.createTable("log", tbl => {
    tbl.increments("id").primary();
    tbl.integer("user_id").unsigned();
    tbl.integer("dailies_id").unsigned();

    tbl.text("event_type");
    tbl.timestamps(true, true);

    tbl.foreign("user_id").references("users.id");
    tbl.foreign("dailies_id").references("dailies.id");
  });
};

exports.down = async function(knex) {
  await knex.dropTable("dailies");
  await knex.dropTable("users");
  await knex.dropTable("log");
};
