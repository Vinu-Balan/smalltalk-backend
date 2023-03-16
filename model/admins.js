var mongoose = require('mongoose');
var Schema = mongoose.Schema;

adminSchema = new Schema( {
    comm: String,
	adminid: String,
	adminpass: String
}),
admins = mongoose.model('admin', adminSchema);

module.exports = admins;