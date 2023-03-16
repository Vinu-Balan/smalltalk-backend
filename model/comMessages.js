var mongoose = require('mongoose');
var Schema = mongoose.Schema;

CommessageSchema = new Schema( {
	sender: String,
	comm: String,
    message: String,
    time: String
}),
comMessages = mongoose.model('Commessages', CommessageSchema);

module.exports = comMessages;