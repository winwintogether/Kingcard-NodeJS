
function update(item, user, request) {
    console.log("alarmlog.update() user: " + user.userId);
    
    
//     var bbGapi = require('../shared/bbGraphAPI.js');
//     bbGapi.getUserInfo(user, function (err, uInfo) {
//         var uname = uInfo.mailNickname;        
//         console.log(" username: " + uname);
//         
//         var uRole = tables.getTable('user');
//         uRole.where({
//             id: uname
//         }).read({
//             success: function (uItems) {
//                 // console.log("fielddata.insert: success reading realtime");
//                 if (uItems.length > 0) {
//                     var role = uItems[0].role;
//                     if(role == 'control' || role == 'system'){
//                         request.execute();
//                         ackRT(item.id);
//                     }
//                     else
//                         request.respond(500, 'Access denied: insufficient privileges.');
//     
//                 } 
//     
//             }
//         });
// 
//     });   
    
    var bbGapi = require('../shared/bbGraphAPI.js');
    bbGapi.userRole(user, tables, function (role) {

        if (role == 'control' || role == 'system') {
            request.execute();
            ackRT(item.id);
        }
        else
            request.respond(500, 'Access denied: insufficient privileges!');   

    });
    

    
    
function ackRT(alarmId){    
    if(item.ack == true){
        var aT = tables.getTable('alarmlog');
        // console.log("fielddata.insert: reading realtime");
        aT.where({
            id: alarmId
        }).read({
            success: function (atitems) {
                // console.log("fielddata.insert: success reading realtime");
                if (atitems.length > 0) {
    
                    // Update the realtime table.
                    var rt = tables.getTable('realtime');
                    
                    // console.log("item.tagid: " + atitems[0].tagid);
                    // console.log("item.company: " + atitems[0].company);
                    // console.log("item.site: " + atitems[0].site);
                    // console.log("item.ack: " + atitems[0].ack);
                    // 
                    var updateItem = {
                                    id: atitems[0].tagid,
                                    company: atitems[0].company,
                                    site: atitems[0].site,
                                    acked: true
                                };
                
                    // console.log("updateItem.id: " + updateItem.id);
                    // console.log("updateItem.company: " + updateItem.company);
                    // console.log("updateItem.site: " + updateItem.site);
                    // console.log("updateItem.acked: " + updateItem.acked);
                                
                    rt.update(updateItem);
    
                }     
            }
        });
    } 
    
 }      
} // udate
