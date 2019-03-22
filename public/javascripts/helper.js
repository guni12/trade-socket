var helper = {
    returnRandomFloat: function (min, max) {
        return (Math.random() * (max - min) + min).toFixed(2);
    },

    randomPercent: function (min, max) {
        return (Math.random() * (max - min) + min).toFixed(1);
    },

    getDist: function (dist) {
        let date = new Date();
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        var time = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        dist["time"] = time;
        dist["perc"] = helper.randomPercent(60, 120);
        dist["date"] = date.toLocaleDateString();
        return dist;
    },

    getBattery: function (battery, min, max) {
        let date = new Date();
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        var time = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        battery["time"] = time;
        battery["perc"] = helper.randomPercent(min, max);
        battery["date"] = date.toLocaleDateString();
        return battery;
    },

    getDevices: function (dev) {
        let date = new Date();
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        var time = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        dev.map((item) => {
            item["time"] = time;
            item["v1"] = helper.returnRandomFloat(204, 237.1);
            item["v2"] = helper.returnRandomFloat(205, 238.3);
            item["v3"] = helper.returnRandomFloat(201.7, 239.3);
            return item;
        });
        return dev;
    },

    // removefirst arr.shift(), add last arr.push();
    /**
     * Remove first and add last in the four percent values array
     *
     * @param {obj} arr the arr to update
     * @param {val}     string the latest percent value
     *
     * @return {string} the updated json
     */
    updateFour: async function (mongo, dsn, arr, val) {
        console.log(arr);
        try {
            let removed = {'one': arr[0].two, 'two': arr[0].three, 'three': arr[0].four, 'four': val};
            let id = {'_id': arr[0]._id};
            console.log("updated arr", removed);
            await helper.updateCollection(mongo, dsn, 'dist', arr[0]._id, removed);

            let price = await helper.sumValues(removed);
            price = price / 4;
            return price.toFixed(2);
        } catch(e) {
            console.error("error e", e)
            return 0;
        }
    },


    sumValues: async function (obj) {
        return Object.keys(obj).reduce((sum,key)=>sum+parseFloat(obj[key]||0),0);
    },


    /**
     * Find documents in an collection by matching search criteria.
     *
     * @async
     *
     * @param {string} dsn        DSN to connect to database.
     * @param {string} colName    Name of collection.
     * @param {object} criteria   Search criteria.
     * @param {object} projection What to project in results.
     * @param {number} limit      Limit the number of documents to retrieve.
     *
     * @throws Error when database operation fails.
     *
     * @return {Promise<array>} The resultset as an array.
     */
    findInCollection: async function (mongo, dsn, colName, criteria, projection, limit) {
        try {
            const client = await mongo.connect(dsn,{ useNewUrlParser: true });
            const db = await client.db();
            const col = await db.collection(colName);
            const res = await col.find(criteria, projection).limit(limit).toArray();
            await client.close();
            return res;
        } catch(e) {
            console.error("error e", e)
            return e;
        }
    },



    /**
     * Insert item in an collection with parameters.
     *
     * @async
     *
     * @param {string} dsn        DSN to connect to database.
     * @param {string} colName    Name of collection.
     * @param {object} parameters Object parameters to insert.
     * @param {object} projection What to project in results.
     * @param {number} limit      Limit the number of documents to retrieve.
     *
     * @throws Error when database operation fails.
     *
     * @return {Promise<array>} The resultset as an array.
     */
    addToCollection: async function (mongo, dsn, colName, parameters) {
        try {
            const client = await mongo.connect(dsn,{ useNewUrlParser: true });
            const db = await client.db();
            const col = await db.collection(colName);
            const res = await col.insertOne(parameters);
            await client.close();
            console.log("res.result", res.result);
            return res;
        } catch(e) {
            console.error(e)
            return e;
        }
    },


    /**
     * Insert item in an collection with parameters.
     *
     * @async
     *
     * @param {string} dsn        DSN to connect to database.
     * @param {string} colName    Name of collection.
     * @param {object} parameters Object parameters to insert.
     * @param {object} projection What to project in results.
     * @param {number} limit      Limit the number of documents to retrieve.
     *
     * @throws Error when database operation fails.
     *
     * @return {Promise<array>} The resultset as an array.
     */
    updateCollection: async function (mongo, dsn, colName, id, parameters) {
        try {
            const client = await mongo.connect(dsn,{ useNewUrlParser: true });
            const db = await client.db();
            const col = await db.collection(colName);
            const ObjectId = require('mongodb').ObjectID;
            const res = await col.updateOne({ _id: ObjectId(id)}, {$set: parameters}, { upsert: true}).catch(function (reason) {
                console.log('Unable to connect to the mongodb instance. Error: ', reason);
            });
            await client.close();
            console.log("updateCollection res.result", res.result);
            return res;
        } catch(e) {
            console.error(e)
            return e;
        }
    },


    /*
     *
     *
     */
    dropCollection: async function (dsn, colName) {
        const client  = await mongo.connect(dsn, { useNewUrlParser: true });
        const db = await client.db();
        const col = await db.collection(colName);
        const res = await col.drop({ writeConcern: "majority" });
    }
};

module.exports = helper;
