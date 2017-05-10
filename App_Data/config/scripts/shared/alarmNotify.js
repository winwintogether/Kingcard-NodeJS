// NOTE: NO APP SERVICE RESTART REQUIRED FOR CODE CHANGES !!!!

    var sql = require('sqlserver');
    var gconn_str = "Driver={SQL Server Native Client 11.0};Server=tcp:vks.database.windows.net,1433;Database=vikingscada-db;Uid=vksAdmin@vks;Pwd=Viking16;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;";

exports.alarmEngine = function(alarmLogRec){
    getCalloutProfileName(alarmLogRec);
};

exports.alarmEscalation = function(){
	console.log("ALARM ESCALATION 22---------------------------------------------");
   // return;

	var query = "SELECT * FROM vikingscada_svc.alarmlog where ack = 'False' and notifycount >= 1 and notifycount < 3";
    
	sql.open(gconn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection! " + err);
            return;
        }
        conn.query(query, function (err, results) {
            if (err) {
                console.log("Error running query!");
                return;
            }

            for (var i = 0; i < results.length; i++) {
                console.log("alarmlogid: " + results[i].id);
				console.log("tagid: " + results[i].tagid);  
	           var nTime = results[i].notifytimestamp;
               //nTime = Date.now() - nTime;
               var d = Date.parse(nTime);
                d = Date.now() - d; //ms
                d = d / 60 / 1000; 
               console.log("nTime: " + d + " minutes");
               console.log("nCount: " + results[i].notifycount);
               if(d>3 && results[i].notifycount < 3){
                   
                   getCalloutProfileName(results[i]);
               }
            }
            console.log('Done --------------------------------------------------------\n');
        }); 
    }); // sql.open    
    

};

function db(){
    var query = "SELECT * FROM vikingscada_svc.alarmlog WHERE ack = 'False'";
	sql.open(gconn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection! " + err);
            return;
        }
        conn.query(query, function (err, items) {
            if (err) {
                console.log("Error running query!");
                return;
            }
            // success:

        }); 
    }); // sql.open 
}
function getCalloutProfileName(alarmLogRec) {
    console.log("VIKINGSCADA: getCalloutProfileName() tagid: " + alarmLogRec.tagid);
    var query = "SELECT * FROM vikingscada_svc.realtime WHERE id = '" + alarmLogRec.tagid + "'";
    sql.open(gconn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection! " + err);
            return;
        }
        conn.query(query, function (err, items) {
            if (err) {
                console.log("Error running query!");
                return;
            }
            if (items[0].calloutprofile != 'none') {
                if (items[0].calloutprofile != null) {
                    console.log("Callout profile for " + items[0].id + '->' + items[0].calloutprofile);
                    getCalloutProfileInfo(items[0].calloutprofile, alarmLogRec);
                }
            }

        }); 
    }); // sql.open 
}

function getCalloutProfileInfo(cpn, alarmLogRec) {
    console.log("VIKINGSCADA: getCalloutProfileInfo().");
    var query = "SELECT * FROM vikingscada_svc.calloutprofiles WHERE name = '" + cpn + "'";
	sql.open(gconn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection! " + err);
            return;
        }
        conn.query(query, function (err, items) {
            if (err) {
                console.log("Error running query!");
                return;
            }
            if(alarmLogRec.notifycount == null || alarmLogRec.notifycount ==0){
                console.log("Found callout profile: " + cpn + ", call = " + items[0].call);
                if (items[0].call == true) {
                    logNotificationAttempt(alarmLogRec);
                    getUserPhoneNumber(items[0].user1, alarmLogRec);
                }
                if (items[0].email == true) {
                    logNotificationAttempt(alarmLogRec);
                    emailUser(items[0].user1, alarmLogRec);
                }
                if (items[0].textmessage == true) {
                    logNotificationAttempt(alarmLogRec);
                    console.log("texting " + items[0].user1);
                    sendSMS(items[0].user1, alarmLogRec);
                }                       
           }
           else if(alarmLogRec.notifycount == 1){
                console.log("Found callout profile: " + cpn + ", call2 = " + items[0].call2);
                if (items[0].call2 == true) {
                    logNotificationAttempt(alarmLogRec);
                    getUserPhoneNumber(items[0].user2, alarmLogRec);
                }
                if (items[0].email2 == true) {
                    logNotificationAttempt(alarmLogRec);
                    emailUser(items[0].user2, alarmLogRec);
                }
                if (items[0].textmessage2 == true) {
                    logNotificationAttempt(alarmLogRec);
                    console.log("texting " + items[0].user2);
                    sendSMS(items[0].user2, alarmLogRec);
                }                       
           }
           else if(alarmLogRec.notifycount == 2){
                console.log("Found callout profile: " + cpn + ", call3 = " + items[0].call3);
                if (items[0].call3 == true) {
                    logNotificationAttempt(alarmLogRec);
                    getUserPhoneNumber(items[0].user3, alarmLogRec);
                }
                if (items[0].email3 == true) {
                    logNotificationAttempt(alarmLogRec);
                    emailUser(items[0].user3, alarmLogRec);
                }
                if (items[0].textmessage3 == true) {
                    logNotificationAttempt(alarmLogRec);
                    console.log("texting " + items[0].user3);
                    sendSMS(items[0].user3, alarmLogRec);
                }                       
                       
           }


        }); 
    }); // sql.open
}

function logNotificationAttempt(alarmRec){
    var c = alarmRec.notifycount;
    console.log("VIKINGSCADA: logNotificationAttempt(), notifycount: " + c);
    if(c != null){
        c = c + 1;
    }
    else{
        c = 1;
    }
    var query = "UPDATE vikingscada_svc.alarmlog SET notifycount = " + c + 
                                    ", notifytimestamp = '" + Date() + "' " + 
                                    "WHERE id = '" + alarmRec.id + "'";
	sql.open(gconn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection! " + err);
            return;
        }
        conn.query(query, function (err, results) {
            if (err) {
                console.log("Error running query!");
                return;
            }
            // success:

        }); 
    }); // sql.open
    
    
}


function emailUser(userid, alarmRec) {
    console.log("VIKINGSCADA: emailUser().");
    
    var query = "SELECT * FROM vikingscada_svc.[user] WHERE id = '" + userid + "'";
	sql.open(gconn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection! " + err);
            return;
        }
        conn.query(query, function (err, items) {
            if (err) {
                console.log("Error running query!");
                return;
            }
            // success:
            sendEmail(items[0].email, alarmRec);
        }); 
    }); // sql.open     

}
function sendEmail(toEmail, alarmLogRec) {
    console.log("VIKINGSCADA: sendEmail().");
    var SendGrid = require('sendgrid').SendGrid;
    var sendgrid = new SendGrid('azure_e1628e3866347860307ec2199a86c3ba@azure.com', 'uJOpvRCUyvz9MT3');

    var altype = 'high';
    var alLimit = alarmLogRec.highlimit;
    if (alarmLogRec.lowalarm == 1) {
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
    }, function (success, message) {
        // If the email failed to send, log it as an error so we can investigate
        if (!success) {
            console.error(message);
        }
    });
}

// NOTE: These queries return asynchronously.  So, can't return a value to a calling function.
// Dang it !!!
function getUserPhoneNumber(userid, alarmLogRec) {
    console.log("VIKINGSCADA: getUserPhoneNumber().");
    
    var query = "SELECT * FROM vikingscada_svc.[user] WHERE id = '" + userid + "'";
    
	sql.open(gconn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection! " + err);
            return;
        }
        conn.query(query, function (err, items) {
            if (err) {
                console.log("Error running query! " + query);
                return;
            }
            // success:
            console.log("Calling " + userid + " at " + items[0].phone);
            var pnRec = {
                            uid: userid,
                            phonenumber: items[0].phone,
                            alarmid: alarmLogRec.id,
                            q: null
                        };
            makeCall(alarmLogRec, items[0].phone, pnRec);
        }); 
    }); // sql.open
}

// dataName, alarmType, dataValue, dataUnits, phoneNumber
function makeCall(alarmLogRec, phoneNumber, pnRec) {
    console.log("VIKINGSCADA: makeCall(). " + alarmLogRec.site + ", " +
    alarmLogRec.name + ", " + alarmLogRec.value + ", " + alarmLogRec.units + ", " + phoneNumber);

    // Make the call...
    var pns = createPNScript(alarmLogRec, phoneNumber);
    console.log("PNScript = " + pns);
    bbCallout(pns, phoneNumber, pnRec);
    // Get Q id...

    // Loop: check call status...

    // Get call results...

    // Ack or ignore the alarm...

    // Escalate if required...

}

function createPNScript(alarmLogRec, phoneNumber) {
    console.log("VIKINGSCADA: createPNScript().");
    var altype = 'high';
    if (alarmLogRec.lowalarm == 1)
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

function logCalloutlog(userid, callmethod, msg){
    var query = "INSERT INTO vikingscada_svc.calloutlog [callee, calloutmethod, callmessage] values[userid, callmethod, msg]";
	sql.open(gconn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection! " + err);
            return;
        }
        conn.query(query, function (err, results) {
            if (err) {
                console.log("Error running query!");
                return;
            }
            // success:

        }); 
    }); // sql.open
}
function sendSMS(userid, alarmLogRec) {
    console.log("VIKINGSCADA: sendSMS(" + userid + ").");
    var query = "SELECT * FROM vikingscada_svc.[user] WHERE id = '" + userid +"'";
	sql.open(gconn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection! " + err);
            return;
        }
        conn.query(query, function (err, items) {
            if (err) {
                console.log("Error running query!");
                return;
            }
            // success:
            var phonenum = items[0].phone; //changed from items[0]
            var altype = 'high';
            var alLimit = alarmLogRec.highlimit;
            if (alarmLogRec.lowalarm == 1) {
                altype = 'low';
                alLimit = alarmLogRec.lowlimit;
            }
            var d = new Date(alarmLogRec.lstimestamp);
            var tsUTC = d.getTime(); //ms julian
            var offset = items[0].timezone;
            var ts = alarmLogRec.lstimestamp;
            if(offset != null){
                ts = tsUTC + (3600000*offset);
                var nd = new Date(ts); 
                ts = nd.toJSON();
            }
            
            var ackCode = alarmLogRec.id.substring(alarmLogRec.id.length-4);
            
            var msg = 'Site: ' + alarmLogRec.site + '\n' +
                       'Tagname: ' + alarmLogRec.name + '\n' +
                       'Alarm: ' + altype + '\n' +
                       'Value: ' + alarmLogRec.value + '\n' +
                       'Limit: ' + alLimit + '\n' +
                       'Time: ' + ts + '\n\n' +
                       'Reply with ack code: ' + ackCode;
            console.log('AlarmCallout: calling bbSMS.\n' + msg);
            bbSMS(msg, phonenum, alarmLogRec);
            
            logCalloutlog(userid, 'SMS', msg);
            
        }); 
    }); // sql.open
   

}
function bbSMS(message, phoneNumber, alarmLogRec) {
    console.log("VIKINGSCADA: bbSMS().phoneNumber, " + phoneNumber);
    var smsURL = "http://sms2.cdyne.com/sms.svc/SimpleSMSSend?"
                                                            + "PhoneNumber=" + encodeURIComponent(phoneNumber)
                                                            + "&Message=" + encodeURIComponent(message)
                                                            + "&LicenseKey=42baabe4-5263-483b-bc19-e6b16e1ef6aa";
    console.log("VIKINGSCADA: bbSMS().smsURL, " + smsURL);
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
            var smslog = tables.getTable('smslog');
            /*
            // When bad phonenumber...
            <SMSResponse xmlns=\"http://sms2.cdyne.com\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">
            	<Cancelled>false</Cancelled>
            	<MessageID>00000000-0000-0000-0000-000000000000</MessageID>
            	<Queued>false</Queued>
            	<SMSError>PhoneNumberInvalid</SMSError>
            	<SMSIncomingMessages i:nil=\"true\"/>
            	<Sent>false</Sent>
            	<SentDateTime>0001-01-01T00:00:00</SentDateTime>
            </SMSResponse>
            
            // Success...queued, not sent yet.
            <SMSResponse xmlns=\"http://sms2.cdyne.com\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">
            	<Cancelled>false</Cancelled>
            	<MessageID>7fc7f083-d169-4bc6-8ac7-1beaa6f9da11</MessageID>
            	<Queued>true</Queued>
            	<SMSError>NoError</SMSError>
            	<SMSIncomingMessages i:nil=\"true\"/>
            	<Sent>false</Sent>
            	<SentDateTime>0001-01-01T00:00:00</SentDateTime>
            </SMSResponse>            
            */
            if(getVal("SMSError") == "NoError"){
                var newLog = {
                  alarmlogid: alarmLogRec.id,
                  smsid: getVal("MessageID")  
                };
                smslog.insert(newLog);                
            }
            else{
                
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

function bbCallout(pnScript, phoneNumber, pnRec) {
    console.log("VIKINGSCADA: bbCallout().");

    var httpRequest = require('request');  // https://www.npmjs.com/package/request
    // NR = PN.NotifyPhoneBasicWithTryCount(1, "19183970217", pnScript, "15555551234", "Viking SCADA", "0", "6536383a-55fe-432f-8e42-e4ab95c5fc11");
    var url = "http://ws.cdyne.com/NotifyWS/PhoneNotify.asmx/NotifyPhoneBasicWithTryCount?TryCount=1&PhoneNumberToDial=" +
                  encodeURIComponent(phoneNumber) +
                  "&TextToSay=" + encodeURIComponent(pnScript) +
                  "&CallerID=" + encodeURIComponent("15555551234") +
                  "&CallerIDname=" + encodeURIComponent("MowHawk SCADA") +
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
            //setTimeout(getPNStatus(q, pnRec), 10000);
            setTimeout(function () { getPNStatus(q, pnRec); }, 10000);
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



function ackAlarm(pnRec){
    var qUpdate = "UPDATE vikingscada_svc.alarmlog SET " + 
        "ack = 'True', " + 
        "acktimestamp = '" + Date() + "', " +
        "ackmethod = 'Voice', " +
        "ackuser = '" + pnRec.uid + "' " +
        "where id = '" + pnRec.alarmid + "';";
        
        sql.open(gconn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection! " + err);
            return;
        }
        conn.query(qUpdate, function (err, results) {
            if (err) {
                console.log("Error running query!");
                return;
            }
            // success:
            console.log("Alarm ack updated.");
        }); 
    }); // sql.open
    
}

//=================================================
// Get the status of a phone call by Queue ID
//3-22-16 Tested and working in Azure.
//-------------------------------------------------
function getPNStatus(Q, pnRec) {
    console.log("VIKINGSCADA: getPNStatus().");

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


            if (getVal("CallComplete") == 'false') {
                //setTimeout(getPNStatus(Q, pnRec), 30000); // again...
                setTimeout(function () { getPNStatus(Q, pnRec); }, 30000);
            }
            else {
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
                if (i >= 0) {
                    // ack...
                    console.log("Alarm ack'ed");
                    ackAlarm(pnRec);
                }
                
                logCalloutlog(pnRec.uid, "Voice", getVal("DigitsPressed"));
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