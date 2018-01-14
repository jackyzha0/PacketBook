from flask import Flask, request
from datetime import datetime
from get_twilio_info import read,vig
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Gather, Say
app = Flask(__name__)

inf = read("hacksnw123")
t_client = Client(inf[0],inf[1])

call = t_client.calls.create(
    to="+17789568798",
    from_="+16046708545",
    url="https://polar-bastion-19391.herokuapp.com/"
)
@app.route("/", methods=['GET', 'POST'])
@app.route("/validate", methods=['GET', 'POST'])
def validate(_num_digits=6,_timeout=10):
    """Respond to incoming phone calls with a menu of options"""
    # Start our TwiML response
    resp = VoiceResponse()
    # Start our <Gather> verb
    # num_digits is how many digits in authentication
    gather = Gather(num_digits=_num_digits,timeout=_timeout,action='/gather')
    gather.say('Please enter your 6 digit passcode.')
    resp.append(gather)
    print(str(resp))
    resp.redirect('/validate')
    return str(resp)

@app.route('/gather', methods=['GET', 'POST'])
def gather():
    """Processes results from the <Gather> prompt in /voice"""
    # Start our TwiML response
    resp = VoiceResponse()

    # If Twilio's request to our app included already gathered digits,
    # process phone,them
    if 'Digits' in request.values:
        # Get which digit the caller chose
        dig = request.values['Digits']

        print(choice)
        resp.say("Your code is "+str(dig))

    fin = vin(str(resp))
    return str(resp)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
