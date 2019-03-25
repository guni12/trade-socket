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
io.origins('*:*');

app.use(express.static("public"));
app.use('/js', express.static(path.resolve('dist')));
app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

let date = new Date();
let percent = 0;
let price = 80;
let numUsers = 0;

var car = {
    name: "Electric Car",
    date: date.toLocaleDateString(),
    time: date.getTime(),
    "perc": 50,
    "price": 0,
};


var dist = {
    name: "Electrical Station",
    date: date.toLocaleDateString(),
    time: date.getTime(),
    "perc": 0,
    "price": price,
};


var users  = {};

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


// Return a JSON object with list of all documents within the collection.
app.get("/drop",
    async (req, res) => {
        console.log("HTTP request on " + req.url);
        try {
            let result = await helper.dropCollection(mongo, dsn, "dist");

            res.json(result);
        } catch (err) {
            console.log(err);
            res.json(err);
        }
    }
);

// Return a JSON object with list of all documents within the collection.
app.get("/droptrade",
    async (req, res) => {
        console.log("HTTP request on " + req.url);
        try {
            let result = await helper.dropCollection(mongo, dsn, "trade");

            res.json(result);
        } catch (err) {
            console.log(err);
            res.json(err);
        }
    }
);


// insert a JSON object with new chat-content
app.get("/list",
    async (req, res) => {
        console.log("HTTP request on " + req.url);
        try {
            let result = await helper.findInCollection(mongo, dsn, "dist", {}, {}, 0);

            console.log(result);
            res.json(result);
        } catch (err) {
            //console.log(err);
            res.json(err);
        }
    }
);


// insert a JSON object with new chat-content
app.get("/listtrade",
    async (req, res) => {
        console.log("HTTP request on " + req.url);
        try {
            let result = await helper.findInCollection(mongo, dsn, "trade", {}, {}, 0);

            console.log(result);
            res.json(result);
        } catch (err) {
            //console.log(err);
            res.json(err);
        }
    }
);


io.on('connection', function(socket) {
    var addedUser = false;

    console.log('a user connected');

    var userId = socket.handshake.query.userid;

    users[userId] = socket;
    users[userId]['email'] = socket.handshake.query.email;
    console.log(socket.handshake.query.userid);
    users[userId].emit('private', "Testar private to userid: " + userId);

    let criteria = {email: socket.handshake.query.email};

    checkOrStart(criteria, socket.handshake.query.userid, socket.handshake.query.email);
    tradeInfo();

    socket.on('trade', function(msg) {
        console.log('trade', price, msg);
        let criteria = {email: msg.email};

        try {
            let res = getTradeData(criteria);

            res.then(function(result) {
                console.log("trade try -  res: ", result);
                if (result.length == 0) {
                    checkOrStart(criteria, msg.uid, msg.email);
                } else {
                    console.log("Data finns", msg.email);
                    let depa = (parseFloat(result[0].depa) + parseFloat(msg.insert));
                    let buy = parseFloat(msg.buy);
                    let sell = parseFloat(msg.sell);

                    if (parseFloat(car['perc']) >= msg.sell) {
                        car['perc'] = parseFloat(car['perc']) - sell;
                        depa = depa + (sell * price);
                    }

                    if (depa - (buy * price) > 0 && (parseFloat(car['perc']) + buy) <= 100) {
                        depa = depa - (buy * price);
                        car['perc'] = (parseFloat(car['perc']) + buy);
                    }
                    let leaf = helper.getBattery(car);
                    let upd2 = {
                        'uid': msg.uid,
                        'depa': depa,
                        'email': msg.email,
                        'insert': msg.insert,
                        'buy': msg.buy,
                        'sell': msg.sell,
                        'price': price,
                        'date': msg.date,
                        'time': msg.time,
                        'car': leaf
                    };
                    let res4 = updateTradeData(result[0]._id, upd2);

                    res4.then(function() {
                        users[msg.uid].emit('private trade', {
                            'res': upd2,
                        });
                        users[msg.uid].emit('car', leaf);
                    });
                }
            });
        } catch (e) {
            console.log("trade catch e: ", e);
        }
    });


    socket.on('add user', (username) => {
        if (addedUser) {return;}
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
    //setTimeout(() => socket.disconnect(true), 1200);
});

setInterval(function () {
    let station = helper.getDist(dist);

    percent = station.perc;
    //console.log(percent);
    //updatePercent();
    updatePrice(percent);
    console.log("price", price);
    dist["price"] = price;
    io.emit("dist", station);
}, 12000);

setInterval(tradeInfo, 5000);

function tradeInfo() {
    const entries = Object.entries(users);

    console.log("info", price);
    for (const [user] of entries) {
        let criteria = {email: users[user]['email']};
        let info = getTradeData(criteria);

        info.then(function(result) {
            //console.log("user, info", user, result);
            //console.log("old info.car", result[0].car);
            users[user].emit('private trade', {
                'res': result,
            });
            users[user].emit('car', result[0].car);
        });
    }
}

function updatePrice(amp) {
    console.log("amp", amp);
    if (amp > 80 && amp < 100) {
        price = 2;
    } else if (amp > 100 && amp < 120) {
        price = 3;
    } else {
        price = 1;
    }
}


async function getTradeData(criteria) {
    let arr = await helper.findInCollection(mongo, dsn, 'trade', criteria, {}, 0);

    return arr;
}


async function updateTradeData(id, criteria) {
    let arr = await helper.updateCollection2(mongo, dsn, 'trade', id, criteria);

    return arr;
}

async function checkOrStart(criteria, uid, email) {
    try {
        let res = getTradeData(criteria);

        res.then(function(result) {
            if (result.length == 0) {
                let leaf = helper.getBattery(car);
                let upd = {
                    'uid': uid,
                    'email': email,
                    'depa': 0,
                    'insert': 0,
                    'buy': 0,
                    'sell': 0,
                    'price': 0,
                    'date': leaf.date,
                    'time': leaf.time,
                    'car': leaf
                };
                let test = helper.addToCollection(mongo, dsn, "trade", upd);

                test.then(function(result3) {
                    if (result3) {
                        let res2 = getTradeData(criteria);

                        res2.then(function() {
                            users[uid].emit('private trade', {
                                'res': upd,
                            });
                            users[uid].emit('car', leaf);
                        });
                    }
                });
            }
        });
    } catch (e) {
        console.log("init user catch e: ", e);
    }
}


http.listen(3200, function() {
    console.log('listening on *:3200');
});
