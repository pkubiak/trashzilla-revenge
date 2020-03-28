from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit
import uuid, glob, json, os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins='*')


MAPS = {}
GAMES = {}

def render_games_list():
    return [   
        {
            'id': key,
            'in_progress': value['in_progress'],
            'map': value['map']['name'],
            'players': len(value['players'])
        } for key, value in GAMES.items()
    ]

@socketio.on('list_maps')
def on_list_maps():
    return [
        dict(id=key, name=value['name']) for key, value in MAPS.items()
    ]


@socketio.on('list_games')
def on_list_games():
    return render_games_list()


@socketio.on('create_game')
def on_create_game(data):
    assert data['map'] in MAPS
    gid = str(uuid.uuid4())
    GAMES[gid] = dict(in_progress=False, map=MAPS[data['map']], players={})

    return gid, render_games_list()


@socketio.on('join_game')
def on_join_game(data):
    gid = data['gid']
    if 'pid' not in data:
        print('GameId', gid)
        if (gid in GAMES) and (len(GAMES[gid]['players']) < 2):
            pid = str(uuid.uuid4())
            print('PlayerId', pid)

            GAMES[gid]['players'][pid] = {
                "role": 'Trashzilla' if len(GAMES[gid]['players']) == 1 else 'GarbageCollectors'
            }
            
            return {
                'code': 'OK',
                'pid': pid,
            }
        else:
            return {
                'code': 'ERROR'
            }
    else:
        pid = data['pid']
        return {
            'code': 'OK',
            'role': GAMES[gid]['players'][pid]['role'],
            'map': GAMES[gid]['map']
        }


def load_maps():
    for path in glob.glob('./maps/*.json'):
        print('Loading map:', path)

        with open(path) as data:
            mid = os.path.basename(path).replace('.json', '')

            mapa = json.loads(data.read())
            MAPS[mid] = mapa


if __name__ == '__main__':
    load_maps()
    socketio.run(app)