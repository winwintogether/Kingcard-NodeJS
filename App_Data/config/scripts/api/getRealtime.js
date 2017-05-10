
exports.post = function(request, response) {
    // Use "request.service" to access features of your mobile service, e.g.:
    //   var tables = request.service.tables;
    //   var push = request.service.push;

    response.send(statusCodes.OK, { message : 'Hello World!' });
};

exports.get = function(request, response) {
    
     var tables = request.service.tables;
    var table = tables.getTable("site");

    console.log('getRealtime() ' + table);
    
    response.send(statusCodes.OK, { message : table });
};