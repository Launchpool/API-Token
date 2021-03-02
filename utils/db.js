const { ObjectId } = require('mongodb')
const MongoClient = require('mongodb').MongoClient;


const initializeClient = () => {
    try {
        const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.8h6r6.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
        const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true  });
        client.connect();
        const getClient = () => client
        return {client, getClient}
    }
    catch(err) {
        console.log(err)
    }
}

const { client, getClient } = initializeClient()

 
updateChainData = async (chainData, client) => {
    try {
        const database = client.db('roya');
        const collection = database.collection('token');
        let newChainData = Object.assign({}, chainData)
        newChainData._id = ObjectId()
        await collection.insertOne(newChainData)
        await collection.deleteMany( { timeStamp : {"$lt" : Date.now() - 60 * 60 * 24 * 1000 }}) 
    } 
    catch(err) {
        console.log(err)
    }
}

getCachedData = async (client) => {
    try {
        const database = client.db('roya');
        const collection = database.collection('token');
        cachedData = await collection.find().sort({ _id: -1 }).limit(1).toArray();
        cachedData = cachedData[0];
        return cachedData    
    } 
    catch(err) {
        console.log(err)
    }
}


module.exports = {
    getClient,
    updateChainData,
    getCachedData
}

