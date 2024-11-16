/////////////// config ///////////////

// game server ip & port //
const serverIp = "127.0.0.1"
const serverPort = 7777

// user data
const userName = "PlayerName"
const userId = "PlayerId"

/////////////// code ///////////////

require('dotenv').config()

const express = require("express")
const app = express()

const http = require("http")

const server = http.createServer(app)

const socketio = require("socket.io")

const io = socketio(server, {
    path: "/socket.io/",
    serveClient: false,
    transports: ['websocket', 'polling']
})

// GET > /authenticate/service_status/
app.get("/authenticate/service_status/", (req, res) => {
    res.status(200).json({
        success: true,
        response: {
            is_online: true
        }
    })
})

app.get('/authenticate/player/settings', (req, res) => {
    console.log('/authenticate/player/settings')
    console.log(req.body)
    console.log(req.query)

    res.json({
        success: true,
        response: {
            
        }
    })
})

app.get('/stats/v1/get_player_stats/:id', (req, res) => {
    console.log('get_player_stats')
    console.log(req.body)
    console.log(req.query)

    res.json({
        success: true,
        response: {
            player_stat: {

            }
        }
    })
})

// POST > /authenticate/v2/authenticate/steam
app.post("/authenticate/v2/authenticate/steam", (req, res) => {
    res.status(200).json({
        success: true,
        response: {
            auth_token: JSON.stringify(
                {
                    data: {
                        public: {
                            local_id: userId,
                            player_name: userName
                        }
                    }
                }
            )
        }
    })
})

io.on('connection', (socket) => {
    console.log("connected!")

    socket.on('authenticate', (value) => {
        console.log("authenticate")

        socket.emit('user_authenticated', {
            highest_version_in_environment: 85812,
            event_timestamp: 123
        })
    })

    socket.on('find', (data) => {
        const serverAccessString = `:${serverIp}:${serverPort}`

        // taken from lawbreakers, probably doesn't match exactly with RH
        let matchmakingData = {
            success: true,
            is_custom_game: false,

            lobby: {
                chat_room_name: 'all',
                team_chat_room_name: null,
        
                server: null,
        
                match_settings: {
                    map_name: null, 
                    game_mode: null
                },
        
                current_state: 'IN_GAME',
                game_mode: null,
        
                id: 'lineartutorial',
                match_type: 0,
                
                playlist_type: null
            },
        
            players: {},
        
            match_setup_state: 0,
            map_name: null
        }

        matchmakingData.server = serverAccessString
        matchmakingData.lobby.server = serverAccessString

        matchmakingData.players[userId] = {
            player_name: userName
        }

        matchmakingData.match_setup_state = 2
 
        socket.emit('lobby_found', matchmakingData)
    })

    socket.emit('connect')
    socket.emit('service_enabled')
})

app.get('*', (req, res) => {
    console.log('Unable to handle request: ', req.method, req.path)
})

const port = process.env.PORT ? parseInt(process.env.PORT) : 80
const host = process.env.HOST ?? '127.0.0.1'

server.listen(
    port, 
    host
)