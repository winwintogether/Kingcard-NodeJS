function insert(item, user, request) {
    // Note: this does not fire when inserting from the tag table API script.
    // Evidently the other table's scripts <table>.update and <table>insert do not call these API's.
    
    console.log("realtime API insert");
    
    request.execute();
    
}