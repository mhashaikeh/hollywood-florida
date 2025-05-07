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
if (appMatch("PublicWorks/Utilities/Onsite Drainage/NA") || appMatch("PublicWorks/Utilities/Station/NA")){
    if (wfTask == "Utilities Review" && matches(wfStatus,"Approved", "Approved w/ Comments")){
        var reviewerValuation = AInfo["Reviewer Valuation"];
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

        if (appMatch("PublicWorks/Utilities/Onsite Drainage/NA")){
            updateFee("UTL11", "UTILITIES", "FINAL", feeAmount, "N");
            updateFee("UTL12", "UTILITIES", "FINAL", feeAmount, "N");
        }

        if (appMatch("PublicWorks/Utilities/Station/NA")){
            updateFee("UTL09", "UTILITIES", "FINAL", feeAmount, "N");
            updateFee("UTL10", "UTILITIES", "FINAL", feeAmount, "N");
        }
    }

    if (appMatch("PublicWorks/Utilities/Station/NA")){
        if (wfTask == "Engineering Review" && matches(wfStatus,"Approved", "Approved w/ Comments")){
            var reviewerValuation = AInfo["Reviewer Valuation"];
            feeAmountENG05 = Math.max(reviewerValuation * 0.05, 54);
            updateFee('ENG05', 'ENGINEERING', 'FINAL', feeAmountENG05, 'N');
            logDebug("Fee Amount ENG05 Calculated: " + feeAmountENG05);
        }
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

//Start: Apply Post Issuance Conditions
if (wfStatus ==  "Ready to Issue") {
    if (appMatch("PublicWorks/Utilities/Onsite Drainage/NA") || appMatch("PublicWorks/Utilities/Station/NA")){
        if (appMatch("PublicWorks/Utilities/Station/NA") || (appMatch("PublicWorks/Utilities/Onsite Drainage/NA") && !matches(AInfo['Type of Property'],"Manufactured Home","Single Family"))){
            if (!appHasCondition("Permit", "Applied", "As-Builts Required", null)) {
                addStdCondition("Permit", "As-Builts Required");
            }
            if (!appHasCondition("Permit", "Applied", "Test Results Required", null)) {
                addStdCondition("Permit", "Test Results Required");
            }
            if (!appHasCondition("Permit", "Applied", "Outside Agency/Broward County Clearances Required", null)) {
                addStdCondition("Permit", "Outside Agency/Broward County Clearances Required");
            }
            if (appMatch("PublicWorks/Utilities/Station/NA")){
                if (!appHasCondition("Permit", "Applied", "Start-Up Report Required", null)) {
                    addStdCondition("Permit", "Start-Up Report Required");
                }
                if (!appHasCondition("Permit", "Applied", "Operations and Maintenance Manual and Agreement Required", null)) {
                    addStdCondition("Permit", "Operations and Maintenance Manual and Agreement Required");
                }
                if (!appHasCondition("Permit", "Applied", "Maintenance Agreement Required", null)) {
                    addStdCondition("Permit", "Maintenance Agreement Required");
                }
                if (!matches(AInfo['Type of Property'],"Manufactured Home","Single Family")){
                    if (!appHasCondition("Permit", "Applied", "Conveyance Documentation Required", null)) {
                        addStdCondition("Permit", "Conveyance Documentation Required");
                    }
                }else{
                    if (!appHasCondition("Permit", "Applied", "Registration thru Regulatory Compliance Required", null)) {
                        addStdCondition("Permit", "Registration thru Regulatory Compliance Required");
                    }
                }
            }
        }

        //Start: Apply Building Permit Fee
        if (appMatch("PublicWorks/Utilities/Onsite Drainage/NA")){
            var reviewerValuation = AInfo["Reviewer Valuation"];
            var feeAmount = 0;

            if (reviewerValuation <= 1000) {
                feeAmount = 100;
            } else if (reviewerValuation <= 1000000) {
                feeAmount = 100 + (reviewerValuation - 1000) * 0.022;
            } else if (reviewerValuation <= 2000000) {
                feeAmount = 100 + (1000000 - 1000) * 0.022 + (reviewerValuation - 1000000) * 0.0165;
            } else {
                feeAmount = 100 + (1000000 - 1000) * 0.022 + (2000000 - 1000000) * 0.0165 + (reviewerValuation - 2000000) * 0.0115;
            }

            // Apply the fee with the calculated amount
            updateFee("BLD01", "BUILDING", "FINAL", feeAmount, "N");

            // Log the calculated fee amount for reference
            logDebug("Fee Amount Calculated: " + feeAmount);
            //End: Apply Building Permit Fee

            // Start Apply Certificate of Completion Fees
            var ownerAsBuilder = AInfo["Owner as Builder"];
            var isSubPermit = AInfo["Is this application being submitted as a sub-permit to a master building permit"];
            var permitFee = feeAmount;

            // Initialize fee variables
            var feeAmountBLD21 = 0;
            var feeAmountBLD22 = 0;

            // Calculate the fees based on the conditions
            if (ownerAsBuilder == 'Yes' && isSubPermit == 'No') {
                feeAmountBLD21 = Math.max(permitFee * 0.01, 15);
                updateFee('BLD21', 'BUILDING', 'FINAL', feeAmountBLD21, 'N');
                logDebug("Fee Amount BLD21 Calculated: " + feeAmountBLD21);
            } else if (ownerAsBuilder == 'No' && isSubPermit == 'No') {
                feeAmountBLD22 = Math.max(permitFee * 0.03, 45);
                updateFee('BLD22', 'BUILDING', 'FINAL', feeAmountBLD22, 'N');
                logDebug("Fee Amount BLD22 Calculated: " + feeAmountBLD22);
            }
            // End Apply Certificate of Completion Fees

            // Start Apply County Fee
            var countyFeeAmount = Math.max((reviewerValuation / 1000) * 0.52, 2);
            updateFee('COUNTY', 'GOVERNMENTAL', 'FINAL', countyFeeAmount, 'N');

            //End Apply County Fee

            // Calculate the STATE fee
            var stateFeeAmount = permitFee * 0.03;
            updateFee('STATE', 'GOVERNMENTAL', 'FINAL', stateFeeAmount, 'N');
            updateFee('BLD24', 'BUILDING', 'FINAL', permitFee, 'N');
            updateFee('BLD25', 'BUILDING', 'FINAL', permitFee, 'N');
            logDebug("STATE Fee Amount Calculated: " + stateFeeAmount);
            logDebug("Technology Fee Amount Calculated: " + (permitFee * 0.02));
            logDebug("Education Fee Amount Calculated: " + (permitFee * 0.01));
            // End Calculate State, Tech, Education Fees
        }
        invoiceAllFees();
    }
}
//End: Apply Post Issuance Conditions

//Start: Send Issuance email with Building Permit Report
if (wfStatus == "Issued"){
    //Notification and Reports
    var envParameters = aa.util.newHashMap();
    envParameters.put("CapID",capId);
    aa.runAsyncScript("ASYNCRUNBUILDINGPERMITRPT", envParameters, 5000);
}
//End: Send Issuance email with Building Permit Report   

//Start: Send Request Complete Email with attached doc or report
if (wfStatus == "Request Complete"){
    if (matches(appTypeArray[2], "Flood Zone Determination", "Sewer Connection", "Atlas Request")) {
        var priContact = getContactObj(capId,"Applicant");
        var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
        var acaUrl = acaSite.replace("/Admin/login.aspx", "");
        buildRecURL = acaUrl + getACAUrl(capId);
        recCap = aa.cap.getCap(capId).getOutput();
        capDetails = aa.cap.getCapDetail(capId).getOutput();
        var rFiles = [];
        var docName = "";
        if (appTypeArray[2] == "Flood Zone Determination"){
            // Set the report parameters.
            var rptParams = aa.util.newHashMap();
            var altID = capId.getCustomID();
            rptParams.put("RecordID", altID);
            var ccEmail = "";
            var reportName = "Flood Zone Determination";
        }else if (appTypeArray[2] == "Sewer Connection"){
            docName = "Sewer Connection Map";
        }else{
            docName = "Utility Atlas Map";
        }

        if(priContact){
            var params = aa.util.newHashtable();
            getDepartmentParams4Notification(params, "Building Division");
            var bureauName = lookup("Reporting Information Standards", "Bureau Name");
            addParameter(params, "$$BureauName$$", bureauName);
            addParameter(params, "$$acaRecordUrl$$", buildRecURL);
            addParameter(params, "$$altID$$", capId.getCustomID());
            addParameter(params, "$$recordAlias$$", recCap.getCapType().getAlias());
            addParameter(params, "$$ContactName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
            var emailAddress = ""+priContact.capContact.getEmail();
            addParameter(params, "$$url4ACA$$", acaUrl);
            if (appTypeArray[2] == "Flood Zone Determination"){
                runReportAndSendAsyncWaitTime(reportName, cap.getCapModel().getModuleName(), capId, rptParams, "Accela@HollywoodFl.org", emailAddress, "SS_REQUEST_COMPLETE", params, ccEmail);
            }else{
                var docList = aa.document.getDocumentListByEntity(capId.toString(),"CAP").getOutput();
                var num = docList.size();
                if(num>0) {
                    for(var i=0;i<num;i++){
                        if(docList.get(i).getDocCategory() == docName) {
                            docContent = aa.document.downloadFile2Disk(docList.get(i), "PublicWorks", "", "", true);
                            rFile = docContent.getOutput();
                            rFiles.push(rFile);
                        }
                    }
                }
                sendNotification("Accela@HollywoodFl.org", emailAddress, "", "SS_REQUEST_COMPLETE", params, rFiles);
            }
        }
    }
}
//End: Send Request Complete Email with attached doc or report

//Start: Send Request for New Meter Email with attached  report
if (wfStatus == "Ready for Signature"){
    if (appTypeArray[2] == "Water Meter New") {
        var priContact = getContactObj(capId,"Applicant");
        var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
        var acaUrl = acaSite.replace("/Admin/login.aspx", "");
        buildRecURL = acaUrl + getACAUrl(capId);
        recCap = aa.cap.getCap(capId).getOutput();
        capDetails = aa.cap.getCapDetail(capId).getOutput();
        var rFiles = [];
        var docName = "";
        // Set the report parameters.
        var rptParams = aa.util.newHashMap();
        var altID = capId.getCustomID();
        rptParams.put("RecordID", altID);
        var ccEmail = "";
        var reportName = "Request for New Meter";


        if(priContact){
            var params = aa.util.newHashtable();
            getDepartmentParams4Notification(params, "Utilities Division");
            var bureauName = lookup("Reporting Information Standards", "Bureau Name");
            addParameter(params, "$$BureauName$$", bureauName);
            addParameter(params, "$$acaRecordUrl$$", buildRecURL);
            addParameter(params, "$$altID$$", capId.getCustomID());
            addParameter(params, "$$recordAlias$$", recCap.getCapType().getAlias());
            addParameter(params, "$$ContactName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
            var emailAddress = ""+priContact.capContact.getEmail();
            addParameter(params, "$$url4ACA$$", acaUrl);
            runReportAndSendAsyncWaitTime(reportName, cap.getCapModel().getModuleName(), capId, rptParams, "Accela@HollywoodFl.org", emailAddress, "SS_AWMREQ_READY_FOR_SIGNATURE", params, ccEmail);
        }
    }
}
//End: Send Request Complete Email with attached doc or report
