#!/usr/local/bin/python
import base64

_encode = False
#hacksnw123

def vig(txt='', key='', typ='d'):
    k_len = len(key)
    k_ints = [ord(i) for i in key]
    txt_ints = [ord(i) for i in txt]
    ret_txt = ''
    for i in range(len(txt_ints)):
        adder = k_ints[i % k_len]
        if typ == 'd':
            adder *= -1

        v = (txt_ints[i] - 32 + adder) % 95

        ret_txt += chr(v + 32)

    return ret_txt

def read(key,file_path='inf.txt'):
    with open("inf.txt", "r") as f:
        _id = f.readline()[:-2]
        _pass = f.readline()[:-2]
        return vig(txt=_id,key=key,typ='d'),vig(txt=_pass,key=key,typ='d')

if _encode:
    key = raw_input('key: ')
    f = open("inf.txt", "r")
    l = f.readlines()
    f.close()
    f = open("inf.txt", "w")
    f.write(vig(txt=l[0],key=key,typ='e')+'\n')
    f.write(vig(txt=l[1],key=key,typ='e'))
    f.close()
