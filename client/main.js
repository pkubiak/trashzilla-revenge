let SOCKET = null;

function on_init() {
    var socket = io('http://127.0.0.1:5000/');//, {transports: ['websocket']});
    socket.on('connect', function() {
        console.log('hello');
        socket.emit('list_maps', update_maps_list);
        socket.emit('list_games', update_games_list);
    });
    socket.on('list_games', update_games_list);
    SOCKET = socket;
}

function update_maps_list(maps) {
    console.log(maps);
    const select = document.querySelector('#maps_list');
    select.innerHTML = '';
    for(let map of maps) {
        let option = document.createElement('option');
        option.value = map.id;
        option.innerText = map.name;
        select.appendChild(option);
    }
}

function update_games_list(games) {
    console.log('games:', games);
    const table = document.querySelector('#games_list');
    table.innerHTML = `
    <tr>
        <th>ID</th>
        <th>In Progress (players)</th>
        <th>Map</th>
        <th>Join</th>
    </tr>`;
    for(let game of games) {
        let tr = document.createElement('tr');
        tr.id = game.id;

        let join = game.in_progress ? '' : `<a href="play.html#${game.id}" class="btn btn-sm btn-primary">Join</button>`;
        tr.innerHTML = `
            <td>${game.id}</td>
            <td>${game.in_progress} (${game.players} / 2)</td>
            <td>${game.map}</td>
            <td>${join}</td>
        `;
        table.appendChild(tr);
    }
}

function create_game() {
    SOCKET.emit('create_game', {map: document.querySelector('#maps_list').value}, function(gid, games) {
        console.log('x');
        update_games_list(games);
        console.log('New game: ', gid);
        window.location.hash = gid;
    });
}