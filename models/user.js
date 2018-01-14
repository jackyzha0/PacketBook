var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
   
   phone : String,
   balance: Number,
   pin : String
    
});

module.exports = mongoose.model('User', userSchema);