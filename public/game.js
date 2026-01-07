const socket = io();
let currentGame = null;

function selectGame(type) {
    currentGame = type;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game-ui').style.display = 'block';
    socket.emit('joinGame', type);
}

function deal() {
    socket.emit('dealCards', currentGame);
}

socket.on('updateState', (game) => {
    const handDiv = document.getElementById('my-hand');
    const tableDiv = document.getElementById('table-cards');
    const trumpDiv = document.getElementById('trump-layer');

    handDiv.innerHTML = '';
    tableDiv.innerHTML = '';
    trumpDiv.innerHTML = '';

    // Відображення моїх карт
    const me = game.players.find(p => p.id === socket.id);
    if (me && me.hand) {
        me.hand.forEach(card => {
            const el = document.createElement('div');
            el.className = 'card';
            // Твої картинки мають лежати в public/assets/cards/ і називатись так: 2_of_hearts.png
            el.style.backgroundImage = `url('assets/cards/${card.id}.png')`;
            el.onclick = () => socket.emit('playCard', { gameType: currentGame, cardId: card.id });
            handDiv.appendChild(el);
        });
    }

    // Карти на столі
    game.table.forEach(card => {
        const el = document.createElement('div');
        el.className = 'card';
        el.style.backgroundImage = `url('assets/cards/${card.id}.png')`;
        tableDiv.appendChild(el);
    });

    // Козир для дурня
    if (currentGame === 'durak' && game.trump) {
        trumpDiv.innerHTML = `<div class="card" style="position:absolute; right:50px; transform:rotate(90deg); background-image: url('assets/cards/${game.trump.id}.png')"></div>`;
    }
});