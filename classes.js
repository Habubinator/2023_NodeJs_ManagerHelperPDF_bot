let default_state = require('./questions.json');

class ChatState{

    // Класс для хранения состояний ответов чата
    constructor(chatId, states){
      this.currentState = -1;
      this.chatId = chatId;
      this.states = states
    }
  
  }
  
  class Chats{
  
    // Инициализация коллекции
    constructor(){
      this.collection = []
    }
  
    // Трекинг состояний чата, если будет несколько менеджеров
    checkIfChatStateTriggered(chatId){
      let res = false;
      this.collection.forEach(element =>{
        if(element != null && chatId == element.chatId){
          res = true;
        }
      })
      return res;
    }
  
    // Открыть состояния чата
    add(chatId){
      this.collection.push(new ChatState(chatId, default_state))
    }
  
    // Остановить состояния чата
    remove(chatId){
      for(let i = 0; i < this.collection.length; i++){
        if(this.collection[i].chatId == chatId){
          this.collection.splice(i, 1)
        }
      }
    }
  
    //Перейти к следующему состоянию
    next(chatId){
      for(let i = 0; i < this.collection.length; i++){
        if(this.collection[i].chatId == chatId){
          this.collection[i].currentState++
        }
      }
    }
    
    //Проверить кончились ли вопросы
    isStatesEnded(chatId){
      for(let i = 0; i < this.collection.length; i++){
        if(this.collection[i].chatId == chatId){
          if(this.collection[i].currentState >= this.collection[i].states.replacements.length){
            return true;
          }
        }
      }
      return false;
    }
  
    get(chatId){
      for(let i = 0; i < this.collection.length ; i++){
        if(this.collection[i].chatId == chatId){
          return this.collection[i]
        }
      }
      return null;
    }
  }

  module.exports = {Chats, ChatState}