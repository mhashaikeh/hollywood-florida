function hasRelatedRecords() {
    // Check for parent record
    var getCapResult = aa.cap.getProjectParents(capId, 1);
    if (getCapResult.getSuccess()) {
        var parentArray = getCapResult.getOutput();
        if (parentArray && parentArray.length) {
            logDebug("Found parent record: " + parentArray[0].getCapID().getCustomID());
            return true; // Parent found, return true
        }
    } 

    // Check for child records
    var caps = aa.cap.getChildByMasterID(capId);
    if (caps.getSuccess()) {
        var childArray = caps.getOutput();
        if (childArray && childArray.length) {
            logDebug("Found " + childArray.length + " child record(s) for capId: " + capId.getCustomID());
            return true; // At least one child found, return true
        } 
    } 

    // No parent or child records found
    return false;
}