
exports.post = function(request, response) {
    // Use "request.service" to access features of your mobile service, e.g.:
    //   var tables = request.service.tables;
    //   var push = request.service.push;

     var date = { currentTime: Date.now() };
     //response.status(200);  //.type('application/json').send(date);
     //response.type('application/json');
     response.send(statusCodes.OK, { message : date });

};

exports.get = function(request, response) {
     var tables = request.service.tables;
    var table = tables.getTable("site");
    console.log("d = " + request.query);
    var devId = request.query.d;
    
     // var pgs = ["rfscadatest", "dev1"];
    
    table.where({deviceid: devId})
    .read({ 
        success: function(results) 
            {response.send(statusCodes.OK, results);},
        error: function(err) {
            response.send(statusCodes.BAD_REQUEST, {error: 'There was a problem with the request.'});
            }
     });

};