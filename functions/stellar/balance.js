//Gets balance of Stellar Account

module.exports = (pubkey = '', callback) => {
	var StellarSdk = require('stellar-sdk');
	var server = new StellarSdk.Server(process.env.STELLAR_URL);
	server.accounts()
	.accountId(pubkey)
	.call()
	.then(function (accountResult) {
    	for(var i=0;i<accountResult.balances.length;i++){
    		if(accountResult.balances[i].asset_type == "native"){
    			callback(null,accountResult.balances[i].balance);
    		}
    	}
	})
	.catch(function (err) {
    console.error(err);
	})
	

};

		