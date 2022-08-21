const express = require('express');
const app = express();

const dotenv = require('dotenv');
dotenv.config();

const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

const connectDb = require('./db/db');
const db = require('./db/db');

const controller = require('./controller')
const middleware = require('./middleware')

connectDb();

const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/ticketsystem',
    collection: "mySessions",
});

app.use(
    session({
      secret: "secret",
      resave: false,
      saveUninitialized: false,
      store: store,
    })
);

app.use(express.urlencoded({ extended: true }));


app.post('/register',controller.registration);

app.post('/login',controller.login);

app.post('/logout',controller.logout);

app.post('/ticketnew',middleware.verifyToken,middleware.isAdmin,controller.ticketRaise);

app.post('/deleteTicket/:ticketId',middleware.verifyToken,middleware.isAdmin,controller.deleteTicket);

app.get('/tickets/:isAll',middleware.verifyToken,controller.showTicket);

app.get('/tickets',middleware.verifyToken,controller.showTicket);

app.post('/tickets/markAsClosed/:ticketId',middleware.verifyToken,controller.markedClosed)


app.listen(5000,()=>{
    console.log('App is runnning on http://localhost:5000')
})