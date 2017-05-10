function insert(item, user, request) {


    var bbGapi = require('../shared/bbGraphAPI.js');
    bbGapi.userRole(user, tables, function (role) {

        if (role == 'admin' || role == 'system') {

            bbGapi.getUserInfo(user, function (err, uInfo) {
                var companyName = uInfo.physicalDeliveryOfficeName;
                item.company = companyName;
        
                updateOnInsert(item, user, request);
            });

        }
        else
            request.respond(500, 'Access denied: insufficient privileges!');   

    });

}

function updateOnInsert(item, user, request){

    var dev = tables.getTable('device');
    
    dev.where({
        global_id: item.global_id
    }).read({
        success: function (items) {

            if (items.length == 0) {
                request.execute(); // insert                         
            } else {
                item.id = items[0].id;
                dev.update(item);
                request.respond(200); // This may cause an error as well...
             }
        }
    });
        
}