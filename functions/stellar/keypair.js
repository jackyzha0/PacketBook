
/**
* Generates Stellar Keypairs 
*/

module.exports = (callback) => {
	const Keypair = require('stellar-base').Keypair;
	var newAccount = Keypair.random();
	var pubkey = newAccount.publicKey();
	var privkey = newAccount.secret();
	console.log(pubkey);
	console.log(privkey);
	callback(null, [pubkey, privkey]);
};