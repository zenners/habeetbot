exports.up = async function (knex) {
  await knex.schema.alterTable("users", function (t) {
    t.unique("chat_id");
  });
};

exports.down = async function (knex) {
  await knex.schema.table("users", function (t) {
    t.dropColumn("chat_id");
  });
};
