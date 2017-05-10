function insert(item, user, request) {
    console.log("Begin: insert testtime.");
    console.log("strTimestamp = " + item.strTimestamp);
    var d = new Date(item.strTimestamp); //item.dateTimestamp;
    console.log("new Date(strTimestamp) = " + d);
    
    var n = d.toLocaleString();
    item.notes = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    
    //console.log();

    request.execute();
    
    

}