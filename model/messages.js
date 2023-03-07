var mongoose = require('mongoose');
var Schema = mongoose.Schema;

messageSchema = new Schema( {
	sender: String,
	reciever: String,
    message: String,
    time: String
}),
messages = mongoose.model('messages', messageSchema);

module.exports = messages;