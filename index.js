const TelegramBot = require('node-telegram-bot-api');
process.env["NTBA_FIX_350"] = 1;

// replace the value below with the Telegram token you receive from @BotFather (token in config file)
const config = require('./config.json')
const token = process.env["bot_token"] || config.bot_token;

// Визов мережевих помилок при помилках телеграму
require("http")
require("https")

// Create a bot that uses 'polling' to fetch new updates
// { command: '/replace_file', description: 'Поменять шаблон'},

const bot = new TelegramBot(token, {polling: true});
bot.setMyCommands([{ command: '/start', description: 'Запустить бота' },
                   { command: '/new', description: 'Сформировать PDF' },
                   { command: '/result', description: 'Получить PDF файл вывода'}
])
// Вынес в отдельный файл вопросы и слой отвечающий за изменения PDF
// let default_state = require('./questions.json');
const {replaceText} = require("./pdfchanger.js")

// Вынес классы в отдельный файл, отвечают за хранение и доступ к данным
const {ChatState,Chats} = require("./classes.js")
let chats = new Chats();

async function changePDF(chatId, replacements){
  // default_state.replacements for debugging
  await replaceText('./input.pdf', "./result.pdf", replacements)
}

async function checkState(chatId, messageText){
  try {
    let tempChat = chats.get(chatId);
    if(tempChat.currentState != -1){
      tempChat.states.replacements[tempChat.currentState].replace = messageText
    }
    chats.next(chatId)
    if(chats.isStatesEnded(chatId)){
      changePDF(chatId, tempChat.states.replacements);
      bot.sendMessage(chatId, "Документ сгенерирован успешно. \n/result - Для получения файла")
    }else{
      bot.sendMessage(chatId, tempChat.states.questions[tempChat.currentState])
    }
  } catch (error) {
    console.log("Error: "+ error )
  }
}

async function stopState(chatId){
  if(chats.checkIfChatStateTriggered(chatId)){
    chats.remove(chatId)
  }
}

bot.on('message', (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = msg.text;
    switch(text){
      case '/start':
        stopState(chatId)
        return bot.sendMessage(chatId, 'Это бот для упрощения менеджмента и ускорения ввода данных для  PDF документов \n/new - Создать новый документ');
      case '/change':
        stopState(chatId)
        return bot.sendMessage(chatId, 'В разработке');
      case '/result':
        return bot.sendDocument(chatId, "./result.pdf",{caption: "Документ сгенерирован успешно!"}).catch(()=>{
          console.log("catched")
        })
      case '/new':
        stopState(chatId)
        chats.add(chatId)
        // Break відсутній, бо він відразу запускає ввід даних
      default:
        if(!chats.checkIfChatStateTriggered(chatId)){
          return bot.sendMessage(chatId, 'Вы не находитесь в процессе создания документа, воспользуйтесь /start для ознакомления с списком комманд');
        }
        checkState(chatId,text)
        break
  }
  } catch (error) {
    console.log("Error: " + error)
    bot.sendMessage(chatId, 'Возникла ошибка: \nВозможно во время выполнения запроса были неполадки на стороне телеграмма \n/result - чтобы повторно отослать запрос');
  }
});