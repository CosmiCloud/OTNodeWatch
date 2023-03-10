require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const token = process.env.TOKEN
const bot = new TelegramBot(token, { polling: true })
const chatId = process.env.CHATID
const chatId2 = process.env.CHATID2
const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'operationaldb'
})

async function networkActivity () {
  await connection.connect()

  shardTable = []
  await connection.query(
    'SELECT * from operationaldb.shard',
    function (error, row) {
      if (error) {
        throw error
      } else {
        setValue(row)
      }
    }
  )

  async function setValue (value) {
    shardTable = value
    console.log(shardTable)
    peer_ids = []
    asks = []
    stakes = []
    last_seen = []
    total_nodes = shardTable.length

    for (i = 0; i < shardTable.length; ++i) {
      node_runner = shardTable[i]

      peer_ids.push(node_runner.peer_id)
      asks.push(node_runner.ask)
      stakes.push(node_runner.stake)
      last_seen.push(node_runner.last_seen)
    }

    total_ask = 0
    for (i = 0; i < asks.length; ++i) {
      ask = Number(asks[i])
      total_ask = total_ask + ask
    }

    total_stake = 0
    for (i = 0; i < stakes.length; ++i) {
      stake = Number(stakes[i])
      total_stake = total_stake + stake
    }

    ask_avg = total_ask / total_nodes
    stake_avg = total_stake / total_nodes

    msg = `Nodes: ${total_nodes}
Avg ask: ${ask_avg.toFixed(4)}
Avg stake: ${stake_avg.toFixed(2)}
Alliance ask: 0.21 - 0.24`

    console.log(msg)
    await bot.sendMessage(chatId, msg)
    //await bot.sendMessage(chatId2, msg)

    //await bot.stopPolling();
    await connection.end()
    await process.exit()
  }
}

networkActivity()
