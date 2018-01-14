## The Problem
 
Around two billion of the world's adult population is considered unbanked, meaning that they do not have access to a "transaction account" - a bank account or e-wallet that can send, receive and store money.  Many unbanked people live in rural, marginalized communities in the developing world, without access to newer technologies.  Fortunately, mobile phone penetration in the developing world is quite high, at over 80%; however, most of these phones are not smartphones, and they lack the capabilities to run modern apps or connect to the internet.
 
## Our solution
 
Our solution is a chatbot, fully accessible through the SMS (text messaging) protocol.  Users are able to issue simple commands to register, check their balance, deposit, withdraw, and send money.  PacketBook is unique in that it leverages the Stellar blockchain and tokens (XLM) for its transactions.  Stellar is currently the eighth largest cryptocurrency, with a market cap of over $10B, and has gained support from Patrick Collison (CEO of Stripe), Sam Altman (President of Y-Combinator), and IBM.  Stellar also has extremely low transaction fees (around 1/100 of a cent per transaction), making it the perfect choice for a microfinance project.
 
The application is perfectly usable on the Stellar main network, but is currently deployed to the testnet.  All new registrations receive 10000 (fake) XLM that they can transact through the chatbots.
 
The testnet blockchain is viewable online.  Here is a link to one of the addresses we used for testing: http://testnet.stellarchain.io/address/GCPTH5W3Q7MES3GRQTJGLW7OMKFBFBXMELKN7GJX24FJV4IB7DL2QBUY
 
## How we built it
 
As it stands right now, our project is a bit of a hodgepodge.  The majority of PacketBook is written in Node.js and deployed on [Stdlib](https://stdlib.com/).  We're using Twilio to hand messaging and calls.  We also have some Python code on a Heroku dyno that handles authentication.  In addition, we use a Mongo database running online to handle the few bits of user data that are collected (mainly phone #'s and crypto keys).  
 
## Challenges we ran into
 
Our biggest challenge by far was authentication.  Because our product needed to be accessible entirely by text messages, there weren't many options to make our bot secure.  We couldn't implement things such as 2FA because our target users don't really have any other "factors" for authentication. Some other major hurdles that we passed were language support in many of the libraries we used--especially since we used a fusion of JS and Python.
 
## Accomplishments that we're proud of
 
We're pretty proud of just having a working product that solves a real-world need.  This was our first hackathon so we didn't really know what to expect, but we're glad to be able to show off something that we finished and are proud of.
 
## What we learned
 
We decided on using a phone-call verification method that involes keeping and memorizing a 6-digit 'key' or 'password'. In addition, we created dummy encryption methods for the on-site resources such as Twilio login, and stronger encryption methods such as AES-256-CTR for transactions. Both which were new technologies for us.
 
## What's next for PacketBook
Add support for currency exchange
Clean up the code
Google DialogFlow Implementation
Expand Twilio platform to support more users
 
## Check it out for yourself!
Text 'Hi' to +1 604 670 8545
*May or may not work depending on how many registered devices
