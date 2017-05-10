

exports.get = function(request, response) {
    console.log("syncAADUsers: ");
    response.send(statusCodes.OK, { message : '' });    
    
    console.log("syncAADUsers: 2");
    getAADusers(request);
    
};

function getAADusers(req) {

    var bbGapi = require('../shared/bbGraphAPI.js');
    
    bbGapi.getAADToken(function (err, access_token) {
        if (err)
             console.error(err);
        else{
            console.log("syncAADUsers: access_token=" + access_token);
            
            bbGapi.getAllUsers(access_token, function (err, user_info) {
                if (err) console.error(err);
                else{
                    console.log("syncAADUsers: user_info=" + user_info);
                    //response.send(statusCodes.OK, user_info);
                    //var usersInfo = JSON.parse(user_info);
                    var usersInfo = user_info;
                    
                    for (var key in usersInfo) {
                        if (usersInfo.hasOwnProperty(key)) {
                            var val = usersInfo[key];
                            if (key == 'value') {
                                for (var x = 0; x < val.length; x++) {
                                    var tmpPhone = val[x].mobile;
                                    if(tmpPhone != null){
                                        tmpPhone = tmpPhone.replace("+", "");
                                        tmpPhone = tmpPhone.replace(" ", "");                                       
                                    }
                                     var userRec = {
                                        "id": val[x].mailNickname,
                                        "displayname": val[x].displayName,
                                        "description": "AAD sync",
                                        //"email": val[x].otherMails[0],
                                        //"phone": tmpPhone,
                                        "company": val[x].physicalDeliveryOfficeName,
                                        "role": "view only"
                                    };
        
                                    insertNewUser(req, userRec);
        
                                }
                            }
                            
                        }
                    }
        
                } 
            });  
        } 
            
    });


}
    
function insertNewUser(req, jsonData) {
    var tables = req.service.tables;
    var targetTable = tables.getTable("user");

    targetTable.insert(jsonData);
}