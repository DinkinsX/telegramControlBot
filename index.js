const telegramBot = require('node-telegram-bot-api');
const axios = require('axios');
//создайте API.js в папке проекта
const API = require('./API.js');
const fs = require('fs');
const telegramAPI = API.telegramAPI;
const yandexAPI = API.yandexAPI;

const bot = new telegramBot(telegramAPI, {polling: true});

bot.on('voice', (msg) => {

    const chatId = msg.chat.id;
    //преобразовыввает запись в поток
    const stream = bot.getFileStream(msg.voice.file_id);
    let chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => {

        const axiosConfig = {
            method: 'POST',
            url: 'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize',
            headers: {
                Authorization: 'Api-Key ' + yandexAPI
            },
            data: Buffer.concat(chunks)
        };

        axios(axiosConfig).then(response => {

            const command = response.data.result;
            bot.sendMessage(chatId, `Вы сказали: ${command}`).then(() => {
                //Команды для бота
                switch (command) {

                    case 'Время':
                        let timeNow = writeTime();
                        bot.sendMessage(chatId, `Время: ${timeNow}`);
                        break;
                        
                    case 'Привет':
                        bot.sendMessage(chatId, `Здравствуй, ${msg.chat.username}`);
                        break;

                    case 'Рандом':
                        bot.sendMessage(chatId, `Выпало число: ${Math.floor(Math.random() * 100)}`);
                        break;

                    default:
                        bot.sendMessage(chatId, 'Ошибка распознования.');
                        break;

                }
            });

        }).catch(err => {
            console.log('Ошибка распознавания: ', err);
        });

    });
    //  // ссылка на файл
    //   bot.getFileLink(msg.voice.file_id).then((url) => {
    //       console.log(url);
    //   });

});

function writeTime(){

    const timeNow = new Date();
    fs.appendFile('timeWrite.txt', `\n${timeNow}`, (err) => {
        if(err) throw err;
        console.log('Дата была добавлена');
    });
    return timeNow;

}