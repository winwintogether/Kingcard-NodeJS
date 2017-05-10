function insert(item, user, request) {

    request.execute();

    

    var newalarmcount = 0;
    var existingalarmcount = 0;
    
  

//--------------------------------------------------------
// Create or Update realtime data
//--------------------------------------------------------

    var newid = item.company + '_' + item.site + '_' + item.name;
    console.log("fielddata.insert(" + newid + ") =========================");
    var newItem = {
        id: newid,
        company: item.company,
        site: item.site,
        name: item.name,
        value: item.value,
        units: item.units,
        lstimestamp: item.lstimestamp,
        lowlimit: 0,
        highlimit: 65535,
        lowalarm: false,
        highalarm: false
    };

    var rt = tables.getTable('realtime');
    // console.log("fielddata.insert: reading realtime");
    rt.where({
        company: item.company,
        name: item.name,
        site: item.site
    }).read({
        success: function (rtitems) {
            // console.log("fielddata.insert: success reading realtime");
            if (rtitems.length > 0) {

                var newalarmbool = false;

                // Get existingalarmcount.......................
                if (item.value < rtitems[0].lowlimit){
                    item.lowalarm = true;
                    if (!rtitems[0].lowalarm) // new alarm...
                        newalarmbool = true; //newalarmcount = newalarmcount + 1;
                }                    
                else {
                    item.lowalarm = false;
                    if (rtitems[0].lowalarm) // new cleared alarm...
                        newalarmcount = newalarmcount - 1;
                }
                    

                if (item.value > rtitems[0].highlimit) {
                    item.highalarm = true;
                    if (!rtitems[0].highalarm) // new alarm...
                        newalarmbool = true; //newalarmcount = newalarmcount + 1;
                }                    
                else {
                    item.highalarm = false;
                    if (rtitems[0].highalarm) // new cleared alarm...
                        newalarmcount = newalarmcount - 1;
                }
                    

                //console.log("1)Alarm log: " + newid + ' - ' + 'lowlimit = ' + rtitems[0].lowlimit +
                //    ', lowalarm = ' + item.lowalarm + ' : highlimit = ' + rtitems[0].highlimit + ', highalarm = ' + item.highalarm);

                //------------------------------------------------

                // Now that we have the newalarmcount and the existingalarmcount, we can update the Site alarmcount...
                //console.log("3)newalarmcount: " + newalarmcount);
                //var alarmcount = existingalarmcount + newalarmcount;
                //console.log("4)alarmcount: " + alarmcount);

                // Update the Site table.


                //---------------------------------------------------------------------------

                var updateItem
                if(newalarmbool){
                       updateItem = {
                            id: newid,
                            company: item.company,
                            site: item.site,
                            name: item.name,
                            value: item.value,
                            units: item.units,
                            lstimestamp: item.lstimestamp,
                            lowlimit: rtitems[0].lowlimit,
                            highlimit: rtitems[0].highlimit,
                            lowalarm: item.lowalarm,
                            highalarm: item.highalarm,
                            acked: false
                        };                    
                    
                    }
                    else{
                    
                        updateItem = {
                            id: newid,
                            company: item.company,
                            site: item.site,
                            name: item.name,
                            value: item.value,
                            units: item.units,
                            lstimestamp: item.lstimestamp,
                            lowlimit: rtitems[0].lowlimit,
                            highlimit: rtitems[0].highlimit,
                            lowalarm: item.lowalarm,
                            highalarm: item.highalarm
                        };
                }
                rt.update(updateItem);
                console.log("6)Update tag: " + newid + ': ' + item.value + ', ' + item.lstimestamp + " - user: " + user.userId + " - newalarm: " + newalarmbool);
                if (newalarmbool)
                    logAlarm(updateItem);
            } else {
                rt.insert(newItem);
                //console.log("6)Insert tag: " + newid + ': ' + item.value + ', ' + item.lstimestamp + " - user: " + user.userId);
            }
                // Moved here to update whether insert or update realtime
                //console.log("7) site insert or update");
                var q = tables.getTable('site');
                q.where({ sitename: item.site, 
                         company: item.company }).read({
                    success: function (siteitems) {
                          //console.log("7.1) site insert or update");
                        if (siteitems.length > 0) {
                             //console.log("7.2) site insert or update");
                            var existingsite = {
                                id: siteitems[0].id,
                                sitename: item.site,
                                lastupdated: new Date().toUTCString(),
                                company: item.company
                                //alarmcount: alarmcount  // Can not do this here; multiple inserts go at the same time and can not calculate this number.
                                                          // Now this is computed on the client-side.
                            };
                            //console.log("7.3)Updating site: " + item.site);
                            //The parameter 'item' must be an object with an 'id' property
                            q.update(existingsite);

                        }
                        
                    }
                });
        }
    });

    



}

function logAlarm(item) {    
    
    var newItem = {
        tagid: item.id,
        company: item.company,
        site: item.site,
        name: item.name,
        value: item.value,
        units: item.units,
        lstimestamp: item.lstimestamp,
        lowlimit: item.lowlimit,
        highlimit: item.highlimit,
        lowalarm: item.lowalarm,
        highalarm: item.highalarm,
        ack: false,
        acktimestamp: "",
        ackuser: "",
        ackmethod: ""
    };

    // Debugging makes it to here, 6-28-16...
    console.log("logAlarm: " + item.id + "," + item.lowalarm + "," + item.highalarm );
    // TestLS_BoardTemperature,false,true
    var alog = tables.getTable('alarmlog');
    
                alog.where({ tagid: item.id, lowalarm: item.lowalarm, highalarm: item.highalarm, ack: false }).read({
                    success: function (alitems) {

                        if (alitems.length > 0) {
                                var uItem = {
                                    id: alitems[0].id,
                                    tagid: item.id,
                                    company: item.company,
                                    site: item.site,
                                    name: item.name,
                                    value: item.value,
                                    units: item.units,
                                    lstimestamp: item.lstimestamp,
                                    lowlimit: item.lowlimit,
                                    highlimit: item.highlimit,
                                    lowalarm: item.lowalarm,
                                    highalarm: item.highalarm,
                                    ack: false,
                                    acktimestamp: "",
                                    ackuser: "",
                                    ackmethod: ""
                                };
                              console.log("updating alarmlog...");
                              
                              // WHY DO I UPATE THE ALARMLOG HERE??????
                              // It seems like I should leave the values as they were when the alarm first ocurred.
                              
                              //alog.update(uItem);

                        } else {
                             console.log("inserting alarmlog...");
                             alog.insert(newItem);
                             // 6-28-16: ran to here, but the message in alarmlog.insert.js did not print.
                             // The record was indeed inserted into alarmlog table.
                             
                             console.log("VIKINGSCADA: calling shared/alarmNotify.js");
                             var vksAN = require('../shared/alarmNotify.js');
                             vksAN.alarmEngine(newItem);
                             console.log("VIKINGSCADA: returned from shared/alarmNotify.js");
                        }
                    }
                });

   
}
function vksAlarms(){
    
    
}

