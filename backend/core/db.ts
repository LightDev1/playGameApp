import mongoose from 'mongoose';

mongoose.Promise = Promise;

const mongoUri = 'mongodb+srv://admin:123qwe@cluster0.2nsl6.mongodb.net/app?retryWrites=true&w=majority';

mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connestion error'));

export { db, mongoose };