const express = require('express');
const bodyParser = require('body-parser');
const { Telegraf } = require('telegraf');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory storage (replace with a database in production)
let digimons = {};

// Telegram Bot
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command('start', (ctx) => {
    ctx.reply('Welcome to DigiPet! Click the button below to open the game.', {
        reply_markup: {
            keyboard: [[{ text: 'Open Game', web_app: { url: 'https://your-game-url.com' } }]]
        }
    });
});

bot.launch();

// Game Logic
function createDigimon(userId) {
    return {
        name: "Digi",
        level: 1,
        hunger: 50,
        cleanliness: 50,
        strength: 10,
        userId
    };
}

function feedDigimon(digimon) {
    digimon.hunger = Math.max(0, digimon.hunger - 20);
    return digimon;
}

function cleanDigimon(digimon) {
    digimon.cleanliness = Math.min(100, digimon.cleanliness + 20);
    return digimon;
}

function trainDigimon(digimon) {
    digimon.strength += 5;
    digimon.hunger += 10;
    digimon.cleanliness -= 10;
    return digimon;
}

function battleDigimon(digimon) {
    const opponent = {
        strength: Math.floor(Math.random() * 20) + 1
    };

    if (digimon.strength > opponent.strength) {
        digimon.level += 1;
        digimon.strength += 2;
    }

    digimon.hunger += 15;
    digimon.cleanliness -= 15;
    return digimon;
}

// API Routes
app.get('/api/digimon', (req, res) => {
    const userId = req.query.userId;
    if (!digimons[userId]) {
        digimons[userId] = createDigimon(userId);
    }
    res.json(digimons[userId]);
});

app.post('/api/digimon/:action', (req, res) => {
    const userId = req.body.userId;
    const action = req.params.action;
    let digimon = digimons[userId];

    switch (action) {
        case 'feed':
            digimon = feedDigimon(digimon);
            break;
        case 'clean':
            digimon = cleanDigimon(digimon);
            break;
        case 'train':
            digimon = trainDigimon(digimon);
            break;
        case 'battle':
            digimon = battleDigimon(digimon);
            break;
    }

    digimons[userId] = digimon;
    res.json(digimon);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});