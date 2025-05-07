if (wfStatus == "Evaluate New Value"){

    var pCapId = getParent();

    if (AInfo['Increase in Construction Value'] == "Yes") {
        var targetFees = loadFees(pCapId);
        var origFeeAmount = 0;

        // Iterate through target fees to find the original fee amount
        for (var tFeeNum in targetFees) {
            var targetFee = targetFees[tFeeNum];
            logDebug("fee status is " + targetFee.status);

            if (targetFee.status == "INVOICED" && targetFee.description == "Engineering Permit Fee") {
                origFeeAmount += targetFee.amount;
            }
        }

        var parentReviewerValuation = getAppSpecific("Reviewer Valuation", pCapId);
        var reviewerValuation = AInfo["Reviewer Valuation"];
        var newConstValue = AInfo["New Construction Value"];

        // Calculate the higher value
        var higherValue = Math.max(reviewerValuation, newConstValue);

        if (origFeeAmount > 0){

            function calculateFeeAmount(value) {
                var feeAmount = 0;
                    feeAmount = Math.max(value * 0.05, 50);
                return feeAmount;
            }

            // Calculate the higher value
            var higherValue = Math.max(reviewerValuation, newConstValue);

            var origFeeFromParentValuation = calculateFeeAmount(parentReviewerValuation);
            var newFeeAmount = calculateFeeAmount(higherValue);

            logDebug("origFeeFromParentValuation: " + origFeeFromParentValuation);
            logDebug("newFeeAmount: " + newFeeAmount);

            var feeDifference = newFeeAmount - origFeeFromParentValuation;
            logDebug("Fee Difference: " + feeDifference);

            if (feeDifference > 0) {

                var permitIssued = isTaskActiveByCapID("Inspection", pCapId);
                var recCapId = permitIssued ? capId : pCapId;
                var feeComment = "";
                if (recCapId.getCustomID() == pCapId.getCustomID()){
                    feeComment = "" + capId.getCustomID()
                }

                // Apply the new building permit fee
                addFeeWithExtraData("ENG23", "ENGINEERING", "FINAL", feeDifference, "N", recCapId, feeComment, "", "");
                logDebug("Fee Amount Calculated: " + feeDifference);

                // Apply Certificate of Completion Fees
                var ownerAsBuilder = getAppSpecific("Owner as Builder", pCapId);
                var isSubPermit = getAppSpecific("Is this application being submitted as a sub-permit to a master building permit", pCapId);

                var feeAmountBLD21 = 0;
                var feeAmountBLD22 = 0;


                // Apply State Fee and other fees
                addFeeWithExtraData('BLD24', 'BUILDING', 'FINAL', feeDifference, 'N', recCapId, feeComment, "", "");
                addFeeWithExtraData('BLD25', 'BUILDING', 'FINAL', feeDifference, 'N', recCapId, feeComment, "", "");
                invoiceAllFees(recCapId);

                // Log the calculated fees
                logDebug("Technology Fee Amount Calculated: " + (feeDifference * 0.02));
                logDebug("Education Fee Amount Calculated: " + (feeDifference * 0.01));

                //Send Notification and attach to parent
                holdId = capId;
                capId = recCapId;
                var priContact = getContactObj(capId,"Applicant");
                var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
                var acaUrl = acaSite.replace("/Admin/login.aspx", "");
                buildRecURL = acaUrl + getACAUrl(capId);
                buildPayURL = buildRecURL.replace("1000", "1009");
                recCap = aa.cap.getCap(capId).getOutput();
                capDetails = aa.cap.getCapDetail(capId).getOutput();
                if(priContact){
                    var params = aa.util.newHashtable();
                    getDepartmentParams4Notification(params, "Engineering Division");
                    var bureauName = lookup("Reporting Information Standards", "Bureau Name");
                    addParameter(params, "$$BureauName$$", bureauName);
                    addParameter(params, "$$balanceDue$$", capDetails.getBalance());
                    addParameter(params, "$$acaPaymentUrl$$", buildPayURL);
                    addParameter(params, "$$acaRecordUrl$$", buildRecURL);
                    addParameter(params, "$$altID$$", capId.getCustomID());
                    addParameter(params, "$$recordAlias$$", recCap.getCapType().getAlias());
                    addParameter(params, "$$ContactName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
                    var emailAddress = ""+priContact.capContact.getEmail();
                    addParameter(params, "$$url4ACA$$", acaUrl);
                    sendNotification("Accela@HollywoodFl.org", emailAddress, "", "SS_PAYMENT_DUE", params, null);
                }
                capId = holdId;

                // Update app specific values if no original fee amount is found
                editAppSpecific("Reviewer Valuation", reviewerValuation, pCapId);
                editAppSpecific("Estimated Cost (Job Value)", newConstValue, pCapId);
            }
        }else{
            editAppSpecific("Reviewer Valuation", reviewerValuation, pCapId);
            editAppSpecific("Estimated Cost (Job Value)", newConstValue, pCapId); 
        }       
    }
}

//Start: Invoice manually applied fees
if (wfStatus == "Awaiting Payment"){

    var newFeeFound = false;
    var targetFees = loadFees(capId);
    for (tFeeNum in targetFees) {
        targetFee = targetFees[tFeeNum];
        if (targetFee.status == "NEW") {
            newFeeFound = true;
        }
    }
    if(newFeeFound){
        invoiceAllFees();
    }
}
//End: Invoice manually applied fees
