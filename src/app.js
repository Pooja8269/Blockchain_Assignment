const express = require('express');
var session = require('express-session');
const bodyParser = require('body-parser');
const app = express();
const Web3 = require('web3');
const web3 = new Web3(Web3.providers.HttpProvider('https://rinkeby.infura.io/v3/1fd2fa9bd0e648158a0af7bd341595dd'));
const path = require('path');

var mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(session({secret : 'hahaha', 
resave:false,
saveUninitialized: true,
}));

mongoose.connect("mongodb://localhost/Blockchain_Assignment",{useNewUrlParser: true});
var dbconnect = mongoose.connection;
if(!dbconnect){
    console.log('Sorry connection cannot be established');
    return;

}

var userSchema = mongoose.Schema({
    User_Name: String,
    password: String,
    key: String

});


var userModel = mongoose.model("Blockchain_Assignment", userSchema, "Blockchain_Assignment");

app.get('/', function (req, res) {
    if(!req.session.key){
        res.render('login.html', {
            page: 'login'
        })
    }
    else{
        if(req.session.user == 'Admin'){
            res.render('admin.html',{
                page: 'admin'
            })
        }
        else{
            res.render('index.html', {
                page: 'index'
                
            })

        }
    }
});

app.get('/register', function (req, res) {
    
    res.render('register.html', {
        page: 'register'
    })
    
});

app.get('/user', function (req, res) {
    if(req.session.key){
        res.render('index.html', {
            page: 'index'
        })
    }else{
        res.redirect('/');
    }
    
    
});

app.get('/admin', function(req, res) {
    if(req.session.key){
    res.render('admin.html', {
        page: 'admin'
    })
    }else{
        res.redirect('/');
    }
});

app.get('/market', function (req, res) {
    if(req.session.key){
    res.render('market.html', {
        page: 'market'
    })
    }else{
        res.redirect('/');
    }

});

app.get('/items', function (req, res) {
    if(req.session.key){
    res.render('items.html', {
        page: 'items'
    })
    }else{
        res.redirect('/');
    }
});

app.get('/purchaseHistory', function(req, res){
    if(req.session.key){
    res.render('purchaseHistory.html',{
        page: 'purchaseHistory'
    })
    }else{
        res.redirect('/');
    }   
});

app.get('/penidng', function (req, res){
    if(req.session.key){
    res.render('pendingReq.html', {
        page: 'pending'
    });
    }else{
        res.redirect('/');
    }
});

app.get('/approved', function (req, res){
    if(req.session.key){
    res.render('approvedReq.html', {
        page: 'approved'
    });
    }else{
      res.redirect('/');
    }
});


app.get('/blockchain/users' , (request, response) =>{
    console.log('hihihol');
    console.log(request.headers.authorization);
   let buff = new Buffer.from(request.headers.authorization.split(' ')[1], 'base64');
   let credentials = buff.toString('ascii').split(':');
   console.log(credentials[1]);
   console.log(credentials[0]);
   userModel.find({'User_Name':credentials[0]}).exec(function(err, res){
        if(err){
            response.statusCode = 500;
            response.send({status: response.statusCode, error: err});
        }
        console.log(res[0]);
        if(res[0] != undefined){
         
            if(res[0].User_Name == credentials[0] && res[0].password == credentials[1]){
                console.log();
              
                response.send({status: 200, data: {status:true,
                                                   key:res[0].key}});  
                request.session.key = res[0].key;
                request.session.user = res[0].User_Name;
                request.session.save((err) =>{
                    console.log("Session Before Redirect: ", request.session);
                })
                console.log(request.session.key,request.session.user);         
            }else{
                response.send({status: 200, data: {status:false}});
            }
        }else{
            response.send({status: 200, data: {status:false}});
        }

        
    });
  
});

app.get('/blockchain/getuserkey', (request, response) => {
    let buff  = new Buffer.from(request.headers.authorization.split(' ')[1], 'base64');
    let queryUsername = buff.toString('ascii');
    userModel.find({'User_Name':queryUsername}).exec((err,res) => {
        if(err){
            response.statusCode = 500;
            response.send({status: response.statusCode, error: err});
        }else{
                let encodedKey = Buffer.from(res[0].key).toString('base64');
                response.send({status: 200, data:encodedKey});
        }
    })
});

app.get('/blockchain/logout', (request, response) => {
    request.session.destroy( (err) => {
        console.log(err);
       
    });
    response.send({status: 200, data:'ok'});
})

app.post('/blockchain/adduser', (request, response) =>{
    userModel.find({'User_Name':request.body.User_Name}).exec(function(err, res){
        if(err){
            response.statusCode = 500;
            response.send({status: response.statusCode, error: err});
        }else{
            if(res.length > 0){
                response.send({statusCode: 200, statusMsg:false});
            }else{
                userModel.insertMany(request.body,function(errIn, resIn){
                    if(errIn){
                        response.statusCode = 500;
                        response.send({status: response.statusCode, error: err});
                    }else{
                        console.log(resIn);
                        response.send({statusCode: 200, statusMsg:true});
                    }
                })
            }
        }
    })
});


app.use('/scripts', express.static(path.join(__dirname, 'node_modules/')));
app.use('/js', express.static(path.join(__dirname, 'js/')));
console.log('-->'+__dirname);


app.listen(3913, () => console.log('App listen on port 3913')); 