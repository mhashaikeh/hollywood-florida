try {
    if (wfStatus == "Evaluate New Value" || (wfTask == "Plans Coordination" && wfStatus == "Awaiting Payment")) {
        var pCapId = getParent();

        if (AInfo['Increase in Construction Value'] == "Yes") {
            var targetFees = loadFees(pCapId);
            var origFeeAmount = 0;

            // Iterate through target fees to find the original fee amount
            for (var tFeeNum in targetFees) {
                var targetFee = targetFees[tFeeNum];

                if (targetFee.status == "INVOICED" && targetFee.description == "Building Permit Fee") {
                    origFeeAmount += targetFee.amount;
                }
            }

            var parentReviewerValuation = getAppSpecific("Reviewer Valuation", pCapId);
            var reviewerValuation = AInfo["Reviewer Valuation"];
            var newConstValue = AInfo["New Construction Value"];


            // Calculate the higher value
            var higherValue = Math.max(reviewerValuation, newConstValue);

            if (origFeeAmount > 0) {

                function calculateFeeAmount(value) {
                    var feeAmount = 0;
                    if (value <= 1000) {
                        feeAmount = 100;
                    } else if (value <= 1000000) {
                        feeAmount = 100 + (value - 1000) * 0.022;
                    } else if (value <= 2000000) {
                        feeAmount = 100 + (1000000 - 1000) * 0.022 + (value - 1000000) * 0.0165;
                    } else {
                        feeAmount = 100 + (1000000 - 1000) * 0.022 + (2000000 - 1000000) * 0.0165 + (value - 2000000) * 0.0115;
                    }
                    return feeAmount;
                }

                var origFeeFromParentValuation = calculateFeeAmount(parentReviewerValuation);
                var newFeeAmount = calculateFeeAmount(higherValue);

                var feeDifference = newFeeAmount - origFeeFromParentValuation;
                if (feeDifference > 0) {
                    var permitIssued = isTaskActiveByCapID("Inspection", pCapId);
                    var recCapId = permitIssued ? capId : pCapId;
                    var feeComment = "";
                    if (recCapId.getCustomID() == pCapId.getCustomID()) {
                        feeComment = "" + capId.getCustomID()
                    }

                    // Apply the new building permit fee
                    addFeeWithExtraData("BLD01", "BUILDING", "FINAL", feeDifference, "N", recCapId, feeComment, "", "");

                    // Apply Certificate of Completion Fees
                    var ownerAsBuilder = getAppSpecific("Owner as Builder", pCapId);
                    var isSubPermit = getAppSpecific("Is this application being submitted as a sub-permit to a master building permit", pCapId);

                    var feeAmountBLD21 = 0;
                    var feeAmountBLD22 = 0;

                    if (ownerAsBuilder == 'Yes' && isSubPermit == 'No') {
                        feeAmountBLD21 = Math.max(feeDifference * 0.01, 15);
                        addFeeWithExtraData('BLD21', 'BUILDING', 'FINAL', feeAmountBLD21, 'N', recCapId, feeComment, "", "");
                        logDebug("Fee Amount BLD21 Calculated: " + feeAmountBLD21);
                    } else if (ownerAsBuilder === 'No' && isSubPermit == 'No') {
                        feeAmountBLD22 = Math.max(feeDifference * 0.03, 45);
                        addFeeWithExtraData('BLD22', 'BUILDING', 'FINAL', feeAmountBLD22, 'N', recCapId, feeComment, "", "");
                        logDebug("Fee Amount BLD22 Calculated: " + feeAmountBLD22);
                    }

                    // Apply County Fee
                    var countyFeeAmount = Math.max((feeDifference / 1000) * 0.52, 2);
                    addFeeWithExtraData('COUNTY', 'GOVERNMENTAL', 'FINAL', countyFeeAmount, 'N', recCapId, feeComment, "", "");

                    // Apply State Fee and other fees
                    var stateFeeAmount = feeDifference * 0.03;
                    addFeeWithExtraData('STATE', 'GOVERNMENTAL', 'FINAL', stateFeeAmount, 'N', recCapId, feeComment, "", "");
                    addFeeWithExtraData('BLD24', 'BUILDING', 'FINAL', feeDifference, 'N', recCapId, feeComment, "", "");
                    addFeeWithExtraData('BLD25', 'BUILDING', 'FINAL', feeDifference, 'N', recCapId, feeComment, "", "");
                    invoiceAllFees(recCapId);

                    // Log the calculated fees
                    logDebug("STATE Fee Amount Calculated: " + stateFeeAmount);
                    logDebug("Technology Fee Amount Calculated: " + (feeDifference * 0.02));
                    logDebug("Education Fee Amount Calculated: " + (feeDifference * 0.01));

                    logDebug("Sending Payment Due notification");

                    // If the workflow is in Evaluate New Value, send notification and attach to parent
                    if (wfStatus == "Evaluate New Value") {
                        logDebug("Sending Payment Due notification to parent");
                        sendPaymentDueNotification(recCapId);
                    }
                    

                    // Update app specific values on parent Record
                    editAppSpecific("Reviewer Valuation", reviewerValuation, pCapId);
                    editAppSpecific("Estimated Cost (Job Value)", newConstValue, pCapId);
                }
            } else {
                editAppSpecific("Reviewer Valuation", reviewerValuation, pCapId);
                editAppSpecific("Estimated Cost (Job Value)", newConstValue, pCapId);
            }
        }

    }
}
catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "WTUA:BuildingAmendment/*/*/* error adding fees " + capId.getCustomID(), err + debug + err.stack);
}

try {
    // Start: Invoice manually applied fees
    if (wfStatus == "Awaiting Payment") {
        var newFeeFound = false;
        var targetFees = loadFees(capId);
        for (tFeeNum in targetFees) {
            var targetFee = targetFees[tFeeNum];
            if (targetFee.status == "NEW") {
                newFeeFound = true;
            }
        }
        if (newFeeFound) {
            invoiceAllFees();
        }
    }
}
catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "WTUA:BuildingAmendment/*/*/* error invoicing fees " + capId.getCustomID(), err + debug + err.stack);
}

// End: Invoice manually applied fees

function sendPaymentDueNotification(recCapId) {
    try {
        holdId = capId;
        capId = recCapId;
        var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
        var acaUrl = acaSite.replace("/Admin/login.aspx", "");
        buildRecURL = acaUrl + getACAUrl(capId);
        buildPayURL = buildRecURL.replace("1000", "1009");
        recCap = aa.cap.getCap(capId).getOutput();
        capDetails = aa.cap.getCapDetail(capId).getOutput();

        // Get all unique contact emails
        var allEmails = getNotificationEmails("All", false);

        if (allEmails) {
            var params = aa.util.newHashtable();
            getDepartmentParams4Notification(params, "Fire Prevention");
            var bureauName = lookup("Reporting Information Standards", "Bureau Name");
            addParameter(params, "$$BureauName$$", bureauName);
            addParameter(params, "$$balanceDue$$", capDetails.getBalance());
            addParameter(params, "$$acaPaymentUrl$$", buildPayURL);
            addParameter(params, "$$acaRecordUrl$$", buildRecURL);
            addParameter(params, "$$ContactName$$", "Applicant");
            addParameter(params, "$$altID$$", capId.getCustomID());
            addParameter(params, "$$recordAlias$$", recCap.getCapType().getAlias());
            addParameter(params, "$$url4ACA$$", acaUrl);
            sendNotification("Accela@HollywoodFl.org", allEmails, "", "SS_PAYMENT_DUE", params, null);
            logDebug("Payment Due notification sent to: " + allEmails);
        } else {
            logDebug("No contact emails found on record");
        }
        capId = holdId;
    } catch (err) {
        var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
        aa.sendMail("no-reply@accela.com", emailAddress, "", "WTUA:BuildingAmendment/*/*/* error sending email " + capId.getCustomID(), err + debug + err.stack);
    }
}
