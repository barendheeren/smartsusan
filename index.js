'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const restService = express();
restService.use(bodyParser.json());

restService.post('/hook', function (req, res) {

    console.log('hook request');

    try {
        var speech = '';
        var requestBody = req.body.result

        switch(requestBody.action) {
             case "smartsusan":
                 speech += 'Susan actie: ' + requestBody.parameters['geo-city'].length;
                break;
             case "smartpaula":
                 speech += 'Paula actie: ' + requestBody.fulfillment.speech;
                 break;
            case "who_are_you": //check if user is known 
                speech += 'Jij bent: ' + requestBody.sessionId + '. ' + requestBody.fulfillment.speech;
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

            //return res.json({
                //speech: speech,
               // contextOut: [
               //     {
               //         "name": "PAM",
              //          "parameters": {
               //             "pam_total": PAM 
                //        }, 
              //          "lifespan": 1
               //     }
              //  ],
                //displayText: speech,
//                event:{
 //                   "name":"pam_calculate",
 //                   "data":{
 //                       "pam_total":PAM
 //                       }
 //               },
 //               source: 'smartsusan'
 //           });   



//   try {
//        var speech = 'empty speech';

//       if (req.body) {
//            var requestBody = req.body;

//            if (requestBody.result) {
//                speech = '';

//                if (requestBody.result.fulfillment) {
//                    speech += requestBody.result.fulfillment.speech + 'Barend';
//                    speech += ' ';
//                }

//                if (requestBody.result.action) {
//                    speech += 'action: ' + requestBody.result.action;
//                }
//            }
//        }

//        console.log('result: ', speech);

//        return res.json({
//            speech: speech,
//            displayText: speech,
//            source: 'smartsusan'
//        });
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
