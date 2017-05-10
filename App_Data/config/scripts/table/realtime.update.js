function update(item, user, request) {

    console.log("realtime API update");
    
    //request.execute();

    var bbGapi = require('../shared/bbGraphAPI.js');
    bbGapi.userRole(user, tables, function (role) {

        if (role == 'control' || role == 'system') {
            request.execute();
        }
        else
            request.respond(500, 'Access denied: insufficient privileges!');   

    });

            
}