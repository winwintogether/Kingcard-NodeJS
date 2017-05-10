
exports.post = function(request, response) {
    // Use "request.service" to access features of your mobile service, e.g.:
    //   var tables = request.service.tables;
    //   var push = request.service.push;

    response.send(statusCodes.OK, { message : 'Hello World2!' });
};

exports.get = function(request, response) {
     var tables = request.service.tables;
    var table = tables.getTable("device");
    var devId = request.query.d;
    
    table.where({global_id: devId})
    .read({ 
        success: function(results) 
            {response.send(statusCodes.OK, results);},
        error: function(err) {
            response.send(statusCodes.BAD_REQUEST, {error: 'There was a problem with the request.'});
            }
     });

};