
function del(id, user, request) {

    var bbGapi = require('../shared/bbGraphAPI.js');
    bbGapi.userRole(user, tables, function (role) {

        if (role == 'admin' || role == 'system') {
            request.execute();
        }
        else
            request.respond(500, 'Access denied: insufficient privileges!');   

    });

}