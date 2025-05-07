function isLicenseProfActive() { //optional cap Id
    var itemCap = capId;
    if (arguments.length > 0) {
        itemCap = arguments[0];
    }

    var lpScriptModel = getPrimaryFirstLP(itemCap);
    if (lpScriptModel) {
        var licNum = String(lpScriptModel.getLicenseNbr());
        // if at least one Active/About To Expire State License exists, consider LP active
        var cslActive = false;
        var stateLic = aa.cap.getCapIDsByAppSpecificInfoField("State License Number", licNum);
        if (stateLic.getSuccess()) {
            var apsArray = stateLic.getOutput();
            for (aps in apsArray) {
                var thisCapId = apsArray[aps].getCapID();
                if (appMatch("Licenses/Contractor/State/License", thisCapId)) {
                    var thisCap = aa.cap.getCap(thisCapId).getOutput();
                    var capStatus = thisCap.getCapStatus();
                    if (matches(String(capStatus), "Active", "About to Expire")) {
                        cslActive = true;
                        break;
                    }
                }
            }
        }

        // if at least one Active/About To Expire County License exists, consider LP active
        var cclActive = false;
        var countyLic = aa.cap.getCapIDsByAppSpecificInfoField("County License Number", licNum);
        if (countyLic.getSuccess()) {
            var apsArray = countyLic.getOutput();
            for (aps in apsArray) {
                var thisCapId = apsArray[aps].getCapID();
                if (appMatch("Licenses/Contractor/County/License", thisCapId)) {
                    var thisCap = aa.cap.getCap(thisCapId).getOutput();
                    var capStatus = thisCap.getCapStatus();
                    if (matches(String(capStatus), "Active", "About to Expire")) {
                        cclActive = true;
                        break;
                    }
                }
            }
        }

        return cclActive || cslActive;

    } else {
        logDebug("LP not found for this record");
        return false;
    }
}