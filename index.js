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
            case "pam_sum": //calculate PAM aggregate score
                var PAM = 0;
                PAM = Number(requestBody.parameters['pam_score']) + Number(requestBody.parameters['pam_total']);
                speech += 'pam_sum waarde: ' + PAM;
                break;
             default:
                 speech += 'Sorry, de actie is niet bekend.';
        //	   Call assistant.ask('which component, which state');
            }

            console.log('result: ', speech);

            return res.json({
                speech: speech,
                parameters['pam_total']: PAM,
                displayText: speech,
                source: 'smartsusan'
            });   



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