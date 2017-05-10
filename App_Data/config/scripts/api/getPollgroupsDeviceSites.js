
//Lua calls this for pollgroups...

exports.get = function(request, response) {
    // THIS SCRIPT IS UNDER DEVELOPMENT
    // Currently it is primarily a copy of getPollGroups.
    // The intent is to pass in devicename, then get the associated sites,
    // then get the associated pollgroups, then return the modbusmap items
    // along with the sitename for each item.
    
    // getPollGroups(sitename)
    // select * from modbusmap where company = 'companyname' and pollgroup in...
    //  (select pollgroup from sitepollgroups where company = 'companyname' and site = 'sitename')
    
    console.log("getPollgroupsDeviceSites: d = " + request.query.d);
    
    var deviceid = request.query.d;
    
    var tables = request.service.tables;
    var q = tables.getTable('site');
    q.where({ deviceid: deviceid }).read({
        success: function (siteItems) {
            console.log("getPollgroupsDeviceSites: siteItems = " + siteItems);
            // [{"id":"86C1AB19-DBD6-4EBF-B114-29ECA15A3D05","company":"Data Delivery Devices","deviceid":"LT54220125011025","sitename":"RV50_Site1","sitedescription":"dev","lastupdated":null,"alarmcount":null}]
            for( var x = 0; x < siteItems.length; x++){
                console.log("getPollgroupsDeviceSites: siteItems[" + x + "] = " + siteItems[x].sitename);
                getPollgroups(response, tables, siteItems[x]);
                
            }            
        }
    });
    
};

function getPollgroups(response, tables, siteItem){
    
                var sitegroupsTable = tables.getTable('sitepollgroups');
                var sn = siteItem.sitename;
                sitegroupsTable.where({ sitename: sn}).read({
                    success: function (spgItems) {
                       console.log("getPollgroupsDeviceSites: got pollgroups");
                       // [{"id":"77DB3A93-D5D2-4C98-9C94-CE8DE28361BB","company":"Data Delivery Devices","sitename":"RV50_Site1","pollgroupname":"rfscadatest1"}]                        
                       for(var y =0; y<spgItems.length; y++){
                           getMBMap(response, tables, spgItems[y], spgItems[y].sitename);
                        }
                    }         
                });                 

    
}

function getMBMap(response, tables, spgItem, sitename){

    var mmapTable = tables.getTable('modbusmap');
    mmapTable.where({pollgroup: spgItem.pollgroupname}).read({
        success: function(mmapItems){
            // concatenate ?
            console.log("getPollgroupsDeviceSites: got modbusmaps: ");         
           
            for(var z = 0; z < mmapItems.length; z++){
                mmapItems[z].sitename = sitename; // add the sitename field...
            }
            response.send(statusCodes.OK,  mmapItems);
            
// mmapItems[0] = {"id":"2C4EAE71-014E-4832-86A5-4BD75BC6DEC7","company":"Data Delivery Devices","pollgroup":"rfscadatest1","registername":"Temperature","registeraddress":849,"units":"degrees F","multiplier":0.1,"bitmask":null}
// mmapItems = [{k:v, k:v},{k:v, k:v}]
// [{"id":"2C4EAE71-014E-4832-86A5-4BD75BC6DEC7","company":"Data Delivery Devices","pollgroup":"rfscadatest1","registername":"Temperature","registeraddress":849,"units":"degrees F","multiplier":0.1,"bitmask":null},{"id":"1EC3D250-233E-45CF-B526-B4CD388A8F95","company":"Data Delivery Devices",//"pollgroup":"rfscadatest1","registername":"Power In","registeraddress":850,"units":"Volts","multiplier":0.1,"bitmask":null},{"id":"6A9AD5CB-B80E-4D64-A4FB-0273C7E80FBC","company":"Data Delivery Devices","pollgroup":"rfscadatest1","registername":"Digital 1","registeraddress":100,"units":null,//"multiplier":null,"bitmask":1}]                                   
                                }
                            });
    
    
}