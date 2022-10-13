/** Database setup for BizTime. */

const { Client } = require("pg");

// const db = new Client({
//   user: "postgres",
//   host: "localhost",
//   database: "biztime",
//   password: "Blake2017",
//   port: 3000,
// });

const db = new Client({
  connectionString: "postgresql:///biztime",
});

db.connect(function (err) {
  if (err) throw err;
  console.log("Connected to Database");
});

module.exports = db;
