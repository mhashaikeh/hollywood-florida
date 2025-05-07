if (matches(wfStatus, "Approved", "Approved w/ Comments")) {

    function checkReviewerValuation() {
        var revValue = getAppSpecific("Reviewer Valuation");
        if (matches(revValue, null, undefined, "")) {
            showMessage = true;
            cancel = true;
            comment("Reviewer Valuation must be populated");
        }
    }

    function checkInspections() {
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

    // Check Engineering Review
    if (appTypeArray[1] == "Engineering") {
        var reviewTask = appMatch("PublicWorks/Engineering/Tree Removal/NA") ? "Landscape Review" : "Engineering Review";
        if (wfTask == reviewTask && !appMatch("PublicWorks/Engineering/MOT/NA") && !appMatch("PublicWorks/Engineering/Sidewalk Cafe/NA") && !appMatch("PublicWorks/Engineering/Sidewalk Cafe/Renewal")) {
            checkReviewerValuation();
            checkInspections();
        }
        if (appMatch("PublicWorks/Engineering/Right of Way/NA")){
            var criticalLoc = getAppSpecific("Critical Location");
            if (matches(criticalLoc, null, undefined, "")) {
                showMessage = true;
                cancel = true;
                comment("Critical Location must be populated");
            }
        }
        if (appMatch("PublicWorks/Engineering/Site Improvement/NA")){
            if (wfTask == "Utilities Review") {
                checkReviewerValuation();
            }
        }
    }

    // Check Utility Review
    if (appMatch("PublicWorks/Utilities/Station/NA") || appMatch("PublicWorks/Utilities/Onsite Drainage/NA")) {
        if (wfTask == "Utilities Review") {
            checkReviewerValuation();
            checkInspections();
        }
        if (appMatch("PublicWorks/Utilities/Station/NA")){
            if (wfTask == "Engineering Review") {
                checkReviewerValuation();
            }
        }
    }
}


if (wfStatus == "Final Inspection Complete") {
    var inspResultObj = aa.inspection.getInspections(capId);
    if (inspResultObj.getSuccess()) {
        var inspList = inspResultObj.getOutput();
        for (xx in inspList) {
            if (matches(inspList[xx].getInspectionStatus(), null, undefined, "", "Scheduled", "Pending")) {
                showMessage = true;
                cancel = true;
                comment("This Record has Inspections that have not been Resulted");
            }
        }
    }
}

if (appMatch("PublicWorks/Utilities/Water Meter New/NA")){
    if (wfStatus == "Request Complete"){
        var docList = aa.document.getDocumentListByEntity(capId.toString(),"CAP").getOutput();
        docAttached = false;
        if (docList) { 
            var num = docList.size();
            if(num>0) {
                for(var i=0;i<num;i++){
                    if(docList.get(i).getDocCategory() == "Request for New Meter Application - Signed") {
                        docAttached = true;
                    }
                }
            }
        }
        if (!docAttached){
            showMessage = true;
            cancel = true;
            comment("Applicant has not uploaded the 'Request for New Meter Application - Signed' document");
        }
    }
    if (wfStatus == "Ready for Signature") {
        var fieldsToCheck = [
            { field: "Tap and Install Fees", message: "Tap and Install Fees must be populated" },
            { field: "Install Only Fee", message: "Install Only Fee must be populated" },
            { field: "Fire Line", message: "Fire Line must be populated" }
        ];

        for (var i = 0; i < fieldsToCheck.length; i++) {
            var value = getAppSpecific(fieldsToCheck[i].field);
            if (matches(value, null, undefined, "")) {
                showMessage = true;
                cancel = true;
                comment(fieldsToCheck[i].message);
            }
        }
    }
}


if (appMatch("PublicWorks/Utilities/Sewer Connection/NA")){
    if (wfStatus == "Request Complete"){
        var docList = aa.document.getDocumentListByEntity(capId.toString(),"CAP").getOutput();
        docAttached = false;
        if (docList) { 
            var num = docList.size();
            if(num>0) {
                for(var i=0;i<num;i++){
                    if(docList.get(i).getDocCategory() == "Sewer Connection Map") {
                        docAttached = true;
                    }
                }
            }
        }
        if (!docAttached){
            showMessage = true;
            cancel = true;
            comment("The'Sewer Connection Map' has not been uploaded to this record");
        }
    }
}

if (appMatch("PublicWorks/Engineering/Sidewalk Cafe/NA") || appMatch("PublicWorks/Engineering/Sidewalk Cafe/Renewal")){
    if (matches(wfStatus,"Issued","Renewed")){
        var docList = aa.document.getDocumentListByEntity(capId.toString(),"CAP").getOutput();
        docAttached = false;
        if (docList) { 
            var num = docList.size();
            if(num>0) {
                for(var i=0;i<num;i++){
                    if(docList.get(i).getDocCategory() == "Permit") {
                        docAttached = true;
                    }
                }
            }
        }
        if (!docAttached){
            showMessage = true;
            cancel = true;
            comment("Applicant has not uploaded the 'Permit' document");
        }
    }
    if (wfTask == "Engineering Review" && wfStatus == "Approved"){
        var revSqFt = getAppSpecific("Reviewer Sq. Ft");
        if (matches(revSqFt, null, undefined, "")) {
            showMessage = true;
            cancel = true;
            comment("Reviewer Sq. Ft must be populated");
        }
    } 
}
