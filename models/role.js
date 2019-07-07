var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Role = new Schema({
	name: {
		type: String,
		index: true,
		trim: true,
		unique: true
	}
});

module.exports = mongoose.model('User_Role', Role);