var mongoose = require('mongoose');
var Schema = mongoose.Schema;

userSchema = new Schema( {
	userid: String,
	status: String
}),
users = mongoose.model('user', userSchema);

module.exports = users;