const TelegramBot = require("node-telegram-bot-api");
process.env["NTBA_FIX_350"] = 1;
process.env["NTBA_FIX_319"] = 1;

// replace the value below with the Telegram token you receive from @BotFather (token in config file)
// const config = require("./config.json");
const token = process.env["bot_token"]; // || config.bot_token;

// Визов мережевих помилок при помилках телеграму
require("http");
require("https");

const fs = require("fs"); // Для перевірки чи існує файл
const ncp = require("ncp").ncp;

require("./keep_alive.js"); // Для UpTimeRobot

let userResultMap = new Map();

// Create a bot that uses 'polling' to fetch new updates
// { command: '/replace_file', description: 'Поменять шаблон'},

const bot = new TelegramBot(token, { polling: true });
bot.setMyCommands([
  { command: "/start", description: "Запустить бота" },
  { command: "/new", description: "Сформировать PDF" },
  { command: "/result", description: "Получить PDF файл вывода" },
]);
// Вынес в отдельный файл вопросы и слой отвечающий за изменения PDF
// let default_state = require('./questions.json');
const { replaceText } = require("./pdfchanger.js");

let defaultFolder = "./pdfs";

// Вынес классы в отдельный файл, отвечают за хранение и доступ к данным
const { ChatState, Chats } = require("./classes.js");
let chats = new Chats();

async function changePDF(chatId, replacements) {
  // default_state.replacements for debugging
  userResultMap.set(chatId, replacements[0].replace);
  await replaceText(
    "./input.pdf",
    defaultFolder + "/result" + chatId + ".pdf",
    replacements
  );
}

async function checkState(chatId, messageText) {
  try {
    let tempChat = chats.get(chatId);
    if (tempChat.currentState != -1) {
      tempChat.states.replacements[tempChat.currentState].replace = messageText;
    }
    chats.next(chatId);
    if (chats.isStatesEnded(chatId)) {
      let tempMessage = await bot.sendMessage(
        chatId,
        "Генерируем PDF документ..."
      );
      await changePDF(chatId, tempChat.states.replacements);
      ncp(
        defaultFolder + "/result" + chatId + ".pdf",
        defaultFolder + userResultMap.get(chatId) + ".pdf",
        (err) => {
          if (err) {
            console.error("Error:", err);
          }
        }
      );
      await bot.deleteMessage(chatId, tempMessage.message_id);
      bot.sendMessage(
        chatId,
        "Документ сгенерирован успешно. \n/result - Для получения файла",
        { reply_markup: { remove_keyboard: true } }
      );
    } else {
      let options;
      // Правка по вводу данных, чтобы была таблица
      if (tempChat.currentState == 1) {
        options = {
          reply_markup: {
            keyboard: [
              ["KAZAKHSTAN", "TURKMENISTAN"],
              ["UZBEKISTAN", "KYRGYZSTAN"],
              ["ARMENIA", "GEORGIA"],
              ["AZERBAIJAN", "BELARUS"],
              ["TAJIKISTAN"],
            ],
            resize_keyboard: true,
          },
        };
      }
      bot.sendMessage(
        chatId,
        tempChat.states.questions[tempChat.currentState],
        options
      );
    }
  } catch (error) {
    console.log("Error: " + error);
  }
}

async function stopState(chatId) {
  if (chats.checkIfChatStateTriggered(chatId)) {
    chats.remove(chatId);
  }
}

bot.on("message", (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = msg.text;
    switch (text) {
      case "/start":
        stopState(chatId);
        return bot.sendMessage(
          chatId,
          "Это бот для упрощения менеджмента и ускорения ввода данных для  PDF документов \n/new - Создать новый документ \n/result - Вывести документ после создания",
          { reply_markup: { remove_keyboard: true } }
        );
      case "/result":
        stopState(chatId);
        try {
          return bot
            .sendDocument(
              chatId,
              defaultFolder + "/" + userResultMap.get(chatId) + ".pdf",
              {
                caption: "Документ сгенерирован успешно!",
                reply_markup: { remove_keyboard: true },
              }
            )
            .catch((err) => {
              console.error("Error:", err);
            });
        } catch (error) {
          return bot.sendMessage(
            chatId,
            "Вы ещё не создавали документ /new для создания нового документа",
            { reply_markup: { remove_keyboard: true } }
          );
        }
        break;
      case "/new":
        stopState(chatId);
        chats.add(chatId);
      // Break відсутній, бо він відразу запускає ввід даних
      default:
        if (!chats.checkIfChatStateTriggered(chatId)) {
          return bot.sendMessage(
            chatId,
            "Вы не находитесь в процессе создания документа, воспользуйтесь /start для ознакомления с списком комманд",
            { reply_markup: { remove_keyboard: true } }
          );
        }
        checkState(chatId, text);
        break;
    }
  } catch (error) {
    console.log("Error: " + error);
    bot.sendMessage(
      chatId,
      "Возникла ошибка: \nВозможно во время выполнения запроса были неполадки на стороне телеграмма \n/result - чтобы повторно отослать запрос"
    );
  }
});
