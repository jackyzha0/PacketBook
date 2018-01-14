const lib = require('lib')({token: process.env.STDLIB_TOKEN});
const request = require('request');
const send = require('../../helpers/send.js');
const mongoose = require('mongoose');
const User = require("../../models/user");

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
		var balance = 0
		const User = require("../../models/user");
		if(err){throw err}
		if(user){processUser(user)}
		
		function processUser(user) {
			if(user){
				registered = true;
				balance = user.balance;
			}
		}
		
		if(Body.toLowerCase().split(" ")[0].trim() == "balance"){
			send(from.number, "Hi!  Your balance is "+balance+" "+process.env.CURRENCY, to.number);
		}
		
		else if(Body.toLowerCase().split(" ")[0].trim() == "faucet"){
			User.update({phone : from.number}, {$inc: {balance : 3}}, function(err, result){});
			send(from.number, "Sent you "+3+" "+process.env.CURRENCY);
		}

		else if(Body.toLowerCase().trim().substring(0,8) == "register"){
			if(registered == false){
				var newUser = new User();
				newUser.phone = from.number;
				newUser.balance = 10;
				newUser.save(function(err){
					send(from.number, "Thank you for registering", to.number);	
					if(err){throw err}
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
						if(!Body.toLowerCase().split(" ")[2]){
							send(from.number, "Please specify an amount to send.", to.number);
						}
						else if(isNaN(Body.toLowerCase().split(" ")[2])){
							send(from.number, Body.toLowerCase().split(" ")[2]+" is not a valid amount", to.number);
						}
						else if(parseFloat(Body.toLowerCase().split(" ")[2]) > balance){
							send(from.number, "Insufficient funds", to.number);
						}
						else if(parseFloat(Body.toLowerCase().split(" ")[2]) < 0){
							send(from.number, "Nice try.", to.number);
						}
						else{
							var transaction = parseFloat(Body.toLowerCase().split(" ")[2]);
							User.update({phone : from.number}, {$inc: {balance : -transaction}}, function(err, result){});
							User.update({phone : Body.toLowerCase().split(" ")[1]}, {$inc: {balance : transaction}}, function(err,result){});
							send(from.number, "Sent "+transaction+" "+process.env.CURRENCY+" to"+Body.toLowerCase().split(" ")[1]);
						}
					}
					else{
						send(from.number, "No user found with that phone number", to.number);
					}
				});
			}
		}
		
		else{
			send(from.number, ["Welcome to PacketBook.  Commands:","Register : Create a new account", "Balance : Check your balance", "Send <receipent phone> <amount> : Send money to another user", "Faucet : Receive free (fake) money"].join('\n'), to.number);
		}
		
	});
};
