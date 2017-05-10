

exports.get = function(request, response) {
    
    // getPollGroups(sitename)
    // select * from modbusmap where company = 'companyname' and pollgroup in...
    //  (select pollgroup from sitepollgroups where company = 'companyname' and site = 'sitename')
    
    console.log("d = " + request.query);
    
    var siteName = request.query.d;
    var companyName = request.query.c;
    
    console.log("getPollGroups()");
    var tables = request.service.tables;
    var q = tables.getTable('sitepollgroups');
    q.where({ sitename: siteName, company: companyName }).read({
        success: function (pollgroupItems) {

            if (pollgroupItems.length > 0) {
                console.log("getPollGroups: found " + pollgroupItems.length + " pollgroups.");
                var q2 = tables.getTable('modbusmap');
                q2.where({pollgroup: pollgroupItems[0].pollgroupname}).read({
                    success: function(mbMapItems){
                        console.log("getPollGroups: found " + mbMapItems.length + " modbusmaps.");
                        response.send(statusCodes.OK, mbMapItems);
                        
                    }
                });
                // var ret = {
                //     id: item.site,
                //     lastupdated: new Date().toUTCString(),
                //     company: item.company
                // };
                // console.log("getPollGroups:");
                // response.send(statusCodes.OK, { message : date });

            } else {
                console.log("getPollGroups: pollgroups for " + siteName + "not found.");
                response.send(statusCodes.OK, {error: 'Not found.'});
            }
        },
        error: function(err) {
            response.send(statusCodes.BAD_REQUEST, {error: 'There was a problem with the request.'});
            }
    });
    
};