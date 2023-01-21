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
    `sudo journalctl -u otnode --since "1 hour ago" | grep "calculateProof" | wc -l`
  )

  console.log(publishes_last_hour)

  if (publishes_last_hour.stdout.replace(/[\n\t\r]/g) == '0') {
    msg = `Cosmi's node has published ${publishes_last_hour.stdout.replace(
      /[\n\t\r]/g,
      ''
    )} asset mints in the last hour.`

    console.log(msg)
    await bot.sendMessage(chatId, msg)
  }

  await process.exit()
}

pubCount()
