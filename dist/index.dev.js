"use strict";

var express = require('express');

var cors = require('cors');

bodyParser = require('body-parser');

var mongoose = require("mongoose");

mongoose.set('strictQuery', true);
mongoose.connect('mongodb+srv://vinubalan:8838010007dhanda@smalltalk.9khi7h3.mongodb.net/?retryWrites=true&w=majority').then(function () {
  console.log('connected to mongo');
})["catch"](function (err) {
  console.error('failed to connect with mongo');
  console.error(err);
});

var users = require("./model/users.js");

var messages = require("./model/messages.js");

var app = express();
var PORT = 'https://smalltalk-backend.onrender.com';
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json()); // Route to get all posts

app.get("/getOnlineUsers", function (req, res) {
  users.find().then(function (data) {
    console.log(data);
    res.send({
      data: data
    });
  })["catch"](function (e) {
    console.log(e);
  });
});
app.post("/chat", function (req, res) {
  var Users = new users({
    userid: req.body.userid,
    status: "available"
  });
  Users.save().then(function () {
    res.send("updated");
    console.log(req.body.userid);
  })["catch"](function (err) {
    console.log(err);
  });
});
app.post("/connectStranger", function (req, res) {
  users.findOne({
    $and: [{
      $sample: {
        $size: 1
      }
    }, {
      userid: {
        $ne: req.body.userid
      }
    }, {
      status: "available"
    }]
  }).then(function (data) {
    if (!data) {
      res.send(null);
    } else {
      res.send(data);
      users.updateOne({
        userid: data.userid
      }, {
        $set: {
          status: "busy"
        }
      }).then(function () {
        console.log("user busy");
      });
    }
  })["catch"](function (e) {
    console.log(e);
  });
});
app.post("/connectNext", function (req, res) {
  users.updateOne({
    userid: req.body.userid
  }, {
    $set: {
      status: "available"
    }
  }).then(function () {
    console.log("user available");
  });
  users.updateOne({
    userid: req.body.strangerID
  }, {
    $set: {
      status: "available"
    }
  }).then(function () {
    console.log("stranger made available");
  });
  messages.deleteMany({
    $or: [{
      sender: {
        $eq: req.body.userid
      }
    }, {
      reciever: {
        $eq: req.body.userid
      }
    }, {
      sender: {
        $eq: req.body.strangerID
      }
    }, {
      reciever: {
        $eq: req.body.strangerID
      }
    }]
  }).then(function () {
    console.log('deleted');
  })["catch"](function (e) {
    console.log(e);
  });
});
app.post("/checkConnection", function (req, res) {
  users.find({
    $and: [{
      userid: req.body.userid
    }, {
      status: "available"
    }]
  }).then(function (data) {
    if (data.data) {
      res.send({
        available: true
      });
    } else {
      res.send({
        available: false
      });
    }
  })["catch"](function (e) {
    console.log(e);
  });
}); // app.post("/getAvailable")

app.post("/deletecurUser", function (req, res) {
  users.deleteOne({
    userid: {
      $eq: req.body.userid
    }
  }).then(function () {
    console.log('deleted');
  })["catch"](function (e) {
    console.log(e);
  });
  messages.deleteMany({
    sender: {
      $eq: req.body.strangerID
    }
  }).then(function () {
    console.log('stranger messages deleted');
  })["catch"](function (e) {
    console.log(e);
  });
  messages.deleteMany({
    sender: {
      $eq: req.body.userid
    }
  }).then(function () {
    console.log('deleted');
  })["catch"](function (e) {
    console.log(e);
  });
});
app.post("/sendMessage", function (req, res) {
  var timenow = new Date();
  var Messages = new messages({
    sender: req.body.sender,
    reciever: req.body.reciever,
    message: req.body.message,
    time: timenow.getHours() + ":" + timenow.getMinutes()
  });
  Messages.save().then(function (data) {
    if (!data) {
      res.send(null);
    } else {
      res.send(data);
    }
  })["catch"](function (e) {
    console.log(e);
  });
});
app.post("/getMessage", function (req, res) {
  messages.find({
    $or: [{
      sender: {
        $eq: req.body.sender
      }
    }, {
      sender: {
        $eq: req.body.reciever
      }
    }]
  }).then(function (data) {
    res.header("Access-Control-Allow-Origin");
    res.send(data);
  })["catch"](function (e) {
    console.log(e);
  });
});
app.get("/chat", function (req, res) {});
app.listen(PORT, function () {
  console.log("Server is running on ".concat(PORT));
});