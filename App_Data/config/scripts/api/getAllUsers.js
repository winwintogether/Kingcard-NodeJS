
   
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