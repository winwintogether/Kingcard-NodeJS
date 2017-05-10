function AlarmCallout() {

    checkforAlarms();
    
    //callout();
    //getPNStatus("989370844"); // This works.
    //bbCallout(); // test callout
    
    // sendEmail('billygbarnes2@gmail.com', 'testSite', 'testData', 'high', '99,000', '100', '10:56 PM 4/25/2016');
    
    //bbSMS("Hey there", "19183970217");
}



function checkforAlarms(){
    
    var al = tables.getTable('alarmlog');
    
    al.where({
        ack: 'false'
    }).read({
        success: function (items) {
            if(items.length == 0)
                console.log("Callout: no alarms.");
                
            var x;
            for(x=0; x<items.length; x++){
                console.log("Callout: " + items[x].tagid);
                getCalloutProfileName(items[x].tagid, items[x]);
            }
                
        }
    });    
}

function getCalloutProfileName(tagid, alarmLogRec){
    var rt = tables.getTable('realtime');
    rt.where({id: tagid}).read({success: function(items){
        if(items[0].calloutprofile != 'none'){
            if(items[0].calloutprofile != null){
                console.log("Callout profile for " + items[0].id + '->' + items[0].calloutprofile);  
                getCalloutProfileInfo(items[0].calloutprofile, tagid, alarmLogRec)              
            }
        }
        }
    });
}

function getCalloutProfileInfo(cpn, tagid, alarmLogRec){
    var cp = tables.getTable('calloutprofiles');
        cp.where({name: cpn}).read({success: function(items){
            console.log("Found callout profile: " + cpn + ", call = " + items[0].call);
            if(items[0].call == true){ 
                getUserPhoneNumber(items[0].user1, alarmLogRec);
            }
            if(items[0].email == true){
                emailUser(items[0].user1, alarmLogRec);
            }
            if(items[0].textmessage == true){
                console.log("texting " + items[0].user1);
                sendSMS(items[0].user1, alarmLogRec);
            }
        }
    });
}

function emailUser(userid, alarmRec){
    var u = tables.getTable('user');
    u.where({username: userid}).read({success: function(items){
            
        sendEmail(items[0].email, alarmRec);

        }
    });    
    
}
function sendEmail(toEmail, alarmLogRec) {
    var SendGrid = require('sendgrid').SendGrid;
    var sendgrid = new SendGrid('azure_e1628e3866347860307ec2199a86c3ba@azure.com', 'uJOpvRCUyvz9MT3');
    
    var altype = 'high';
    var alLimit = alarmLogRec.highlimit;
    if(alarmLogRec.lowalarm == 1){
        altype = 'low';
        alLimit = alarmLogRec.lowlimit;
    }
               
    var eSubject = 'VKS Alarm: ' + alarmLogRec.site;
    var eMessage = 'Site: ' + alarmLogRec.site + '\n\n' + 
                   'Tagname: ' + alarmLogRec.name + '\n\n' +
                   'Alarm: ' + altype + '\n\n' +
                   'Value: ' + alarmLogRec.value + '\n\n' + 
                   'Limit: ' + alLimit + '\n\n' + 
                   'Time: ' + alarmLogRec.lstimestamp;
    console.log('AlarmCallout: sending email.\n' + eMessage);
    sendgrid.send({
        to: toEmail,
        from: 'notifications@vikingscada-svc.azure-mobile.net',
        subject: eSubject,
        text: eMessage
    }, function(success, message) {
        // If the email failed to send, log it as an error so we can investigate
        if (!success) {
            console.error(message);
        }
    });
}

// NOTE: These queries return asynchronously.  So, can't return a value to a calling function.
// Dang it !!!
function getUserPhoneNumber(userid, alarmLogRec){
    //console.log('getUserPhone ' + userid);
    var u = tables.getTable('user');
        u.where({username: userid}).read({success: function(items){
            
            console.log("Calling " + userid + " at " + items[0].phone);
            makeCall(alarmLogRec, items[0].phone)
        
        }
    });
}

// dataName, alarmType, dataValue, dataUnits, phoneNumber
function makeCall(alarmLogRec, phoneNumber){
    console.log("Make call: " + alarmLogRec.site + ", " + 
    alarmLogRec.name + ", " + alarmLogRec.value + ", " + alarmLogRec.units + ", " + phoneNumber);
    
    // Make the call...
    var pns = createPNScript(alarmLogRec, phoneNumber)
    console.log("PNScript = " + pns);
    bbCallout(pns, phoneNumber);
    // Get Q id...
    
    // Loop: check call status...
    
    // Get call results...
    
    // Ack or ignore the alarm...
    
    // Escalate if required...
    
}

function createPNScript(alarmLogRec, phoneNumber){
    var altype = 'high';
    if(alarmLogRec.lowalarm == 1)
        altype = 'low';
        
        var pnScript = "~\\MaxRingTime(20)~~\\AssignDTMF(1|start)~~\\AssignDTMF(2|ack)~~\\SetVar(Attempt|1)~" + 
                    "Hello, this is a Viking Scaada alarm notification.  " +
                    "The site, " + alarmLogRec.site + 
                    ", " + alarmLogRec.name + " has a " + altype + " alarm, " + 
                    "and a value of " + alarmLogRec.value + " " + alarmLogRec.units + ". " +
                    "~\\Label(repeat)~" +
                    "Please press 2 to acknowledge this alarm, or press 1 to repeat this message." +
                    "~\\WaitForDTMF(6)~" +
                    "~\\ActOnDigitPress(false)~" +
                    "~\\IncreaseVariable(Attempt|1)~" + 
                    "~\\GotoIf(Attempt|3|AttemptEnd)~" +
                    "~\\Goto(repeat)~" +
                    "~\\Label(ack)~" +
                    "The alarm has been acknowledged." +
                    "~\\Label(AttemptEnd)~" +
                    ",Goodbye.";
    
    return pnScript;
}


function sendSMS(userid, alarmLogRec){
    
    var u = tables.getTable('user');
    u.where({username: userid}).read({success: function(items){
        var altype = 'high';
        var alLimit = alarmLogRec.highlimit;
        if(alarmLogRec.lowalarm == 1){
            altype = 'low';
            alLimit = alarmLogRec.lowlimit;
        }
        var msg = 'Site: ' + alarmLogRec.site + '\n\n' + 
                   'Tagname: ' + alarmLogRec.name + '\n\n' +
                   'Alarm: ' + altype + '\n\n' +
                   'Value: ' + alarmLogRec.value + '\n\n' + 
                   'Limit: ' + alLimit + '\n\n' + 
                   'Time: ' + alarmLogRec.lstimestamp;
        console.log('AlarmCallout: sending SMS.\n' + msg);   
        bbSMS(msg, items[0].phone);

        }
    });    
    
}
function bbSMS(message, phoneNumber){
    var smsURL= "http://sms2.cdyne.com/sms.svc/SimpleSMSSend?"
                                                            + "PhoneNumber=" + encodeURIComponent(phoneNumber)
                                                            + "&Message=" + encodeURIComponent(message)
                                                            + "&LicenseKey=42baabe4-5263-483b-bc19-e6b16e1ef6aa";
                                                            
    var httpRequest = require('request');  // https://www.npmjs.com/package/request

    httpRequest.get({
        url: smsURL
    }, function (err, response, body) {
        if (err) {
            console.log("SMS Notify Status:Error");
        } else if (response.statusCode !== 200) {
            console.log("SMS Notify Status: BAD REQUEST");
        } else {
            //console.log(body); // fyi: each console.log is a seperate entry in the log...
            console.log("SMS Notify Status:\n" + body);
        }

    });
}

function bbCallout(pnScript, phoneNumber) {
    var pnScriptold = "~\\MaxRingTime(20)~~\\AssignDTMF(1|start)~~\\AssignDTMF(2|ack)~~\\SetVar(Attempt|1)~" + 
                    "Hello, this is a Viking Scada alarm notification.  " +
                    "The test site tank level has a high alarm, and the tank level is 10 feet." +
                    "~\\Label(repeat)~" +
                    "Please press 2 to acknowledge this alarm, or press 1 to repeat this message." +
                    "~\\WaitForDTMF(6)~" +
                    "~\\ActOnDigitPress(false)~" +
                    "~\\IncreaseVariable(Attempt|1)~" + 
                    "~\\GotoIf(Attempt|3|AttemptEnd)~" +
                    "~\\Goto(repeat)~" +
                    "~\\Label(ack)~" +
                    "The alarm has been acknowledged." +
                    "~\\Label(AttemptEnd)~" +
                    ",Goodbye.";


    var httpRequest = require('request');  // https://www.npmjs.com/package/request
    // NR = PN.NotifyPhoneBasicWithTryCount(1, "19183970217", pnScript, "15555551234", "Viking SCADA", "0", "6536383a-55fe-432f-8e42-e4ab95c5fc11");
    var url = "http://ws.cdyne.com/NotifyWS/PhoneNotify.asmx/NotifyPhoneBasicWithTryCount?TryCount=1&PhoneNumberToDial=" +
                  encodeURIComponent(phoneNumber) +
                  "&TextToSay=" + encodeURIComponent(pnScript) +
                  "&CallerID=" + encodeURIComponent("15555551234") +
                  "&CallerIDname=" + encodeURIComponent("Viking SCADA") +
                  "&VoiceID=" + 0 +
                  "&LicenseKey=" + "f2cd7f62-6d3e-4cce-b5d9-d2b22afd17c4"; // "6536383a-55fe-432f-8e42-e4ab95c5fc11";

    httpRequest.get({
        url: url
    }, function (err, response, body) {
        if (err) {
            console.log("PhoneNotify Queue Status:Error");
        } else if (response.statusCode !== 200) {
            console.log("PhoneNotify Queue Status: BAD REQUEST");
        } else {
            //console.log(body); // fyi: each console.log is a seperate entry in the log...
            console.log("PhoneNotify Callout Status:\n" +
                "QueueID: " + getVal("QueueID") + "  \n" +
                "StartTime: " + getVal("StartTime") + "  \n" +
                "CallComplete: " + getVal("CallComplete") + "  \n");
                
                var q = getVal("QueueID");
                setTimeout(getPNStatus(q), 10000);
        }
        function getVal(name) {
            var st = body.search("<" + name + ">");
            if (st >= 0) {
                var st2 = body.search("</" + name + ">");
                var stt = body.slice(st + name.length + 2, st2);
                return stt;
            }
            else
                return "na";

        }
    });
}





//=================================================
// Get the status of a phone call by Queue ID
//3-22-16 Tested and working in Azure.
//-------------------------------------------------
function getPNStatus(Q) {

    var httpRequest = require('request');  // https://www.npmjs.com/package/request
    var url = 'http://ws.cdyne.com/NotifyWS/PhoneNotify.asmx/GetQueueIDStatus?QueueID=' + Q;

    httpRequest.get({
        url: url
    }, function (err, response, body) {
        if (err) {
            console.log("PhoneNotify Queue Status:Error");
        } else if (response.statusCode !== 200) {
            console.log("PhoneNotify Queue Status: BAD REQUEST");
        } else {
            //console.log(body); // fyi: each console.log is a seperate entry in the log...

                
                if(getVal("CallComplete") == 'false'){
                    setTimeout(getPNStatus(Q), 30000); // again...
                }
                else{
                     console.log("PhoneNotify Queue Status:\n" +
                    "QueueID: " + getVal("QueueID") + "  \n" +
                    "ResponseText: " + getVal("ResponseText") + "  \n" +
                    "DigitsPressed: " + getVal("DigitsPressed") + "  \n" +
                    "MachineDetection: " + getVal("MachineDetection") + "  \n" +
                    "StartTime: " + getVal("StartTime") + "  \n" +
                    "CallComplete: " + getVal("CallComplete") + "  \n");
                    
                    //var nums = getVal("DigitsPressed").split('|');
                    var i = getVal("DigitsPressed").search("2");
                    console.log('i = ' + i);
                    if(i >= 0){
                        // ack...
                        console.log("Alarm ack'ed");
                    }
                }
                    

        }
        function getVal(name) {
            var st = body.search("<" + name + ">");
            if (st >= 0) {
                var st2 = body.search("</" + name + ">");
                var stt = body.slice(st + name.length + 2, st2);
                return stt;
            }
            else
                return "na";

        }
    });
}