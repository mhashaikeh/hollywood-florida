if (matches(wfStatus, "Approved", "Approved w/ Comments")) {
    if (matches(appTypeArray[2], "Plumbing", "Electrical", "Mechanical")) {
        if (wfTask.startsWith(appTypeArray[2])) {
            var revValue = getAppSpecific("Reviewer Valuation");
            if (matches(revValue, null, undefined, "")) {  
                showMessage = true;
                cancel = true;
                comment("Reviewer Valuation must be populated");
            }
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
    }
    if (matches(appTypeArray[1], "Fence","Window and Door","Antenna","Roofing","Temporary Structure","Mobile Home") || matches(appTypeArray[2],"Demolition","Accessory")) {
        if (wfTask == "Structural Review") {
            var revValue = getAppSpecific("Reviewer Valuation");
            if (matches(revValue, null, undefined, "")) {  
                showMessage = true;
                cancel = true;
                comment("Reviewer Valuation must be populated");
            }
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
    }
    //Start Verify That Fire Inspections Applied
    if (wfTask == "Fire Review"){
        var fireInspApplied = false;
        iObjResult = aa.inspection.getInspections(capId);
        if (iObjResult.getSuccess()) {
            iObj = iObjResult.getOutput();
            for (x in iObj){
                if(iObj[x].getInspection().getInspectionGroup() == "FIRE_GEN"){
                    fireInspApplied = true;
                }
            }
        }
        if (!fireInspApplied){
            showMessage = true;
            cancel = true;
            comment("Apply Fire Inspections before Approving Fire Review task");
        }
    }
    //End Verify That Fire Inspections Applied 
}

if (wfStatus == "Final Inspection Complete") {
    var inspResultObj = aa.inspection.getInspections(capId);
    if (inspResultObj.getSuccess()) {
        var inspList = inspResultObj.getOutput();
        for (var xx in inspList) {
            if (matches(inspList[xx].getInspectionStatus(), null, undefined, "", "Scheduled", "Pending")) {
                showMessage = true;
                cancel = true;
                comment("This Record has Inspections that have not been Resulted");
            }
        }
    }
}
