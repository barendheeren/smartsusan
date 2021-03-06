'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const frontofficeid = 1533050426761050;

const restService = express();
//restService.listen((process.env.PORT || 5000));
restService.use(bodyParser.urlencoded({extended: false}));
restService.use(bodyParser.json());

// Server frontpage
restService.get('/', function (req, res) {
    res.send('This is Susan, your companion.');
});
// Server frontpage
restService.get('/hook', function (req, res) {
    //if (req.query['hub.verify_token'] === 'testbot_verify_token') {
    if (req.query['hub.FB_VERIFY_TOKEN'] === 'paula') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

//send message to other fb messenger recipient
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.FB_PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: {
            //recipient: { id: frontofficeid },
            recipient: { id: recipientId },
            message: message,
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

restService.post('/hook', function (req, res) {

    console.log('hook request');

    try {
        var speech = '';
        var requestBody = req.body.result

        switch(requestBody.action) {
             case "smartsusan":
                 speech += 'Susan actie: ' + requestBody.parameters['geo-city'].length;
                break;
            case "who_are_you": //check if user is known 
                //restService.use(bodyParser.urlencoded({ extended: false }));
                //restService.listen((process.env.PORT || 5000));
                var events = req.body.entry[0].messaging;
                for (i = 0; i < events.length; i++) {
                    var event = events[i];
                    if (event.message && event.message.text) {
                        //sendMessage(req.body.result.sender.id, { text: "Gebruiker " + req.body.result.sender.id + " zei: " + event.message.text });
                    }
                }
                //return res.sendStatus(200);
       
                //speech += 'Jij bent: ' + req.body.sessionId + '. Ik ben Paula. ' + requestBody.fulfillment.speech;
                speech += 'Jij bent: ' + requestBody.sender.id + '. Ik ben Paula. ' + requestBody.fulfillment.speech;

                return res.json({
                    speech: speech,
                    displayText: speech,
                    source: 'smartsusan'
                });
                break;
            case "pam_sum": //calculate PAM score
                var PAM = 0;
                if (isNaN(parseInt(requestBody.parameters['pam_score']))) { //option n.v.t. returns NaN, rest a value
                    PAM = parseInt(requestBody.parameters['pam_total']);
                    //speech += "eentje tellen " + requestBody.parameters['pam_total'];
                } else {
                    PAM = parseInt(requestBody.parameters['pam_score']) + parseInt(requestBody.parameters['pam_total']);
                    //speech += "beide tellen " + requestBody.parameters['pam_score'];
                }
                return res.json({
                    //speech: speech,
                    //displayText: speech,
                    contextOut: [
                        {
                            "name": "PAM",
                            "parameters": {
                                "pam_total": PAM 
                            }, 
                            "lifespan": 1
                        }
                    ],
                    source: 'smartsusan'
                });
                break;
            case "pam_calculate": //display calculate PAM total score
                var PAM = 0;
                if (isNaN(parseInt(requestBody.parameters['pam_score']))) {
                    PAM = parseInt(requestBody.parameters['pam_total']);
                } else {
                    PAM = parseInt(requestBody.parameters['pam_score']) + parseInt(requestBody.parameters['pam_total']);
                }
                return res.json({
                    followupEvent:{
                         "name":"PAM_calculate",
                         "data":{
                             "pam_total": PAM
                      }
                     },
                    source: 'smartsusan'
                });
                break;             
            default:
                 speech += 'Sorry, de actie is niet bekend.';
        //	   Call assistant.ask('which component, which state');
            }

            console.log('result: ', speech);


    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

restService.listen((process.env.PORT || 5000), function () {
    console.log("Server listening");
});
