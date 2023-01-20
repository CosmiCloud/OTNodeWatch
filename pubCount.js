require('dotenv').config()
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const TelegramBot = require('node-telegram-bot-api')
const token = process.env.TOKEN
const bot = new TelegramBot(token, { polling: true })
const chatId = process.env.CHATID
const chatId2 = process.env.CHATID2

async function pubCount () {
  publishes_last_hour = await exec(
    `sudo journalctl -u otnode --since "1 hour ago" | grep "has been successfully inserted!" | wc -l`
  )

  msg = `${publishes_last_hour} have been minted in the last hour.`

  console.log(msg)
  await bot.sendMessage(chatId, msg)
  await bot.sendMessage(chatId2, msg)

  //await bot.stopPolling();
  await connection.end()
  await process.exit()
}

pubCount()
