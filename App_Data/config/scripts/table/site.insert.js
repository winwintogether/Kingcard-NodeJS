
function insert(item, user, request) {

    var bbGapi = require('../shared/bbGraphAPI.js');
    bbGapi.userRole(user, tables, function (role) {

        if (role == 'admin' || role == 'system') {

            bbGapi.getUserInfo(user, function (err, uInfo) {
                var companyName = uInfo.physicalDeliveryOfficeName;
                item.company = companyName;
        
                //request.execute();
                noDuplicate(item, user, request);
            });

        }
        else
            request.respond(500, 'Access denied: insufficient privileges!');   

    });
        

}

function noDuplicate(item, user, request){

    var t = tables.getTable('site');
    
    t.where({
        company: item.company,
        sitename: item.sitename
    }).read({
        success: function (items) {

            if (items.length == 0) {
                request.execute(); // insert                         
            } else {
                request.respond(409, 'Error: duplicate sitename.');
             }
        }
    });
        
}