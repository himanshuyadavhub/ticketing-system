const mongoose = require('mongoose');
const User = require('./model/user');
const Ticket = require('./model/ticket');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken')
const config = process.env;


exports.registration = async(req,res) => {
    var {username,password,role} = req.body;
    var user = await User.findOne({username});

    if(user){
        req.session.error('User name already exist');
        return res.redirect('/register');
    }
    var hasdPsw = await bcrypt.hash(password,12);

    var user = new User({
        username,
        password:hasdPsw,
        role
    });

    
    await user.save();
    res.send('Registration DONE.')
};

exports.login = async(req,res) => {
    var {username,password,role} = req.body;
    var user = await User.findOne({username});

    if(!user){
        req.session.error = 'Incorrect username'
        return res.redirect('./login')
    }

    var isMatch = await bcrypt.compare(password, user.password);  

    if(!isMatch){
        req.session.error = 'Incorrect credentials';
        return res.redirect('./login')
    }

    var token = jwt.sign(
        {username,role},
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
    );   
    
    req.session.token = token;
    // req.session.user = user;
    res.send('Logged In')
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
      if (err) throw err;
      res.redirect("/login");
    });
};

exports.ticketRaise = async(req,res) => {
    var {tittle,description,assignedTo,priority} = req.body;

    var user = req.user;

    if(user.role === 'admin'){
        const ticket = new Ticket({
            tittle,
            description,
            assignedTo,
            priority,
            createdAt:new Date()
        });
    
        ticket.save();
        return res.send('Ticket Raise');
    }

    req.session.error = ' Authorized for admin only';
    res.send('To dashboard page');   
};

exports.deleteTicket = async(req,res) => {
    var ticketId = req.params.ticketId;
    var user = req.user;

    // if(user.role != 'admin'){
    //     res.send('Only admin can delete ticket');
    // }

    var deleted = await Ticket.findOneAndDelete({_id:ticketId});

    deleted.save();
    res.send('Ticket deleted')
};

exports.showTicket = async(req,res) => {
    var isAll = req.params.isAll;
    var status = req.query.status;
    var tittle = req.query.tittle;
    var priority = req.query.priority;

    if(isAll === 'all'){
        var allTickets = await Ticket.find({});
    }

    if(status){
        var allTickets = await Ticket.find({status});
    }

    if(tittle){
        var allTickets = await Ticket.find({tittle});
    }

    if(priority){
        var allTickets = await Ticket.find({priority});
    }

    res.send(allTickets);
};

exports.markedClosed = async(req,res) => {
    var ticketId = req.params.ticketId;
    var status = req.body.status;
    var user = req.user;

    var ticket = await Ticket.findById({_id:ticketId});
    var assignedTo = ticket.assignedTo;

    if(user.role === 'admin'){
        var updatedTicket = await Ticket.findByIdAndUpdate({_id:ticketId},{status});
        return res.send('Updated');
    }else if(user.username === assignedTo ){

        var highPriorityTicket = await Ticket.find({assignedTo,priority:{$ne:'low'},status:'open'});

        if(ticket.priority != 'low'){
            var updatedTicket = await Ticket.findByIdAndUpdate({_id:ticketId},{status});
            return res.send('Updated');
        }

        if(highPriorityTicket){
            req.session.error = ' A high priority open ticket exist , close that first.';
            return res.send('Close high priority first');
        }

        var updatedTicket = await Ticket.findByIdAndUpdate({_id:ticketId},{status});

        return res.send('Updated');
    }else{
        req.session.error = ' Unauthorized';
        return res.send('Not Authorized for update');
    };
}