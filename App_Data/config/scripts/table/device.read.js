function read(query, user, request){
    var bbGapi = require('../shared/bbGraphAPI.js');
    bbGapi.getUserInfo(user, function (err, uInfo) {
        var companyName = uInfo.physicalDeliveryOfficeName;

        query.where({ company: companyName });

        request.execute();
    });
    
    
} 

