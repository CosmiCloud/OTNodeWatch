require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN;
const bot = new TelegramBot(token, {polling: true});
const chatId  = process.env.CHATID;
const chatId2  = process.env.CHATID2;
const mysql = require('mysql');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'admin',
  database : 'operationaldb'
});
const db = require("better-sqlite3")(process.env.STATDB, {
    verbose: console.log,
  });

const team_nodes = [
                    "Qmaa96tesPwJCBjnhJgPBfpFg4HKVU2BLE2a04g2bg9hVT",
                    "QmaSu1NT7R5XYSqvYHwxPmaPBYZKMyBfEViXtBsJg9YWae",
                    "QmaVYtFZcraSnVMpzHhdxHXZHb6juXAQWZ5taShWHWQSUh",
                    "Qmb7eiBwhE6JqEWFXSJ7qxJdHZGEfBcfmSZUr8uAEbvcFg",
                    "QmcB3BHQhUzRmLNzo2rAZGjLPFHUTeGhFLji9AgeZfeQWs",
                    "Qmcms276Yrm3sf6jZx75X83W3CnWwadfYQ6YerefWAZuuH",
                    "QmbaHGQByXY8TvBwx1R2eQLt6XXpKeRAg4kEbRlyDjmVuM",
                    "QmbQeQsPytKnBVbRJsLosGZGPXcUaBMbgfeB6rKbiBDxGc",
                    "Qmbt6JkNzKhtxJz4CyBCisjbrz39qblziWX9kzez6dFkG9",
                    "QmbUXe8cNfvtUumZr1CZEibGmYHu5kBjhu5Xwm3PeGsjXY",
                    "Qme8odkEfiHHNp2Pa4qkUJiWsqsH8nVrrcohNNN4HhYpkJ",
                    "QmdxdGWjRqtE2wdoaoWQFMqrUPrsnFoLJ3QcCFDJ3fPtTt",
                    "Qmetd2wyq6yTqYcUG7DiUSiJmSPVVqtg6ZyeKa7Gastflk",
                    "QmNkmydWxHqj9voSjWkcVewefrDxEuwfyBkbGkwh4oZuWY",
                    "QmPMNPPsr4iyoTEPwKiWUfwHQEDSDL4Fbf457k8deglzxr"
                ]
  
async function recordNodes(){
    await connection.connect();

    node_operators = await db
    .prepare("SELECT peer_id, operator, current_ask, previous_ask, date_last_changed FROM node_operators LIMIT 1000")
    .all();

    console.log(node_operators)

    shardTable = [];
    await connection.query('SELECT * from operationaldb.shard', function (error, row) {
        if(error) {
            throw error;
          } else {
            setValue(row);
          }
      });

    async function setValue(value) {
        shardTable = value;
        tl_node_count = 0
        tl_node_ask = 0
        tl_node_change_count = 0

        for (i = 0; i < shardTable.length; ++i) {
            shard_operator = shardTable[i]

            let operator;
            let previous_ask;
            let node_op_index;

            tl_node_found = await team_nodes.includes(shard_operator.peer_id);
            if(tl_node_found){
                operator = "Trace labs"
                tl_node_count = tl_node_count + 1
                tl_node_ask = tl_node_ask + Number(shard_operator.ask)
            }
            
            ask_changed = "no"
            if(node_operators){
                node_op_index = await node_operators.findIndex(noop => noop.peer_id == shard_operator.peer_id);
            }

            exec_type = "INSERT"
            if(node_op_index != -1){
                exec_type = "REPLACE"
                if(node_operators[node_op_index].current_ask != shard_operator.ask){
                    previous_ask = node_operators[node_op_index].current_ask
                    ask_changed = "yes"
                }
            }

            timestamp = new Date();
            abs_timestamp = Math.abs(timestamp);

            await db
                .prepare(`${exec_type} INTO node_operators (peer_id, operator, current_ask, previous_ask, date_last_changed) VALUES (?, ?, ?, ?, ?)`)
                .run(shard_operator.peer_id,operator,shard_operator.ask,previous_ask,abs_timestamp);

            console.log(ask_changed)
            if(ask_changed == "yes" && tl_node_found){
                tl_node_change_count = tl_node_change_count + 1
            }      
        }  

        if(tl_node_change_count > 0){
            tl_node_avg = tl_node_ask / tl_node_count

            msg = `${tl_node_change_count} Trace Labs nodes have changed their asks. The avg. TL node ask is now ${tl_node_avg.toFixed(4)}`
            await tellBot(msg);
        }

        await connection.end();
        await process.exit();
    }

    async function tellBot(msg){
        bot.sendMessage(chatId, msg);
        if(chatId2){
            bot.sendMessage(chatId2, msg);
        }
    }
}

recordNodes();
