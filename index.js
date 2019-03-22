var express = require('express');
var app = express();
var http = require('http').Server(app);
const path = require('path');
const cors = require('cors');
const bodyParser = require("body-parser");
const io = require('socket.io')(http);
const mongo = require("mongodb").MongoClient;
const dsn =  process.env.DBWEBB_DSN || "mongodb://localhost:27017/dist";
const helper = require("./public/javascripts/helper.js");

io.set('heartbeat timeout', 10000);
io.set('heartbeat interval', 5000);

app.use(express.static("public"));
app.use('/js', express.static(path.resolve('dist')));
app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

let date = new Date();
let percent = 0;
let price = 0;

var car = {
    name: "Electric Car",
    date: date.toLocaleDateString(),
    time: date.getTime(),
    "perc": 0,
    "price": 0,
};


var dist = {
    name: "Network Station",
    date: date.toLocaleDateString(),
    time: date.getTime(),
    "perc": 0,
    "price": 0,
}


var connectedUsers = [];

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


// insert a JSON object with new chat-content
app.post("/insert",
    async (req, res) => {
    console.log("HTTP request on " + req.url);
    console.log(req.body);
    try {
        let result = await helper.addToCollection(dsn, "dist", req.body);
        console.log(result);
        res.json(result);
    } catch (err) {
        //console.log(err);
        res.json(err);
    }
});


// insert a JSON object with new chat-content
app.get("/list",
    async (req, res) => {
    console.log("HTTP request on " + req.url);
    console.log(req.body);
    try {
        let result = await helper.findInCollection(dsn, "dist", req.body);
        console.log(result);
        res.json(result);
    } catch (err) {
        //console.log(err);
        res.json(err);
    }
});


io.on('connection', function(socket) {
    var addedUser = false;
    console.log('a user connected');

    socket.on('subscribe', function(room) {
        console.log("bara room", room);
        console.log('joining room', room.room);
        socket.join(room.room, () => {
            io.to(room.room, 'a new user has joined the room');
            var roomKeys = Object.keys(socket.rooms);
            var socketIdIndex = roomKeys.indexOf( socket.id );
            var rooms = roomKeys.splice( socketIdIndex, 1 );
            console.log("rooms: ", rooms);
        });
    });

    socket.on('unsubscribe', function(data) {
        socket.leave(data.room);
    });


    socket.on('dist message', function(msg){
        console.log('id: ' + msg.id + ", email:" + msg.email);
        console.log('sending room post', msg.room);
        connectedUsers[msg.id] = socket;
        connectedUsers[msg.id]['room'] = msg.room;
        connectedUsers[msg.id]['email'] = msg.email;
        console.log(connectedUsers[msg.id]['room']);
        socket.broadcast.to(connectedUsers[msg.id]['room']).emit('private', msg.email + ", Välkommen!");
    });


    socket.on('add user', (username) => {
        if (addedUser) return;
        console.log(username);

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    socket.on('disconnect', function(reason) {
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
        console.log('user disconnected');
        console.log(reason);
    });
    //setTimeout(() => socket.disconnect(true), 120000);
});

setInterval(function () {
    let station = helper.getDist(dist);
    percent = station.perc;
    //console.log(percent);
    updatePercent();
    console.log("price", price);
    dist["price"] = price;
    io.emit("dist", station);
}, 12000);

setInterval(function () {
    connectedUsers.forEach(function(val, key) {
        let leaf = helper.getBattery(car, 0, 24);
        console.log("val.email, car", key, val.email);
        val.broadcast.to(val.room).emit('car', leaf);
    });
}, 8000);


async function updatePercent() {
    let arr = await helper.findInCollection(mongo, dsn, 'dist', {}, {}, 0);
    price = await helper.updateFour(mongo, dsn, arr, percent);
}


http.listen(3200, function() {
   console.log('listening on *:3200');
});
