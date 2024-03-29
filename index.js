const express = require('express');
const cors = require('cors')
bodyParser = require('body-parser');
var mongoose = require("mongoose");
mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://vinubalan:8838010007dhanda@smalltalk.9khi7h3.mongodb.net/?retryWrites=true&w=majority')
.then(() => {
  console.log('connected to mongo');
})
.catch((err) => {
      console.error('failed to connect with mongo');
      console.error(err);
    });
var users = require("./model/users.js");
var messages = require("./model/messages.js");
var admins = require('./model/admins.js');
var comusers = require('./model/comuser.js');
var comMessages = require('./model/comMessages.js');

const app = express();
const  PORT = 3306;

app.use(cors({origin: true, credentials: true}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use(express.json())
// Route to get all posts

app.get("/getOnlineUsers", (req,res)=>{
    users.find().then((data)=>{
        // console.log(data.data);
        res.send({data:data});
    }).catch((e)=>{
        console.log(e);
    })
});

app.get("/getComUsers", (req,res)=>{
    admins.find().then((data)=>{
        // console.log(data.data);
        res.send({data:data});
    }).catch((e)=>{
        console.log(e);
    })
});
app.post("/chat", (req,res)=>{
    let Users = new users({
        userid: req.body.userid,
        status: "available"
    });
    Users.save().then(() =>{
        res.send("created: "+req.body.userid);
        console.log(req.body.userid);
    }).catch((err)=>{
        console.log(err);
    });
});
    
app.post('/createCom',(req,res)=>{
    let Admin = new admins({
        comm: req.body.comName,
        adminid: req.body.adminID,
        adminpass: req.body.adminPass
    });
    Admin.save().then(() =>{
        console.log('community built');
        console.log(req.body.adminID);
    }).catch((err)=>{
        console.log(err);
    });
})

app.post('/joinAdmin',(req,res)=>{
    admins.find({$and: [{adminid: {$eq: req.body.user}},{adminpass: req.body.adminPass},{comm: req.body.comName}]}).
    then((data)=>{
        console.log(data)
        if(data.length!=0)
        res.send({exist: true});
        else
        res.send({exist: false});
    })
})

app.post('/joinStranger',(req,res)=>{
    admins.find({comm: {$eq: req.body.comName}}).
    then((data)=>{
        if(data.length>0)
        res.send({exist: true});
        else
        res.send({exist: false});
    })
})

app.post('/createStrangerID',(req,res)=>{
    comusers.find({userid: {$eq: req.body.userId}}).
    then((data) =>{
        if(data.length==0){
            let comUser = new comusers({
                userid: req.body.userId,
                comm: req.body.comName,
                status: 'busy'
            });
            comUser.save().then(()=>{
                console.log('stranger id created');
            }).catch((e)=>console.log(e));
        }else{
            console.log('user already exists');
        }
    })
    
})

app.post('/createAdminID',(req,res)=>{
    comusers.find({userid: {$eq: req.body.userId}}).
    then((data) =>{
        if(data.length==0){
            let comUser = new comusers({
                userid: req.body.userId,
                comm: req.body.comName,
                status: 'busy'
            });
            comUser.save().then(()=>{
                console.log('admin id created');
            }).catch((e)=>console.log(e));
        }else{
            console.log('user already exists');
        }
    })
})

app.post("/connectStranger", (req,res)=>{
    users.findOne({$and: [{$sample: {$size: 1}},{userid: {$ne: req.body.userid}},{status: "available"}]}).
    then((data) => {
        if(!data){
            res.send(null);
        }else{
            console
            res.send(data);
            users.updateOne({userid: data.userid},
                {$set: {status: "busy"}})
                .then(()=>{
                    console.log("user busy");
                });
                console.log("connected");
        }
    }).catch((e) =>{
        console.log(e);
    })
    
});



app.post("/connectNext", (req,res)=>{
    users.updateOne({userid: req.body.userid},
        {$set: {status: "available"}})
        .then(()=>{
            console.log("user available");
        });
    users.updateOne({userid: req.body.strangerID},
            {$set: {status: "available"}})
            .then(()=>{
                console.log("stranger made available");
            });
    messages.deleteMany({$or:[{sender: {$eq: req.body.userid}},{reciever: {$eq: req.body.userid}},{sender: {$eq: req.body.strangerID}},{reciever: {$eq: req.body.strangerID}}]}).
    then(() => {
        console.log('deleted');
    }).catch((e) =>{
        console.log(e);
    })
});

app.post("/checkConnection", (req,res)=>{
    users.find({$and: [{userid: req.body.userid},{status: "available"}]}).
    then((data)=>{
        if(data.data){
            res.send({available: true});
        }else{
            res.send({available: false});
        }
        
    }).catch((e)=>{
        console.log(e);
    })
});
// app.post("/getAvailable")

app.post("/deletecurUser", (req,res)=>{
    users.deleteOne({userid: {$eq: req.body.userid}}).
    then(() => {
        console.log('deleted');
    }).catch((e) =>{
        console.log(e);
    });
    messages.deleteMany({sender: {$eq: req.body.strangerID}}).
    then(() => {
        console.log('stranger messages deleted');
    }).catch((e) =>{
        console.log(e);
    })
    messages.deleteMany({sender: {$eq: req.body.userid}}).
    then(() => {
        console.log('deleted');
    }).catch((e) =>{
        console.log(e);
    })
});

app.post("/deleteCom", (req,res)=>{
    admins.deleteOne({comm: {$eq: req.body.community}}).
    then(() => {
        console.log('admin deleted');
    }).catch((e) =>{
        console.log(e);
    });
    comMessages.deleteMany({comm: {$eq: req.body.community}}).
    then(() => {
        console.log('community messages deleted');
    }).catch((e) =>{
        console.log(e);
    })
    comusers.deleteMany({comm: {$eq: req.body.community}}).
    then(() => {
        console.log('community users messages deleted');
    }).catch((e) =>{
        console.log(e);
    })
});

app.post("/cleanup", (req,res)=>{
    users.deleteOne({userid: {$eq: req.body.userid}}).
    then(() => {
    }).catch((e) =>{
        console.log(e);
    });
    messages.deleteMany({sender: {$eq: req.body.userid}}).
    then(() => {
        console.log('cleaned up');
    }).catch((e) =>{
        console.log(e);
    })
});
app.post("/sendMessage", (req,res)=>{
    var timenow = new Date()
    let Messages = new messages({
        sender: req.body.sender,
        reciever: req.body.reciever,
        message: req.body.message,
        time: timenow.getHours()+":"+timenow.getMinutes()
    });
    Messages.save().
    then((data) => {
        if(!data){
            res.send(null);
        }else{
            res.send(data);
        }
    }).catch((e) =>{
        console.log(e);
    })
});

app.post("/sendComMessage", (req,res)=>{
    var timenow = new Date()
    let ComMessage = new comMessages({
        sender: req.body.sender,
        comm: req.body.community,
        message: req.body.message,
        time: timenow.getHours()+":"+timenow.getMinutes()
    });
    console.log(req.body);
    ComMessage.save().
    then((data) => {
        if(!data){
            res.send(null);
        }else{
            console.log('comMessage saved')
            res.send(data);
        }
    }).catch((e) =>{
        console.log(e);
    })
});

app.post("/getMessage", (req,res)=>{
    messages.find({$or: [{sender:{$eq:req.body.sender}},{sender:{$eq:req.body.reciever}}]}).
    then((data)=>{
        res.header( "Access-Control-Allow-Origin" );
        res.send(data);
    }).catch((e)=>{console.log(e)})
});

app.get("/chat", (req,res)=>{
});

app.post("/getComMessage", (req,res)=>{
    comMessages.find({comm:{$eq:req.body.community}}).
    then((data)=>{
        res.header( "Access-Control-Allow-Origin" );
        res.send(data);
    }).catch((e)=>{console.log(e)})
});

app.get("/chat", (req,res)=>{
});

app.listen(PORT,()=>{
    console.log(`Server is running on ${PORT}`)
})