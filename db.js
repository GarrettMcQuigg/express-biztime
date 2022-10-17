/** Database setup for BizTime. */

const { Client } = require("pg");

const db = new Client({
  connectionString: "postgresql:///biztime",
});

db.connect();

module.exports = db;
