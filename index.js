const telegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const APIs = require('./API.js');
const telegramAPI = APIs.telegramAPI;
const yandexAPI = APIs.yandexAPI;

const bot = new telegramBot(telegramAPI, {polling: true});

bot.on('voice', (msg) => {
    //преобразовыввает файл в поток
    const chatId = msg.chat.id;
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
            console.log(response.data);
            bot.sendMessage(chatId, `Вы сказали: ${response.data.result}`);
        }).catch(err => {
            console.log('Ошибка распознавания: ', err);
        });
    });
    //  // ссылка на файл
    //   bot.getFileLink(msg.voice.file_id).then((url) => {
    //       console.log(url);
    //   });
});