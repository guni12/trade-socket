# trade-socket

trade-socket is a microservice for real-time communication and trade of electricity between a local electrical station and its customers. Prices vary depending on supply and demand. The cost can dubble three times at worst. It is built on Express.js, described also in the backend-service (See below).

## Real-time implementation

For the real-time communication `socket.io` was used, as it contains great support for single as well as group channels and also solves possible issues with proxies, firewalls and antivirus interference.

#### Electrical Station

The Electrical Station's current load is simulated and transmitted every twelve seconds. This allows the "customer" to have patience to wait for changes and also have enough time to make a decision to buy or sell. The load status decides the price. There is always a possibility to use more than 100% calculated energy at the station, up to 120%. Up to 80% means normal price, 80-100% double and thereover is three times of the normal price (seen in colors at the trade-vue implementation).

#### Customer

Every 5 seconds the current status of each customer (U) is transmitted. U has a car-battery with a size of 100Kwh, loaded at the beginning with 50% in our prototype. U can insert 50 or 100 Sek and buy or sell energy for 1-3 Sek per Ampere. The battery-status and the Electrical Station's status is displayed by charts. Information concerning the customer and transactions is displayed as text. The current price and when it was produced is printed as a table.

#### Mongodb

`Mongodb` is used to keep track of each customers data, such as battery-level, account, email and personal id and when the latest transaction was made. Mongodb is a slim database, fast, easy to learn and handle, document-based, sql-less, popular, with a strong community and part of MEAN. It uses dynamic schemas which eliminates the need to pre-define the structure, like fields or value types.

#### Socket.io

When the user sign in to the webpage the email and id is saved and used to immediately create a personal channel via socket.io. The user gets added to a user-list (server-side) with it's id as key. Right away the users data will be added to the "trade"-collection if it does not already exist. After that the exchanges can be transmitted seamlessly via the `socket.emit('trade', content)`-command to the server and the `socket.emit('car', content)`-command to the client. The communication with mongodb is done via asynchronous functions.

As a service to the administrator it is possible to see the users-list and the users trade-data via 
* `path/list`
* `path/listtrade`

It is also possible to empty the collections via 
* `path/drop`
* `path/droptrade`

### How does it work?

After some detours, basically because I am a newbee at Vue.js, I now find the communication working quite stable. It is possible to login and continue on your transactions from another day. Amchart.js version 4 is used for displaying the gauge-meters, frontend, and is quick to render and rewrite.

### trade-socket together with backend and frontend

This platform was created (together with [trade-express](https://github.com/guni12/trade-express) and [trade-vue](https://github.com/guni12/trade-vue)) as my final project at [Blekinge Tekniska Högskola](https://www.bth.se/eng/) for the course Ramverk2. The backend application handles secure login services and some text content, and the frontend application creates the visual experience containing charts.
