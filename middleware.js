const jwt = require("jsonwebtoken");

const config = process.env;


// exports.isLoggedIn = (req,res,next) => {
//   var token = req.session.token;
  
//   if(!token){
//     req.session.error = ' You need to log in first';
//     return res.send(`You're not logged in.`);
//   }

//   next(); 

// };

exports.isAdmin = (req, res, next) => {
  var user = req.user;

  if(user.role === 'admin' ){
    next();
  }else{
    req.session.error = ' Only admin can access';
    return res.send('Access denied');
  };
  
};

exports.verifyToken = (req, res, next) => {
  var token = req.session.token;

  if (!token) {
    req.session.error = ("You have to log in first");
    return res.redirect('/login')
  }

  try {
    var decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};




