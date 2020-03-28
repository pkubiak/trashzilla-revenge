from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit
import uuid
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins='*')


GAMES = {}

def render_games_list():
    return [   
        {
            'id': key,
            'in_progress': value['in_progress'],
            'map': value['map'],
            'players': len(value['players'])
        } for key, value in GAMES.items()
    ]

@socketio.on('list_maps')
def on_list_maps():
    return [
        dict(id='katowice', name='Z widokiem na Katowice'),
        dict(id='sosnowiec', name='Śmierć w Sosnowcu'),
    ]

@socketio.on('list_games')
def on_list_games():
    return render_games_list()


@socketio.on('create_game')
def on_create_game(data):
    gid = str(uuid.uuid4())
    GAMES[gid] = dict(in_progress=False, map=data['map'], players=[])

    return gid, render_games_list()

@socketio.on('join_game')
def on_join_game(data):
    gid = data['gid']
    print('GameId', gid)
    if (gid in GAMES) and (len(GAMES[gid]['players']) < 2):
        pid = str(uuid.uuid4())
        print('PlayerId', pid)
        GAMES[gid]['players'].append(pid)
        
        return {
            'code': 'OK',
            'pid': pid
        }
    else:
        return {
            'code': 'ERROR'
        }

if __name__ == '__main__':
    socketio.run(app)