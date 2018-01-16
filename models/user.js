var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
   
   phone : String,
   balance: Number,
   pubkey: String,
   privkey: String, //not real private key, this is encrypted by a cypher of the PIN
   pin : String
    
});

module.exports = mongoose.model('User', userSchema);