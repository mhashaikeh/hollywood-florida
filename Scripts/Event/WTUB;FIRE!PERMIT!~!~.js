try{
    //Verify that Reviewer Valuation is captured before Review Approval
    if (wfTask == "Fire Review" && matches(wfStatus,"Approved","Approved w/ Comments")) {
        var revValue = getAppSpecific("Reviewer Valuation");
        if (matches(revValue, null, undefined, "")) {  
            showMessage = true;
            cancel = true;
            comment("Reviewer Valuation must be populated");
        }
    }
    //Verify that Inspections are applied to record before Review Approval and Record Issuance
    if(matches(wfStatus,"Approved","Approved w/ Comments","Issued")){
        var inspResultObj = aa.inspection.getInspections(capId);
        if (inspResultObj.getSuccess()) {
            var inspList = inspResultObj.getOutput();
            if (inspList == null || inspList.length == 0) {
                showMessage = true;
                cancel = true;
                comment("Inspections must be applied to Record");
            }
        }
    }

    if (wfStatus == "Final Inspection Complete") {
        var inspResultObj = aa.inspection.getInspections(capId);
        if (inspResultObj.getSuccess()) {
            var inspList = inspResultObj.getOutput();
            var inspArray = [];
            for (var xx in inspList) {
                if (matches(inspList[xx].getInspectionStatus(), null, undefined, "", "Scheduled", "Pending")) {
                    inspArray.push(inspList[xx].getInspectionType());
                }
            }
            if (inspArray.length > 0){
                showMessage = true;
                cancel = true;
                comment("The Record has the following Inspections that have not been Resulted: " + inspArray);
            }
        }
    }

    //Start: Verify License Number Validation
    if (wfStatus == "Ready to Issue"){
        if (appHasCondition("Fire Protection", "Applied", "Manual License Number and Expiration Validation Required", null)) {
            showMessage = true;
            cancel = true;
            comment("Manual License Number and Expiration Validation Condition must be met");
        }
    }
    //End: Verify License Number Validation

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "WTUB;FIRE!PERMIT!~!~", err + debug + err.stack);
}

