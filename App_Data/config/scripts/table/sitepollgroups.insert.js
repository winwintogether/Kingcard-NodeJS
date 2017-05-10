
function insert(item, user, request) {

    var bbGapi = require('../shared/bbGraphAPI.js');
    bbGapi.userRole(user, tables, function (role) {

        if (role == 'admin' || role == 'system') {

            bbGapi.getUserInfo(user, function (err, uInfo) {
                var companyName = uInfo.physicalDeliveryOfficeName;
                item.company = companyName;
        
                request.execute();

            });

        }
        else
            request.respond(500, 'Access denied: insufficient privileges!');   

    });

}
