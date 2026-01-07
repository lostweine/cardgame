const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Вказуємо папку з файлами сайту
app.use(express.static('public'));

let games = {
    durak: { players: [], table: [], deck: [], trump: null },
    poker: { players: [], table: [], deck: [], pot: 0 }
};

// Функція створення колоди
function createDeck() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    let deck = [];
    suits.forEach(s => values.forEach((v, i) => {
        deck.push({ suit: s, value: v, rank: i + 2, id: `${v}_of_${s}` });
    }));
    return deck.sort(() => Math.random() - 0.5);
}

io.on('connection', (socket) => {
    console.log('Гравець підключився:', socket.id);

    socket.on('joinGame', (gameType) => {
        socket.join(gameType);
        if (!games[gameType].players.find(p => p.id === socket.id)) {
            games[gameType].players.push({ id: socket.id, hand: [] });
        }
        io.to(gameType).emit('updateState', games[gameType]);
    });

    socket.on('dealCards', (gameType) => {
        const game = games[gameType];
        game.deck = createDeck();
        game.table = [];
        const count = gameType === 'durak' ? 6 : 2;
        game.players.forEach(p => p.hand = game.deck.splice(0, count));
        if (gameType === 'durak') game.trump = game.deck.pop();
        io.to(gameType).emit('updateState', game);
    });

    socket.on('playCard', ({ gameType, cardId }) => {
        const game = games[gameType];
        const player = game.players.find(p => p.id === socket.id);
        const idx = player.hand.findIndex(c => c.id === cardId);
        if (idx !== -1) {
            const card = player.hand.splice(idx, 1)[0];
            game.table.push(card);
            io.to(gameType).emit('updateState', game);
        }
    });

    socket.on('disconnect', () => {
        console.log('Гравець відключився');
    });
});

// Замість фіксованого 3000 використовуємо змінну середовища
const PORT = process.env.PORT || 3000; 

server.listen(PORT, () => {
    console.log(`✅ СЕРВЕР ЗАПУЩЕНО В ОНЛАЙНІ НА ПОРТУ ${PORT}`);
});