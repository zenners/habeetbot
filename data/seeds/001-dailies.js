exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex("users")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("users").insert([
        { id: 1, chat_id: "260968936", name: "zenners" }
      ]);
    });
  await knex("dailies")
    .del()
    .then(function() {
      // Inserts seed entries
      return knex("dailies").insert([
        { id: 1, user_id: 1, count: 0, active: true, name: "read book" },
        { id: 2, user_id: 1, count: 0, active: true, name: "workout" },
        { id: 3, user_id: 1, count: 0, active: true, name: "do actual work" }
      ]);
    });
};
