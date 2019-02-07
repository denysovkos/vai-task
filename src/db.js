const MongoClient = require('mongodb').MongoClient;
const nonLexicalWords = require('./words.json').words;

class DB {
    constructor() {
        this.collection = null;
        this.url = 'mongodb://complexity:complexity1!@ds125525.mlab.com:25525/complexity';
        this.client = new MongoClient(this.url, { useNewUrlParser: true });
    }

    async connect() {
       try {
        const client = await this.client.connect();
        this.collection = client.db('complexity').collection('words');
        console.log('✅  Successfully connected to DB');
       } catch (err) {
        console.error(`❌  ${err.message}`);
        process.exit();
       }
    }

    async prepareCollection() {
        try {
            const data = await this.collection.find({}).toArray();
            const isFilled = Boolean(data.length);

            if (isFilled) {
                console.log('✅  DB already has collection with non lexical words');
                return;
            } else {
                const preparedWords = nonLexicalWords.map(word => ({
                    word
                }));
                await this.collection.insertMany(preparedWords);
                console.log('✅  Successfully filled DB with non lexical words');
            }
        } catch (err) {
            console.error(`❌  ${err.message}`);
        }
    }

    getInstance() {
        return this.collection;
    }

    async init() {
        await this.connect();
        await this.prepareCollection();
    }

}

const DBInstance = new DB();
DBInstance.init();

module.exports = DBInstance;