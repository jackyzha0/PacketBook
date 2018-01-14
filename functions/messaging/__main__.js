const lib = require('lib')({token: process.env.STDLIB_TOKEN});
const request = require('request');
const send = require('../../helpers/send.js');
const mongoose = require('mongoose');
const User = require("../../models/user");
const curl = require('curl');
var StellarSdk = require('stellar-sdk');
var Cryptr = require('cryptr')

/**
* Main messaging (SMS/MMS) handler. Upon receiving a message, first check to
*		see if there's media (MMS), if so, invoke __notfound__ handler with a media
*		object, otherwise, check to see if message corresponds to a handler (more,
*		whoami), invoke that if possible, or invoke __notfound__ with raw contents
*		of message body.
* @param {string} Body The message contents
* @param {string} From The inbound number
* @param {string} FromZip The zip associated with inbound number
* @param {string} FromCity The city associated with inbound number
* @param {string} FromState The state associated with inbound number
* @param {string} FromCountry The country associated with inbound number
* @param {string} To The outbound number, i.e. your Twilio Number
* @param {string} ToZip The zip associated with outbound number
* @param {string} ToCity The city associated with outbound number
* @param {string} ToState The state associated with outbound number
* @param {string} ToCountry The country associated with outbound number
* @param {string} AccountSid The Twilio Account SID - sent from Twilio, used to verify webhook authenticity
* @returns {object}
*/



module.exports = (
	Body = '',
	From = '',
	FromZip = '',
	FromCity = '',
	FromState = '',
	FromCountry = '',
	To = '',
	ToZip = '',
	ToCity = '',
	ToState = '',
	ToCountry = '',
	AccountSid = '',
	context,
	callback
) => {

	if (context.service.environment !== 'local' && process.env.TWILIO_ACCOUNT_SID !== AccountSid) {
		return callback(new Error('Can only invoke from valid Twilio Webhook'));
	}
	
	function sendStellar(senderPriv, receiverPub, amnt){
		StellarSdk.Network.useTestNetwork();
		var server = new StellarSdk.Server("https://horizon-testnet.stellar.org");
		var sourceKeys = StellarSdk.Keypair.fromSecret(senderPriv);
		var destinationId = receiverPub;
		var transaction;
	
		
		server.loadAccount(destinationId)
		  .catch(StellarSdk.NotFoundError, function (error) {
		    	send(from.number, "Nonexistant address" , to.number);
		    	throw error;
		  })
		  .then(function() {
		    return server.loadAccount(sourceKeys.publicKey());
		  })
		  .then(function(sourceAccount) {
		    transaction = new StellarSdk.TransactionBuilder(sourceAccount)
		      .addOperation(StellarSdk.Operation.payment({
		        destination: destinationId,
		        asset: StellarSdk.Asset.native(),
		        amount: amnt.toString()
		      }))
		      .addMemo(StellarSdk.Memo.text('Test Transaction'))
		      .build();
		    transaction.sign(sourceKeys);
		    return server.submitTransaction(transaction);
		  })
		  .then(function(result) {
		  	send(from.number, "Successfully sent " + amnt + " " + process.env.CURRENCY, to.number);
		    console.log('Success! Results:', result);
		  })
		  .catch(function(error) {
		    console.error('Something went wrong!', error);
		  });
				
			}
	

	// Create some developer-friendly to / from objects
	let from = {
		number: From,
		zip: FromZip,
		city: FromCity,
		state: FromState,
		country: FromCountry
	};

	let to = {
		number: To,
		zip: ToZip,
		city: ToCity,
		state: ToState,
		country: ToCountry
	};
	
	var uri = process.env.URI;
	var registered = false;
	
	mongoose.connect(uri);
	mongoose.Promise = global.Promise;
	

	User.findOne({phone: from.number}, function(err, user){
		var pubkey;
		const User = require("../../models/user");
		if(err){throw err}
		if(user){processUser(user)}
		function processUser(user) {
			if(user){
				registered = true;
				pubkey = user.pubkey;
			}
		}
		
		
		if(Body.toLowerCase().split(" ")[0].trim() == "balance"){
			lib[`${context.service.identifier}.stellar.${'balance'}`]({
					pubkey: pubkey
				}, (err, result) => {
					send(from.number, "Hi!  Your balance is "+result+" "+process.env.CURRENCY, to.number);
			});
			
		}

		else if(Body.toLowerCase().trim().substring(0,8) == "register"){
			if(registered == false){
				var newUser = new User();
				newUser.phone = from.number;
				lib[`${context.service.identifier}.stellar.${"keypair"}`]((err,keys) => {
					var pin = Math.floor(Math.random() * 899999) + 100000;
					curl.get('http://polar-bastion-19391.herokuapp.com/encrypt/'+pin, function(err, cryptpin, body) {
						if(err){throw err}
						var cryptr = new Cryptr(cryptpin.body.toString());
						newUser.pubkey = keys[0];
						newUser.privkey = cryptr.encrypt(keys[1]);
						newUser.save(function(err){  
							send(from.number, "Thank you for registering. You have been credited with 10,000 XLM to start.  Your PIN is "+pin+", remember it.", to.number);	
							if(err){throw err}
						});
					});
					
					
					//add initial testnet stellar
					
					curl.get("https://horizon-testnet.stellar.org/friendbot?addr="+keys[0]);
					
					
				});
			}
			else{
				send(from.number, "You are already registered", to.number);
			}
		}
		
		else if(Body.toLowerCase().split(" ")[0] == "send" && registered){
			if(!Body.toLowerCase().split(" ")[1]){
				send(from.number, "Please specify a phone number to send money to", to.number);
			}
			else{
				var toSend = Body.toLowerCase().split(" ")[1];
				User.findOne({"phone": toSend}, function(err, result){
					if(err){throw err}
					if(result){
						lib[`${context.service.identifier}.stellar.${'balance'}`]({
							pubkey: pubkey
						}, (err, balance) => {
							if(!Body.toLowerCase().split(" ")[2]){
								send(from.number, "Please specify an amount to send.", to.number);
							}
							else if(isNaN(Body.toLowerCase().split(" ")[2])){
								send(from.number, Body.toLowerCase().split(" ")[2]+" is not a valid amount", to.number);
							}
							else if(parseFloat(Body.toLowerCase().split(" ")[2]) > balance){
								send(from.number, "Insufficient funds", to.number);
							}
							else if(parseFloat(Body.toLowerCase().split(" ")[2]) <= 0){
								send(from.number, "Nice try.", to.number);
							}
							else{
								if(!Body.toLowerCase().split(" ")[3]){
									send(from.number, "Please provide your PIN to authorize the transaction", to.number);
								}
								else{
								curl.get('http://polar-bastion-19391.herokuapp.com/encrypt/'+Body.toLowerCase().split(" ")[3], function(err, cryptpin, body) {
									var cryptr = new Cryptr(cryptpin.body.toString());
									var senderSecret = cryptr.decrypt(user.privkey)
									var legit = true;
									try{
										var sourceKeys = StellarSdk.Keypair.fromSecret(senderSecret);	
									}
									catch(err){
										send(from.number, "Invalid PIN", to.number);
										legit = false;
									}
									if(legit){
										sendStellar(senderSecret, result.pubkey, parseFloat(Body.toLowerCase().split(" ")[2]));
									}
									
								});
								}
								
							}
						});
					}
					else{
						send(from.number, "No user found with that phone number", to.number);
					}
				});
			}
		}
		
		else if(Body.toLowerCase().split(" ")[0] == "withdraw" && registered){
			if(!Body.toLowerCase().split(" ")[1]){
				send(from.number, "Please specify a Stellar address to send money to", to.number);
			}
			else{
				lib[`${context.service.identifier}.stellar.${'balance'}`]({
							pubkey: pubkey
						}, (err, balance) => {
							if(!Body.toLowerCase().split(" ")[2]){
								send(from.number, "Please specify an amount to send.", to.number);
							}
							else if(isNaN(Body.toLowerCase().split(" ")[2])){
								send(from.number, Body.toLowerCase().split(" ")[2]+" is not a valid amount", to.number);
							}
							else if(parseFloat(Body.toLowerCase().split(" ")[2]) > balance){
								send(from.number, "Insufficient funds", to.number);
							}
							else if(parseFloat(Body.toLowerCase().split(" ")[2]) <= 0){
								send(from.number, "Nice try.", to.number);
							}
							else{
								//sendStellar(user.privkey, Body.toUpperCase().split(" ")[1], parseFloat(Body.toLowerCase().split(" ")[2]))
								if(!Body.toLowerCase().split(" ")[3]){
									send(from.number, "Please provide your PIN to authorize the transaction", to.number);
								}
								else{
								curl.get('http://polar-bastion-19391.herokuapp.com/encrypt/'+Body.toLowerCase().split(" ")[3], function(err, cryptpin, body) {
									var cryptr = new Cryptr(cryptpin.body.toString());
									var senderSecret = cryptr.decrypt(user.privkey)
									var legit = true;
									try{
										var sourceKeys = StellarSdk.Keypair.fromSecret(senderSecret);	
									}
									catch(err){
										send(from.number, "Invalid PIN", to.number);
										legit = false;
									}
									if(legit){
										sendStellar(senderSecret, Body.toUpperCase().split(" ")[1], parseFloat(Body.toLowerCase().split(" ")[2]));
									}
									
								});
								}
							}
						});	
			}
		}
		
		else if(Body.toLowerCase().split(" ")[0] == "deposit" && registered){
			send(from.number, "Deposit address: "+pubkey, to.number);
		}
		
		else{
			send(from.number, ["Welcome to PacketBook.  You must register before using most features.  Commands:","Register : Create a new account", "Balance : Check your balance", "Send <phone #> <amount> <PIN>: Send money to another user", "Withdraw <stellar addr> <amount> <pin> : Withdraw money to Stellar (testnet) address", "Deposit : View deposit address"].join('\n'), to.number);
		}
		
	});
};
