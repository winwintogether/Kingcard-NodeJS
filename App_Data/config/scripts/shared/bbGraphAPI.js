

exports.doThis = function (tables, user, callback) {

        // Do something with the supplied tables or user objects and 
        // return a value to the callback function.
    };
    
var tenant_domain = "vksLogin.onmicrosoft.com";             // 
var clientID = "471d071c-97f6-4f6c-ae17-0f412ce77348";      // AAD id of vksLogin app.
var key = "/8E0K++DhmSLqq0Nhu1J69Iu7oqk86r63D95p0GWcUo=";   // generated, and secret, in AAD.

var gapiVer = 'api-version=1.6';
 
 
 exports.userRole = function(aadUid, tables, callback){
    var bbGapi = require('../shared/bbGraphAPI.js');
    bbGapi.getUserInfo(aadUid, function (err, uInfo) {
        var uname = uInfo.mailNickname;        
        console.log(" username: " + uname);        
        
        var uRole = tables.getTable('user');
        uRole.where({
            id: uname
        }).read({
            success: function (uItems) {
                // console.log("fielddata.insert: success reading realtime");
                if (uItems.length > 0) {
                    var role = uItems[0].role;
                    callback(role);
                }              
    
            }
        });

    });     
 };
 
 
 exports.getUserInfo = function(user, callback){
    
    var errorHandler = function (err) {
        console.error(err);
        callback(statusCodes.INTERNAL_SERVER_ERROR, null);
    };
 
 
    user.getIdentities({
        success: function (identities) {
            var objectId = identities.aad.oid;

            var bbGapi = require('../shared/bbGraphAPI.js');

            bbGapi.getAADToken(function (err, access_token) {
                if (err) errorHandler(err);
                else {
                    // console.log("getUserInfo: access_token=" + access_token);

                    bbGapi.getUser2(access_token, objectId, function (err, user_info) {
                        if (err) errorHandler(err);
                        else {
                            //console.log("getUserInfo: user_info=" + user_info);
                            callback(null, user_info);
                        }
                    });
                }

            });
            
            
 
        },
        error: function (err) {
            console.error(err);
            callback(err, null);
        }
    });
     
 };
 
exports.getAADToken = function (callback) {
    var req = require("request");
    var options = {
        url: "https://login.windows.net/" + tenant_domain + "/oauth2/token?api-version=1.0",
        method: 'POST',
        form: {
            grant_type: "client_credentials",
            resource: "https://graph.windows.net",
            client_id: clientID,
            client_secret: key
        }
    };
    req(options, function (err, resp, body) {
        if (err || resp.statusCode !== 200) callback(err, null);
        else callback(null, JSON.parse(body).access_token);
    });
};


exports.getUser2 = function(access_token, objectId, callback) {
    var req = require("request");
    var options = {
        url: "https://graph.windows.net/" + tenant_domain + "/users/" + objectId + "?" + gapiVer,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + access_token
        }
    };
    req(options, function (err, resp, body) {
        if (err || resp.statusCode !== 200){
            // console.log("getUser2: err=" + err);
            // console.log("getUser2: resp.statusCode=" + resp.statusCode);
            // console.log("getUser2: body=" + body);
            callback(err, null);  
        } 
        else{
            // console.log("getUser2: body=" + body);
            // https://msdn.microsoft.com/library/azure/ad/graph/api/entity-and-complex-type-reference#UserEntity
            callback(null, JSON.parse(body));  
        } 
    });
};

exports.getAllUsers = function(access_token, callback){
     var req = require("request");
    var options = {
        url: "https://graph.windows.net/" + tenant_domain + "/users?" + gapiVer,
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + access_token
        }
    };
    req(options, function (err, resp, body) {
        if (err || resp.statusCode !== 200){
           //  console.log("getAllUsers: err=" + err);
            // console.log("getAllUsers: resp.statusCode=" + resp.statusCode);
           // console.log("getAllUsers: body=" + body);
            callback(err, null);  
        } 
        else{
            // console.log("getAllUsers: body=" + body);
            callback(null, JSON.parse(body));  
        } 
    });
};
