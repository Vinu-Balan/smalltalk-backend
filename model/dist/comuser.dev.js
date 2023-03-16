"use strict";

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
comuserSchema = new Schema({
  userid: String,
  comm: String,
  status: String
}), comusers = mongoose.model('comuser', comuserSchema);
module.exports = comusers;