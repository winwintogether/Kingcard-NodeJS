
exports.post = function(request, response) {
    // Use "request.service" to access features of your mobile service, e.g.:
    //   var tables = request.service.tables;
    //   var push = request.service.push;

    response.send(statusCodes.OK, { message : 'Hello World!' });
};

exports.get = function (request, response) {
    
    console.log("getUser(v8)===============");
    
    if (request.user.level == 'anonymous') {
        response.send(statusCodes.UNAUTHORIZED, null);
        return;
    }
    var errorHandler = function (err) {
        console.error(err);
        response.send(statusCodes.INTERNAL_SERVER_ERROR, err);
    };
    request.user.getIdentities({
        success: function (identities) {
            var objectId = identities.aad.oid;
            console.log("getUser: objectId=" + objectId);
            
            var bbGapi = require('../shared/bbGraphAPI.js');

            bbGapi.getAADToken(function (err, access_token) {
                if (err) errorHandler(err);
                else{
                    console.log("getUser: access_token=" + access_token);
                    
                    bbGapi.getUser2(access_token, objectId, function (err, user_info) {
                        if (err) errorHandler(err);
                        else{
                            console.log("getUser2: user_info=" + user_info);
                            response.send(statusCodes.OK, user_info);
                        } 
                    });  
                } 
                    
            });
        },
        error: errorHandler
    });
};


