const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// to handle the request as a json object.
app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

// Using sessions for the '/customer' path.
// Middleware to handle authentication for routes under '/customer/auth/'.
app.use("/customer/auth/*", function auth(req,res,next){
//Write th5e authenication mechanism here
    if (req.session.authorization){
        token = req.session.authorization['accessToken'];
        jwt.verify(token, 'your-secret-key', (err, user) => {
            if(!err){
                req.user = user;
                next();
            }else{
                return res.status(403).json({message: "User not authenticated"})
            }
        })
    }else{
        return res.status(403).json({message: "User not logged in"});
    }
});

 
const PORT =5000;

// Define routes for the '/customer' and root paths.
app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
