var helper = {
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

    getBattery: function (battery) {
        let date = new Date();
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        var time = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

        battery["time"] = time;
        battery["date"] = date.toLocaleDateString();
        return battery;
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
            const client = await mongo.connect(dsn, { useNewUrlParser: true });
            const db = await client.db();
            const col = await db.collection(colName);
            const res = await col.find(criteria, projection).limit(limit).toArray();

            await client.close();
            return res;
        } catch (e) {
            console.error("error e", e);
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
            const client = await mongo.connect(dsn, { useNewUrlParser: true });
            const db = await client.db();
            const col = await db.collection(colName);
            const res = await col.insertOne(parameters);

            await client.close();
            console.log("res.result", res.result);
            return true;
        } catch (e) {
            console.error(e);
            return false;
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
            const client = await mongo.connect(dsn, { useNewUrlParser: true });
            const db = await client.db();
            const col = await db.collection(colName);
            const ObjectId = require('mongodb').ObjectID;
            const res = await col.updateOne(
                { _id: ObjectId(id)},
                {$set: parameters},
                { upsert: true}
            ).catch(function (reason) {
                console.log('Unable to connect to the mongodb instance. Error: ', reason);
            });

            await client.close();
            console.log("updateCollection res.result", res.result);
            return res;
        } catch (e) {
            console.error(e);
            return e;
        }
    },


    updateCollection2: async function (mongo, dsn, colName, id, parameters) {
        try {
            const client = await mongo.connect(dsn, { useNewUrlParser: true });
            const db = await client.db();
            const col = await db.collection(colName);
            const ObjectId = require('mongodb').ObjectID;

            console.log("update2: ", id, ObjectId(id));
            const res = await col.findOneAndUpdate(
                {_id: id},
                {$set: parameters},
                {returnOriginal: false, upsert: true}
            ).catch(function (reason) {
                console.log('Unable to connect to the mongodb instance. Error: ', reason);
            });

            await client.close();
            console.log("updateCollection2 res.result", res);
            return res;
        } catch (e) {
            console.error(e);
            return e;
        }
    },


    /*
     *
     *
     */
    dropCollection: async function (mongo, dsn, colName) {
        const client  = await mongo.connect(dsn, { useNewUrlParser: true });
        const db = await client.db();
        const col = await db.collection(colName);

        await col.drop({ writeConcern: "majority" });
    }
};

module.exports = helper;
