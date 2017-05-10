
        return;
    }
    var errorHandler = function (err) {
        console.error(err);
        response.send(statusCodes.INTERNAL_SERVER_ERROR, err);
    };
            
            
            var bbGapi = require('../shared/bbGraphAPI.js');

            bbGapi.getAADToken(function (err, access_token) {
                if (err) errorHandler(err);
                else{
                    console.log("getAllUsers: access_token=" + access_token);
                    
                    bbGapi.getAllUsers(access_token, function (err, user_info) {
                        if (err) errorHandler(err);
                        else{
                            console.log("getAllUsers: user_info=" + user_info);
                            response.send(statusCodes.OK, user_info);
                        } 
                    });  
                } 
                    
            });
 
    
};