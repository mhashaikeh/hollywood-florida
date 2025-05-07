if (wfStatus == "Evaluate New Value"){

    var pCapId = getParent();

    if (AInfo['Increase in Construction Value'] == "Yes") {
        var targetFees = loadFees(pCapId);
        var origFeeAmount = 0;

        // Iterate through target fees to find the original fee amount
        for (var tFeeNum in targetFees) {
            var targetFee = targetFees[tFeeNum];
            logDebug("fee status is " + targetFee.status);

            if (targetFee.status == "INVOICED" && targetFee.description == "Building Permit Fee") {
                origFeeAmount += targetFee.amount;
            }
        }

        var reviewerValuation = AInfo["Reviewer Valuation"];
        var newConstValue = AInfo["New Construction Value"];

        if (origFeeAmount > 0) {
            logDebug("origFeeAmount: " + origFeeAmount);

            // Calculate the higher value
            var higherValue = Math.max(reviewerValuation, newConstValue);

            var feeAmount = 0;

            // Calculate the new fee amount based on higher value
            if (higherValue <= 1000) {
                feeAmount = 100;
            } else if (higherValue <= 1000000) {
                feeAmount = 100 + (higherValue - 1000) * 0.022;
            } else if (higherValue <= 2000000) {
                feeAmount = 100 + (1000000 - 1000) * 0.022 + (higherValue - 1000000) * 0.0165;
            } else {
                feeAmount = 100 + (1000000 - 1000) * 0.022 + (2000000 - 1000000) * 0.0165 + (higherValue - 2000000) * 0.0115;
            }

            if (feeAmount > origFeeAmount) {
                feeAmount -= origFeeAmount;
                logDebug("New Fee Amount: " + feeAmount);

                var permitIssued = isTaskActiveByCapID("Inspection", pCapId);
                if (!permitIssued){
                    recCapId = pCapId;
                }else{
                    recCapId = capId;
                }

                // Apply the new building permit fee
                updateFeeByCapId("BLD01", "BUILDING", "FINAL", feeAmount, "N", "", recCapId);
                logDebug("Fee Amount Calculated: " + feeAmount);

                // Apply Certificate of Completion Fees
                var ownerAsBuilder = getAppSpecific("Owner as Builder", pCapId);
                var isSubPermit = getAppSpecific("Is this application being submitted as a sub-permit to a master building permit", pCapId);

                var feeAmountBLD21 = 0;
                var feeAmountBLD22 = 0;

                if (ownerAsBuilder == 'Yes' && isSubPermit == 'No') {
                    feeAmountBLD21 = Math.max(feeAmount * 0.01, 15);
                    updateFeeByCapId('BLD21', 'BUILDING', 'FINAL', feeAmountBLD21, 'N', "", recCapId);
                    logDebug("Fee Amount BLD21 Calculated: " + feeAmountBLD21);
                } else if (ownerAsBuilder === 'No' && isSubPermit == 'No') {
                    feeAmountBLD22 = Math.max(feeAmount * 0.03, 45);
                    updateFeeByCapId('BLD22', 'BUILDING', 'FINAL', feeAmountBLD22, 'N', "", recCapId);
                    logDebug("Fee Amount BLD22 Calculated: " + feeAmountBLD22);
                }

                // Apply County Fee
                var countyFeeAmount = Math.max((higherValue / 1000) * 0.52, 2);
                updateFeeByCapId('COUNTY', 'GOVERNMENTAL', 'FINAL', countyFeeAmount, 'N', "", recCapId);

                // Apply State Fee and other fees
                var stateFeeAmount = feeAmount * 0.03;
                updateFeeByCapId('STATE', 'GOVERNMENTAL', 'FINAL', stateFeeAmount, 'N', "", recCapId);
                updateFeeByCapId('BLD24', 'BUILDING', 'FINAL', feeAmount, 'N', "", recCapId);
                updateFeeByCapId('BLD25', 'BUILDING', 'FINAL', feeAmount, 'N', "", recCapId);
                invoiceAllFees(recCapId);

                // Log the calculated fees
                logDebug("STATE Fee Amount Calculated: " + stateFeeAmount);
                logDebug("Technology Fee Amount Calculated: " + (feeAmount * 0.02));
                logDebug("Education Fee Amount Calculated: " + (feeAmount * 0.01));

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
                    getDepartmentParams4Notification(params, "Fire Prevention");
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
                    sendNotification("epermits@hollywoodfl.org", emailAddress, "", "SS_PAYMENT_DUE", params, null);
                }
                capId = holdId;
            }
        } else {
            // Update app specific values if no original fee amount is found
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
