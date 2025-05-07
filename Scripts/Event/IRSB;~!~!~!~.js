try {

    cap = aa.cap.getCap(capId).getOutput();
    appTypeResult = cap.getCapType();
    appTypeString = appTypeResult.toString();
    appTypeArray = appTypeString.split("/");
    var isFinalInspection = (inspType.indexOf("Final") > -1 && inspType.indexOf("TCO") == -1 && inspType.indexOf("PCO") == -1);
    var isMatchingType = inspType.indexOf(appTypeArray[2]) > -1 || (appTypeArray[1] == "Fence" && inspType == "Final Fence Inspection") ||
        (appTypeArray[1] == "Window and Door" && inspType == "Final WDS Inspection") ||
        (appTypeArray[0] == "Fire" && inspType.indexOf(appTypeArray[2]) > -1) ||
        (inspType == "Final Fire Bureau Inspection" && appTypeArray[2] == "Eng Life Safety") ||
        (inspType == "Fire Main Final Inspection" && appTypeArray[2] == "Underground Main") ||
        (inspType == "Fire Temporary Structure Inspection" && appTypeArray[1] == "Temporary Structure");


    if (isFinalInspection && isMatchingType && inspResult + "" == "Passed") {
        cIds = getChildren("*/*/*/*", capId);
        if (cIds != null && cIds != false && cIds.length > 0) {
            for (x in cIds) {
                thisChild = cIds[x];
                logDebug("Child record " + thisChild.getCustomID());
                thisChildCap = aa.cap.getCap(thisChild).getOutput();
                thisChildCapStatus = thisChildCap.getCapStatus();
                thisChildAppTypeResult = thisChildCap.getCapType();
                thisChildAppTypeString = thisChildAppTypeResult.toString();
                thisChildAppTypeArray = thisChildAppTypeString.split("/");
                if (thisChildAppTypeString.indexOf("Amendment") == -1) {
                    if (!matches(thisChildCapStatus, "Expired", "Withdrawn", "Closed", "Cancelled", "Denied")) {
                        var inspResultObj = aa.inspection.getInspections(thisChild);
                        if (inspResultObj.getSuccess()) {
                            var inspTypeArr = inspResultObj.getOutput();
                            for (xx in inspTypeArr) {
                                if (matches(inspTypeArr[xx].getInspectionStatus(), null, undefined, "", "Scheduled", "Pending")) {
                                    showMessage = true;
                                    cancel = true;
                                    comment("All Sub-Permits Inspections must be completed");
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    //MAS SF#01500445
    if (appTypeArray[0] == "Building" && isFinalInspection && isMatchingType) {
        if (!isAllChildrenClosed()) {
            showMessage = true;
            cancel = true;
            comment("All children must be closed before resulting the Final Inspection");
        }
    }

} catch (err) {
    var emailAddress = "jshear@accela.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "WTUB;~!~!~!~", err + debug + err.stack);
}