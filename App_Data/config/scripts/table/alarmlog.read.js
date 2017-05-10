
function read(query, user, request) {
    console.log("Alarmlog.read()========================================");

    // var siteTable = tables.getTable('site');
    // siteTable.read({ success: readSites });
    // function readSites(sites) {
    //     if(sites.length > 0) {
    //         // Permission record was found. Continue normal execution.
    //         // request.execute();
    //         for (var rec in sites){
    //             console.log("Alarmlog read: rec = " + sites[rec].sitename);
    //         }
    //         
    //     } else {
    //         // console.log('User %s attempted to submit an order without permissions.', user.userId);
    //         //request.respond(statusCodes.FORBIDDEN, 'You do not have permission to submit orders.');
    //     }
    // }





    var bbGapi = require('../shared/bbGraphAPI.js');
    bbGapi.getUserInfo(user, function (err, uInfo) {
        var companyName = uInfo.physicalDeliveryOfficeName;
        console.log("Table: alarmlog, read, company: " + companyName);
        
        // get site, then site's companyname
        // where site in (select sitename from site where companyname = companyName)
        
        //query.where({ company: companyName });
        // query.where(function () {
        //     return this.site == 'DummySite1' || this.site == 'Test';
        // });
        query.where({ company: companyName});
        request.execute();
    });


    // request.execute();
}
