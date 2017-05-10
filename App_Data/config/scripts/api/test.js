


exports.get = function(request, response) {
    
    var tables = request.service.tables;
    var q = tables.getTable('modbusmap');
    
    // SELECT * FROM modbusmap WHERE pollgroup in ('rfscadatest', 'test')
    
    // q.where(function(currentUserId){ 
    //     return this.pollgroup == currentUserId || this.pollgroup == 'test';
    //     }, "rfscadatest")
    // .read({ success: function(results) {response.send(statusCodes.OK, results);}});
    
    var pgs = ["rfscadatest", "dev1"];
    
    q.where(function(arr){ 
        return this.pollgroup in arr;
        }, pgs)
    .read({ success: function(results) {response.send(statusCodes.OK, results);}});

};

function whereIn(){
    
    
}