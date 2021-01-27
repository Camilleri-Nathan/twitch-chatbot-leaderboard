import tmi from 'tmi.js';
import {convertHMS} from './tools';

const dotenv = require('dotenv');
dotenv.config();
const axios = require('axios');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

let timeTopPlayer = [];
let idTopPlayer = [];
let nameTopPlayer = [];

async function gameLeaderboard(url) {
    try {
        const response = await axios.get(url);
        const json = await response.data.data.runs;

        await parseThreeTopPlayer(json);
        await searchNamePlayerById();
    } catch (error) {
        console.log('error', error);
    }
}

function parseThreeTopPlayer(json) {
    idTopPlayer.length = 0;
    timeTopPlayer.length = 0;

    let indexArray = 0;

    while (json[indexArray] != null && indexArray <= 2) {
        timeTopPlayer.push(convertHMS(json[indexArray].run.times.primary_t));
        idTopPlayer.push(json[indexArray].run.players[0].id);
        indexArray++;
    }
}

async function searchNamePlayerById() {
    nameTopPlayer.length = 0;

    let indexArray = 0;

    while (idTopPlayer[indexArray] != null) {
        try {
            const response = await axios.get(
                'https://www.speedrun.com/api/v1/users/' +
                idTopPlayer[indexArray]);
            const json = await response.data.data.names.international;
            nameTopPlayer.push(json);
            indexArray++;
        } catch (error) {
            console.log('error', error);
        }
    }
}

const options = {
    options: {debug: true, messagesLogLevel: 'info'},
    connection: {
        reconnect: true,
        secure: true,
    },
    identity: {
        username: process.env.BOTNAME,
        password: process.env.OAUTHTOKEN,
    },
    channels: process.env.TWICTH_CHANNELS.split(','),
    //channels: [process.env.TWICTH_CHANNEL],
};
//console.log(options);

const client = new tmi.Client(options);
client.connect().catch(console.error);

client.on('message', async (channel, tags, message, self) => {

    if (self) return;
  /*  if (message.toLowerCase() === '!blast') {
        await gameLeaderboard(
            'https://www.speedrun.com/api/v1/leaderboards/4d70mn17/category/100');
        displayTwitch(channel, '100%', 'Blast Corps');
    }
    if (message.toLowerCase() === '!oot') {
        await gameLeaderboard(
            'https://www.speedrun.com/api/v1/leaderboards/oot/category/any');
        displayTwitch(channel, 'ANY%', 'OOT');
    }*/
    if (message.toLowerCase() === '!enclave.light') {
        await gameLeaderboard('https://www.speedrun.com/api/v1/leaderboards/46wle91r/category/jdrqe10k');
        displayTwitch(channel, 'Light_Side ANY%', 'Enclave');
    }
    if (message.toLowerCase() === '!enclave.dark') {
         await gameLeaderboard("https://www.speedrun.com/api/v1/leaderboards/46wle91r/category/jdz37px2");
         displayTwitch(channel, 'Dark_Side ANY%', 'Enclave');
     }
    if (message.toLowerCase() === '!toejam.fixed') {
        await gameLeaderboard("https://www.speedrun.com/api/v1/leaderboards/76rx72e6/category/7kj8rg3d");
        displayTwitch(channel, 'Fixed Any%', 'ToeJam');
    }
    if (message.toLowerCase() === '!lazyy') {
        client.say(channel, `Mon Profil speedrun.com https://www.speedrun.com/user/Lazyybird`);
    }
});

function displayTwitch(channel, category, game) {
    if (nameTopPlayer.length === 1)
        client.say(channel, `LeaderBoard ${category} ${game}: 1st -> ${nameTopPlayer[0]}: ${timeTopPlayer[0]}`);
    else if (nameTopPlayer.length === 2)
        client.say(channel, `LeaderBoard ${category} ${game}: 1st -> ${nameTopPlayer[0]}: ${timeTopPlayer[0]}, 2nd -> ${nameTopPlayer[1]}: ${timeTopPlayer[1]}`);
    else
        client.say(channel, `LeaderBoard ${category} ${game}: 1st -> ${nameTopPlayer[0]}: ${timeTopPlayer[0]}, 2nd -> ${nameTopPlayer[1]}: ${timeTopPlayer[1]}, 3rd -> ${nameTopPlayer[2]}: ${timeTopPlayer[2]}`);
}

app.listen(PORT, () => { console.log(`Our app is running on port ${PORT}`); });