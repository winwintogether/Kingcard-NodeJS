
// NOTE: NO APP SERVICE RESTART REQUIRED FOR CODE CHANGES !!!!

// TODO: Refactor from queryraw to query, like in shared/alarmNotify.js

console.log("wjAlarmNotify, START START START START START START START START START ");
// See thelog here: https://vikingscada-svc.scm.azure-mobile.net/azurejobs/#/jobs/continuous/wjAlarmNotify

    var sql = require('sqlserver');
    var gconn_str = "Driver={SQL Server Native Client 11.0};Server=tcp:vks.database.windows.net,1433;Database=vikingscada-db;Uid=vksAdmin@vks;Pwd=Viking16;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;";

    AlarmCallout();
    
 
function AlarmCallout() {

    //testDB();
    
    //NOTE: get SMS messages first, they clear after we read them.
    // then loop through the SMS messages, and check for Ack,
    // for each Ack, check the smslog table and update alarmlog ack.
    bbSMS();
    
    var vksAN = require('../../../config/scripts/shared/alarmNotify.js');
    vksAN.alarmEscalation();
}

function testDB(){
    console.log("testDB()");
    


    var query = "SELECT * FROM vikingscada_svc.smslog";

    console.log("testDB() ready to open...");
    sql.open(gconn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection! " + err);
            return;
        }
        conn.queryRaw(query, function (err, results) {
            if (err) {
                console.log("Error running query!");
                return;
            }
            console.log("row count = " + results.rows.length + "\n");
            for (var i = 0; i < results.rows.length; i++) {
                console.log("alarmlogid: " + results.rows[i][1] +
                          " smsid: " + results.rows[i][2] );
            }
            console.log('Done --\n');
        }); 
    }); // sql.open
    console.log("testDB() after open.");
}


function ackAlarm(ackCode, userPhone){
    console.log("ackAlarm()...running");
    
    //var sql = require('sqlserver');    
    
    //var conn_str = "Driver={SQL Server Native Client 11.0};Server=tcp:vks.database.windows.net,1433;Database=vikingscada-db;Uid=vksAdmin@vks;Pwd=Viking16;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;";
    var query = "SELECT * FROM vikingscada_svc.alarmlog where id like '%" + ackCode + "'";
    console.log("ackAlarm()...opening");
    sql.open(gconn_str, function (err, conn) {
        if (err) {
            console.log("Error opening the connection! " + err);
            return;
        }
        console.log("ackAlarm()...querying: " + query);
        conn.query(query, function (err, results) {
            if (err) {
                console.log("Error running query!");
                return;
            }
             console.log("row count = " + results.length + "\n");
             //if(results.rows.length > 0){                                
                var alarmId = results[0].id;
                var tagId = results[0].tagid;
                var qUser = "SELECT id FROM vikingscada_svc.[user] where phone = '" + userPhone + "'";
                conn.queryRaw(qUser, function(err, rUser){
                    if (err) {
                        console.log("Error running qUser: " + qUser);
                    }
                    else{
                        var uName = rUser.rows[0][0];                
                        
                         var qUpdate = "UPDATE vikingscada_svc.alarmlog SET " + 
                                "ack = 'True', " + 
                                "acktimestamp = '" + Date() + "', " +
                                "ackmethod = 'SMS', " +
                                "ackuser = '" + uName + "' " +
                                "where id = '" + alarmId + "';";
                        conn.query(qUpdate, function(err, updateResults){
                            if (err) {
                                console.log("Error running update!: " + qUpdate);
                            }
                            else{
                                console.log("qUpdate success: " + updateResults);
                                sendSMS("Alarm ackknowledged.", userPhone);
                                
                                
                                
                                var qUpdateRT = "UPDATE vikingscada_svc.realtime SET " + 
                                    "acked = 'True' " + 
                                    "where id = '" + tagId + "';";
                                conn.query(qUpdateRT, function(err, rtResults){
                                    if (err) {
                                        console.log("Error running update!: " + qUpdateRT);
                                    }
                                    else{
                                        console.log("qUpdateRT success: " + rtResults);                                       
                                    }
                                });
                                
                                
                                
                            }
                        });
                        
                        
                        
                    }
                });
                
            //}
            console.log('Done --\n');
        }); 
    }); // sql.open
    

}

//////////////////////////////////////////////////////////////
// Get incoming SMS messages...
// Loop through each one...
// Check the alarmlog for un'ack'ed alarm that matches incoming ack code..
// Ack the alarmlog record by incoming code and phonenumber.
////////////////////////////////////////////////////////////////
function bbSMS() {
    //view-source:http://sms2.cdyne.com/sms.svc/GetUnreadIncomingMessages?LicenseKey=42baabe4-5263-483b-bc19-e6b16e1ef6aa
    
    var smsURL = "http://sms2.cdyne.com/sms.svc/GetUnreadIncomingMessages?"
                                                            + "&LicenseKey=42baabe4-5263-483b-bc19-e6b16e1ef6aa";

    var httpRequest = require('request');  

    httpRequest.get({
        url: smsURL
    }, function (err, response, body) {
        if (err) {
            console.log("SMS Notify Status:Error");
        } else if (response.statusCode !== 200) {
            console.log("SMS Notify Status: BAD REQUEST");
        } else {
            
            console.log("SMS Notify Status:\n" + body);
            
            /*
            <ArrayOfSMSIncomingMessage xmlns="http://sms2.cdyne.com" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
            	<SMSIncomingMessage><FromPhoneNumber>19183970217</FromPhoneNumber>
            		<IncomingMessageID>f2e0794a-7dd0-4089-aeb3-622128b1031d</IncomingMessageID>
            		<MatchedMessageID>801aa1c5-a64e-4edb-9095-475dcd76f40a</MatchedMessageID>
            		<Message>Ak</Message>
            		<ResponseReceiveDate>2016-07-13T22:25:33.86</ResponseReceiveDate>
            		<ToPhoneNumber>19183227570</ToPhoneNumber>
            	</SMSIncomingMessage>
            	<SMSIncomingMessage>
            		<FromPhoneNumber>19183970217</FromPhoneNumber>
            		<IncomingMessageID>68297089-8f00-4177-8135-aec8a024615f</IncomingMessageID>
            		<MatchedMessageID>801aa1c5-a64e-4edb-9095-475dcd76f40a</MatchedMessageID>
            		<Message>Ack</Message>
            		<ResponseReceiveDate>2016-07-13T22:25:37.537</ResponseReceiveDate>
            		<ToPhoneNumber>19183227570</ToPhoneNumber>
            	</SMSIncomingMessage>
            </ArrayOfSMSIncomingMessage>
            
            or...
            
            <ArrayOfSMSIncomingMessage xmlns="http://sms2.cdyne.com" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"/>
            */
            var st2;
            var name = "SMSIncomingMessage";
            var msgStart = body.indexOf("<" + name + ">");
            console.log("msgStart: " + msgStart);
            var x = 0;
            while(msgStart > 0){
                console.log("while...");
                
                if (msgStart >= 0) {
                    st2 = body.indexOf("</" + name + ">", msgStart);
                    console.log("st2: " + st2);
                    var stt = body.slice(msgStart + name.length + 2, st2);
                    var msgid = getVal(stt, "MatchedMessageID");
                    console.log("Found SMS: " + msgid);
                    
                        var msg = getVal(stt, "Message");
                        var fromNPhoneNum = getVal(stt, "FromPhoneNumber");
                        console.log("   msg: " + msg);
                        if(msg.length == 4){
                            console.log("ackCode: " + msg);
                            // check smslog, get alarmlogid...          
                            // use phonenum to find username...
                             // ack the alarmlog by the user via SMS...
                             ackAlarm(msg, fromNPhoneNum);                         
                        }                   
                   
                }               
                    
                
                msgStart = body.indexOf("<" + name + ">", st2);
                 console.log("msgStart: " + msgStart);
                 x= x + 1;
                 if(x > 2)
                    msgStart = 0;
            }

        }       
       
        function getVal(msgbody, name) {
            var st = msgbody.search("<" + name + ">");
            if (st >= 0) {
                var st2 = msgbody.search("</" + name + ">");
                var stt = msgbody.slice(st + name.length + 2, st2);
                return stt;
            }
            else
                return "na";

        }

    });
}


function sendSMS(message, phoneNumber) {
    var smsURL = "http://sms2.cdyne.com/sms.svc/SimpleSMSSend?"
                                                            + "PhoneNumber=" + encodeURIComponent(phoneNumber)
                                                            + "&Message=" + encodeURIComponent(message)
                                                            + "&LicenseKey=42baabe4-5263-483b-bc19-e6b16e1ef6aa";
    var httpRequest = require('request');  // https://www.npmjs.com/package/request

    httpRequest.get({
        url: smsURL
    }, function (err, response, body) {
        if (err) {
            console.log("SMS ack ack :Error");
        } else if (response.statusCode !== 200) {
            console.log("SMS ack ack: BAD REQUEST");
        } else {
            //console.log(body); // fyi: each console.log is a seperate entry in the log...
            console.log("SMS ack ack:\n" + body);
            
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