function getChildren_Rev(capType, capId) {
    var childArr = [];
    var getCapResult = aa.cap.getChildByMasterID(capId);
    if (getCapResult.getSuccess()) {
        var childList = getCapResult.getOutput();
        for (var i in childList) {
            var childCapId = childList[i].getCapID();
            if (capType) {
                var capTypeResult = aa.cap.getCapTypeByCapID(childCapId);
                if (capTypeResult.getSuccess() && capTypeResult.getOutput() == capType) {
                    childArr.push(childCapId);
                }
            } else {
                childArr.push(childCapId);
            }
        }
    }
    return childArr;
}