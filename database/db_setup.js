require("dotenv").config();
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.STATDB);

async function build_db() {
  try {
    await db.exec(
      "CREATE TABLE IF NOT EXISTS node_operators (peer_id VARCHAR PRIMARY KEY NOT NULL, operator VARCHAR, current_ask INT, previous_ask INT, date_last_changed DATE)"
    );

    await db.close();
  } catch (e) {
    console.log(e);
    console.log("Database - BLAHRG");
  }
}
build_db();
