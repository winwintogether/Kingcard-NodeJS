function read(query, user, request) {
    
    //console.log("Table: site, read, query: " + query);

    var bbGapi = require('../shared/bbGraphAPI.js');
    bbGapi.getUserInfo(user, function (err, uInfo) {
        var companyName = uInfo.physicalDeliveryOfficeName;
        //console.log("Table: site, read, company: " + companyName);
        query.where({ company: companyName });

        request.execute();
    });          
 

}