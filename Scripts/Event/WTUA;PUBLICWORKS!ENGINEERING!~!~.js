//Open up Review Tasks based upon TSI Selection and set Due Date
if (wfStatus ==  "Routed for Review") {
    var expReview = getAppSpecific("Expedited Plan Review");
    var dueDate = getNextWorkDays4Workflow(expReview == "CHECKED" ? 10 : 1, new Date());
    var TSIResult = aa.taskSpecificInfo.getTaskSpecificInfoByTask(capId, wfProcessID, wfStep);
    if (TSIResult.getSuccess()){
        var TSI = TSIResult.getOutput();
        for (a1 in TSI){
            if (matches(TSI[a1].getChecklistComment(),null,undefined,"","UNCHECKED")){
                deactivateTask(TSI[a1].getCheckboxDesc());
            }else{
                editTaskDueDate(TSI[a1].getCheckboxDesc(), dueDate);
            }
        }
    }
}

//Start: Apply Plan Review Fees
if (appMatch("PublicWorks/Engineering/Site Improvement/NA") || appMatch("PublicWorks/Engineering/Earthwork Clearing Grubbing/NA") || appMatch("PublicWorks/Engineering/Right of Way/NA")){
    var reviewerValuation = AInfo["Reviewer Valuation"];
    if (wfTask == "Utilities Review" && matches(wfStatus,"Approved", "Approved w/ Comments")){
        var feeAmount = 0;

        if (reviewerValuation <= 25000) {
            feeAmount = 163;
        } else if (reviewerValuation > 25000 && reviewerValuation <= 100000) {
            feeAmount = 500;
        } else if (reviewerValuation > 100000 && reviewerValuation <= 300000) {
            feeAmount = 1500;
        } else {
            feeAmount = 1500 + (((reviewerValuation - 300000)/1000) * 2);
        }
        if (appMatch("PublicWorks/Engineering/Site Improvement/NA")){
            updateFee("UTL09", "UTILITIES", "FINAL", feeAmount, "N");
            updateFee("UTL10", "UTILITIES", "FINAL", feeAmount, "N");
        }
        if (appMatch("PublicWorks/Engineering/Earthwork Clearing Grubbing/NA")){
            updateFee("UTL11", "UTILITIES", "FINAL", feeAmount, "N");
            updateFee("UTL12", "UTILITIES", "FINAL", feeAmount, "N");
        }
    }
    if (wfTask == "Engineering Review" && matches(wfStatus,"Approved", "Approved w/ Comments")){
        feeAmountENG05 = Math.max(reviewerValuation * 0.05, 54);
        updateFee('ENG05', 'ENGINEERING', 'FINAL', feeAmountENG05, 'N');
        logDebug("Fee Amount ENG05 Calculated: " + feeAmountENG05);
    }
}
//End: Apply Plan Review Fees

//Start: Update Application Expiration Date Field
if (wfStatus != "Issued" && wfTask != "Inspection"){
  var appExpDate = getAppSpecific("Application Expiration Date");
  if (isTaskActive("Plans Coordination") || isTaskComplete('Plans Coordination')){
      var today = new Date();
      today.setDate(today.getDate() + 60);
      var sixtyDaysLaterString = (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear();
      editAppSpecific("Application Expiration Date", sixtyDaysLaterString);
  }
}
//End: Update Application Expiration Date Field
if (wfStatus == "Ready to Issue" || wfStatus == "Ready to Renew"){
  // Start Apply Permit and County Fees
        var permitFeeAmount = 0;
        var reviewerValuation = getAppSpecific("Reviewer Valuation");
        //Removing County Fee as per request 1001 07162024
        //var countyFeeAmount = Math.max((reviewerValuation / 1000) * 0.52, 2);
        if (reviewerValuation){
            var permitFeeAmount = Math.max(reviewerValuation * 0.05, 50);
        }
        //updateFee('COUNTY', 'GOVERNMENTAL', 'FINAL', countyFeeAmount, 'N');
        if (appMatch("PublicWorks/Engineering/Landscape/NA") || appMatch("PublicWorks/Engineering/Tree Removal/NA")){
            if (AInfo['Type of Property'] == "Single Family"){
                updateFee('ENG09', 'ENGINEERING', 'FINAL', 1, 'N');
                permitFeeAmount = 66;
            }else{
                updateFee('ENG10', 'ENGINEERING', 'FINAL', reviewerValuation, 'N');
                permitFeeAmount = (reviewerValuation * 0.015);
            }
            if (appMatch("PublicWorks/Engineering/Tree Removal/NA")){
                var numRemoved = AInfo['Total for Removal'];
                var numRelocated = AInfo['Total for Relocation'];

                var totalTrees = (Number(numRemoved) + Number(numRelocated));
                logDebug("totalTrees: " + totalTrees);
                updateFee('ENG12', 'ENGINEERING', 'FINAL', totalTrees, 'N');
                if (AInfo['Type of Property'] != "Single Family"){
                    updateFee('ENG13', 'ENGINEERING', 'FINAL', 1, 'N');
                }
            }
        }else if (appMatch("PublicWorks/Engineering/Right of Way/NA")){
            if (AInfo['Tree Removal'] == "CHECKED" || AInfo['Landscape'] == "CHECKED"){
                if (AInfo['Type of Property'] == "Single Family"){
                    updateFee('ENG09', 'ENGINEERING', 'FINAL', 1, 'N');
                    permitFeeAmount = 66;
                }else{
                    updateFee('ENG10', 'ENGINEERING', 'FINAL', reviewerValuation, 'N');
                    permitFeeAmount = (reviewerValuation * 0.015);
                }
                if (AInfo['Tree Removal'] == "CHECKED"){
                    var numRemoved = AInfo['Total for Removal'];
                    var numRelocated = AInfo['Total for Relocation'];

                    var totalTrees = (Number(numRemoved) + Number(numRelocated));
                    logDebug("totalTrees: " + totalTrees);
                    updateFee('ENG12', 'ENGINEERING', 'FINAL', totalTrees, 'N');
                    if (AInfo['Type of Property'] != "Single Family"){
                        updateFee('ENG13', 'ENGINEERING', 'FINAL', 1, 'N');
                    }
                }
            }
            updateFee('ENG23', 'ENGINEERING', 'FINAL', permitFeeAmount, 'N');
        }else if (appMatch("PublicWorks/Engineering/MOT/NA")){
            var wfObj = aa.workflow.getTasks(capId).getOutput();
            for (i in wfObj){
                fTask = wfObj[i];
                if (fTask.getTaskDescription().equals("Engineering Review")){
                    wfHours = fTask.getHoursSpent();
                    if (Number(wfHours) > 0){
                        updateFee('ENG08', 'ENGINEERING', 'FINAL', wfHours, 'N');
                        //permitFeeAmount = (wfHours * 137);
                    }
                }
            }
        }else if (appMatch("PublicWorks/Engineering/Sidewalk Cafe/NA") || appMatch("PublicWorks/Engineering/Sidewalk Cafe/Renewal")){
            if (AInfo['Cafe Location'] == "Young Circle"){
                var sgFt = AInfo['Reviewer Sq. Ft'];
                updateFee('ENG16', 'ENGINEERING', 'FINAL', sgFt, 'N');
            }
            updateFee('ENG17', 'ENGINEERING', 'FINAL', 1, 'N');
        }else{
            if (appMatch("PublicWorks/Engineering/Paving/NA")){
                if (!matches(AInfo['Type of Property'],"Single Family","Multi-Family")){
                    feeAmountENG05 = Math.max(reviewerValuation * 0.05, 54);
                    updateFee('ENG05', 'ENGINEERING', 'FINAL', feeAmountENG05, 'N');
                    logDebug("Fee Amount ENG05 Calculated: " + feeAmountENG05);
                }else if (AInfo['Type of Property'] == "Single Family"){
                    updateFee('ENG01', 'ENGINEERING', 'FINAL', 1, 'N');
                }else if (AInfo['Type of Property'] == "Multi-Family"){
                    updateFee('ENG02', 'ENGINEERING', 'FINAL', 1, 'N');
                }
                
            }
            if (reviewerValuation){
                updateFee('ENG23', 'ENGINEERING', 'FINAL', permitFeeAmount, 'N');
            }
        }
  //End Apply Permit and County Fees

  //Start Apply Tech and Edu Fees
        //Tech and EDU fees are only calculated againsg ENG Permit Fee 1001 - 07182024
        /*var feeResult = aa.finance.getFeeItemByCapID(capId);
        var totalApplicableFees = 0;
        if (feeResult.getSuccess()) {
            var feeList = feeResult.getOutput();
            for (var i in feeList) {
                var feeItem = feeList[i];
                var feeSubGroup = feeItem.getSubGroup();
                if (feeSubGroup == "TECH,EDU") {
                    totalApplicableFees += feeItem.getFee();
                }
            }
            logDebug("totalApplicableFees: " + totalApplicableFees);
        }*/
        if (!appMatch("PublicWorks/Engineering/MOT/NA")){
            if(permitFeeAmount > 0){
                updateFee('BLD24', 'BUILDING', 'FINAL', permitFeeAmount, 'N');
                updateFee('BLD25', 'BUILDING', 'FINAL', permitFeeAmount, 'N');
            }
        }
  //End Apply Tech and Edu Fees
        invoiceAllFees();
}
//Start: Send Issuance email with Building Permit Report
if (wfStatus == "Issued"){
    //Notification and Reports
    var envParameters = aa.util.newHashMap();
    envParameters.put("CapID",capId);
    aa.runAsyncScript("ASYNCRUNBUILDINGPERMITRPT", envParameters, 5000);
}
//End: Send Issuance email with Building Permit Report   
