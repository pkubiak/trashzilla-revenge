let SOCKET = null;

function on_init() {
    var socket = io('http://127.0.0.1:5000/');//, {transports: ['websocket']});

    socket.on('connect', function() {
        let hash = window.location.hash.slice(1), gid, pid;

        if(hash.includes(',')) {
            [gid, pid] = hash.split(',');
            document.querySelector('#playerId').innerText = pid;

            console.log('gid: ', gid, 'pid: ', pid);
            socket.emit('join_game', {gid: gid, pid: pid}, (resp) => {
                console.log(resp);
                document.querySelector('#playerRole').innerText = resp.role;
            });
        } else {
            gid = hash;
            socket.emit('join_game', {gid: gid}, (resp) => {
                if(resp.code == 'OK') {
                    pid = resp.pid;
                    window.location.replace(`#${gid},${pid}`);
                    window.location.reload();
                    console.log('Replace');
                } else 
                    console.log('Error: ', resp);
            })

        }
        document.querySelector('#gameId').innerText = gid;
    });

    SOCKET = socket;
}