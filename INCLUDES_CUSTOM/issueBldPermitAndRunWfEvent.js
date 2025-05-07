function issueBldPermitAndRunWfEvent(itemCapId) {
    var saveCapId = capId;
    capId = itemCapId;
    //Close Permit Issuance and Open Inspection Task
    closeTask("Permit Issuance", "Issued", "", "");
    activateTask("Inspection");
    updateAppStatus("Inspection Phase", "Updated By PPA:*/*/*/* Script");
    capId = saveCapId;

    // Run WTUA Event for the current record
    runEMSEScriptAfterWorkflowUpdate(itemCapId, aa.getAuditID(), "Permit Issuance", "Issued", getWfProcessCodeByCapId(itemCapId));

    //Populate Renewal Exp Date and set as Active
    vPermitObj = new licenseObject(null, itemCapId);
    currentDate = new Date();
    var currentDateString = (currentDate.getMonth() + 1) + "/" + currentDate.getDate() + "/" + currentDate.getFullYear();
    editAppSpecific("Permit Issued Date", currentDateString, itemCapId);
    if (appMatch("PublicWorks/Engineering/MOT/NA")) {
        newExpDate = new Date(getAppSpecific('Approved MOT End Date', itemCapId));
    } else {
        newExpDate = addDays(currentDate, 180);
    }
    vPermitObj.setExpiration(dateAdd(newExpDate, 0));
    vPermitObj.setStatus("Active");

    //Start: Check For Children Pending Master Permit Issuance
    var childRecords = getChildren_Rev(null, itemCapId);
    if (childRecords && childRecords.length > 0) {
        for (var i = 0; i < childRecords.length; i++) {
            var childCapId = childRecords[i];
            // Get the application status of the child record
            var childCap = aa.cap.getCap(childCapId).getOutput();
            var childAppStatus = childCap.getCapStatus();
            // MAS SF#01486146 - check if child ready to issue and no balance and LP valid then issue it and call the WTUA event
            if (childAppStatus == "Ready to Issue") {
                var childBalanceDue = getCapBalanceDue(childCapId);
                if (childBalanceDue <= 0) {
                    var isLpValid = isLicenseProfActive(childCapId);
                    if (isLpValid) {
                        issueBldPermitAndRunWfEvent(childCapId);
                    }
                }
            }
        }
    }
    //End: Check For Children Pending Master Permit Issuance
}