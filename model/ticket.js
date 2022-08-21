const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketSchema = new Schema({

    id:Schema.Types.ObjectId,
    tittle:String,
    description:String,
    status:{
        type:String,
        default:'open'
    },
    priority:{
        type:String,
        default:'low'
    },
    assignedTo:String,
    createdAt:Date,       
});

module.exports = mongoose.model('Ticket',ticketSchema);
