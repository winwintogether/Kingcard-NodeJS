

exports.get = function(request, response) {
    var tables = request.service.tables;
    var table = tables.getTable("alarmlog");

    console.log('getRealtime() ' + table);
    
    response.send(statusCodes.OK, { message : 'ok' });
};