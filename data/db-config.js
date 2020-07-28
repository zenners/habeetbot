const knex = require("knex");
const config = require("../knexfile.js");

const db = knex(config.development);

module.exports = {
  find,
  findById,
  insert,
  batchInsert,
  update,
  remove,
  increment,
  incrementTrans,
  createUser,
  currentUser,
};

function find() {
  return db("dailies").where("active", 1);
}

function findById(id) {
  return db("dailies").where({ id: Number(id) });
}

function currentUser(id) {
  return db("users")
    .where({ chat_id: Number(id) })
    .then((user) => user[0]);
}

function insert(post) {
  return db("dailies")
    .insert(post)
    .then((ids) => ({ id: ids[0] }));
}

function batchInsert(rows) {
  const chunkSize = 30;
  return db
    .batchInsert("dailies", rows, chunkSize)
    .returning("id")
    .then((ids) => ({ id: ids }))
    .catch((err) => console.log(err));
}

function update(id, post) {
  return db("dailies").where("id", Number(id)).update(post);
}

function remove(id) {
  return db("dailies").where("id", Number(id)).del();
}

function increment(id) {
  return db("dailies").where("id", Number(id)).increment("count", 1);
}

function incrementTrans(id, post) {
  db.transaction(async function (trx) {
    try {
      const row = await trx("dailies").where({ id: Number(id) });
      const data = {
        ...post,
        user_id: row[0].user_id,
        event_type: "daily increment",
      };
      await trx("dailies").where("id", Number(id)).increment("count", 1);
      await trx("log").insert(data);
    } catch (err) {
      console.log(err);
      throw err;
    }
  });
}

function createUser(data) {
  return db("users")
    .insert(data)
    .then((ids) => ({ id: ids[0] }))
    .catch((err) => console.log(err));
}
