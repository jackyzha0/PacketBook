from __future__ import print_function
from datetime import datetime
from get_twilio_info import read,vig
from twilio.rest import Client
from flask import Flask, request, redirect
from twilio.twiml.voice_response import VoiceResponse, Gather, Say, Hangup
import logging
from logging.handlers import RotatingFileHandler

curr_p = ''
k_dic = {"":""}

app = Flask(__name__)
inf = read("hacksnw123")
t_client = Client(inf[0],inf[1])

def setPhone(phn):
    global curr_p
    curr_p = phn
def setDic(key,item):
    global k_dic
    k_dic[key] = item

@app.route('/encrypt/<pin>', methods=['GET'])
def encryptPin(pin):
    return vig(str(pin),'hacksnw123','e')

@app.route('/getPin/<phone>', methods=['GET'])
def getPin(phone):
    global k_dic
    print(k_dic)
    return str(k_dic[phone])

@app.route("/", methods=['GET', 'POST'])
@app.route("/app", methods=['GET', 'POST'])
@app.route("/app/voice", methods=['GET', 'POST'])
def voice(_num_digits=6,_timeout=10):
    """Respond to incoming phone calls with a menu of options"""
    # Start our TwiML response
    resp = VoiceResponse()
    app.logger.error("")
    # Start our <Gather> verb
    # num_digits is how many digits in authentication
    gather = Gather(num_digits=_num_digits,timeout=_timeout,action='/app/gather')
    gather.say('Please enter your 6 digit passcode.')
    resp.append(gather)
    return str(resp)

@app.route('/app/gather', methods=['GET', 'POST'])
def gather():
    """Processes results from the <Gather> prompt in /voice"""
    # Start our TwiML response
    resp = VoiceResponse()

    # If Twilio's request to our app included already gathered digits,
    # process phone,them
    if 'Digits' in request.values:
        dig = request.values['Digits']
        resp.say("Your code is "+str(dig))
        #print(str(dig))
        global curr_p
        global k_dic
        print(curr_p,k_dic)
        #k_dic[curr_p] = str(vig(str(dig),'hacksnw123','e'))
        setDic(curr_p,str(vig(str(dig),'hacksnw123','e')))
        #print('curr_p',curr_p)
        #print('dig',str(vig(str(dig),'hacksnw123','e')))
        print('dic',k_dic)
        return str(resp)
    else:
        resp.say("Please try again")
        resp.redirect('/app/voice')
    return str(resp)

@app.route('/app/verify/<phone>', methods=['GET'])
def verify(phone):
    resp = VoiceResponse()
    setPhone(phone)
    call = t_client.api.account.calls.create(to=curr_p, from_="+16046708545",url="https://polar-bastion-19391.herokuapp.com/")
    return redirect('/')

def inp():
    app.run(debug=True)
