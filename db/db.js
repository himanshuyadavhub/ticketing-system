const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
config = process.env;

const connectDb = () => {
    mongoose.connect(process.env.MONGO_URL)
    .then(()=>{console.log('DB connected')})
    .catch((err)=>{
        console.log(err)
        process.exit(1)
    });
};

module.exports = connectDb;