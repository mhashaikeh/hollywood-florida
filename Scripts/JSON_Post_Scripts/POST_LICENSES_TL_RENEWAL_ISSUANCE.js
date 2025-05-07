/*------------------------------------------------------------------------------------------------------/
| Program        : POST_LICENSES_TL_RENEWAL_ISSUANCE.js
| Event          : STDBASE - Post Script
| Usage          : Update License information after issuance and cap created
| Created by     : JSHEAR 5/12/2024
/------------------------------------------------------------------------------------------------------*/

try {
    logDebug("parentLic: " + parentCapId);

    var parentCap = aa.cap.getCap(parentCapId).getOutput();
    var parentAltId = parentCap.getCapID().getCustomID();
    var licNum = (appTypeArray[2] == "State") ? "State License Number" : "County License Number";
    var licExp = (appTypeArray[2] == "State") ? "State License Expiration Date" : "County License Expiration Date";
    var transLic = getLpFromCap(parentCapId);
    var newLic = getRefLicenseProf(AInfo[licNum]);


    logDebug("licNum: " + licNum);
    logDebug("licExp: " + licExp);
    logDebug("newLic: " + newLic);
    // logDebug("transLic: " + transLic);

    if (newLic) {
        updating = true;
        logDebug("Updating existing Ref Lic Prof: " + parentAltId);

        if (AInfo["Insurance Provider"]) {
            newLic.setInsuranceCo(AInfo["Insurance Provider"]);
            logDebug("Set Insurance Provider: " + AInfo["Insurance Provider"]);
        }

        if (AInfo["Insurance Policy Number"]) {
            newLic.setPolicy(AInfo["Insurance Policy Number"]);
            logDebug("Set Insurance Policy Number: " + AInfo["Insurance Policy Number"]);
        }

        if (AInfo["Insurance Expiration Date"]) {
            var insuranceExpDate = aa.date.parseDate(AInfo["Insurance Expiration Date"]);
            if (insuranceExpDate) {
                newLic.setInsuranceExpDate(insuranceExpDate);
                logDebug("Set Insurance Expiration Date: " + AInfo["Insurance Expiration Date"]);
            } else {
                logDebug("**ERROR: Invalid Insurance Expiration Date: " + AInfo["Insurance Expiration Date"]);
            }
        }

        if (AInfo[licNum]) {
            newLic.setBusinessLicense(AInfo[licNum]);
            logDebug("Set Business License: " + AInfo[licNum]);
        }

        if (AInfo[licExp]) {
            var businessLicExpDate = aa.date.parseDate(AInfo[licExp]);
            if (businessLicExpDate) {
                newLic.setBusinessLicExpDate(businessLicExpDate);
                logDebug("Set Business License Expiration Date: " + AInfo[licExp]);
            } else {
                logDebug("**ERROR: Invalid Business License Expiration Date: " + AInfo[licExp]);
            }
        }

        if (AInfo["Workers Compensation Number"]) {
            newLic.setWcPolicyNo(AInfo["Workers Compensation Number"]);
            logDebug("Set Workers Compensation Number: " + AInfo["Workers Compensation Number"]);
        }

        if (AInfo["Workers Compensation Expiration Date"]) {
            var wcExpDate = aa.date.parseDate(AInfo["Workers Compensation Expiration Date"]);
            if (wcExpDate) {
                newLic.setWcExpDate(wcExpDate);
                logDebug("Set Workers Compensation Expiration Date: " + AInfo["Workers Compensation Expiration Date"]);
            } else {
                logDebug("**ERROR: Invalid Workers Compensation Expiration Date: " + AInfo["Workers Compensation Expiration Date"]);
            }
        }

        if (AInfo["Workers Compensation Provider"]) {
            newLic.setContLicBusName(AInfo["Workers Compensation Provider"]);
            logDebug("Set Workers Compensation Provider: " + AInfo["Workers Compensation Provider"]);
        }

        if (AInfo[licExp]) {
            var licenseExpirationDate = aa.date.parseDate(AInfo[licExp]);
            if (licenseExpirationDate) {
                newLic.setLicenseExpirationDate(licenseExpirationDate);
                logDebug("Set License Expiration Date: " + AInfo[licExp]);
            } else {
                logDebug("**ERROR: Invalid License Expiration Date: " + AInfo[licExp]);
            }
        }

        if (AInfo["Workers Compensation Exempt"] == "Yes") {
            newLic.setWcExempt("Y");
            logDebug("Set Workers Compensation Exempt: Yes");
        } else {
            newLic.setWcExempt("N");
            logDebug("Set Workers Compensation Exempt: No");
        }

        if (licHasCondition("Status", "Applied", "Contractor - must update credentials", AInfo[licNum])) {
            removeLicConditionStatus("Status", "Contractor - must update credentials", "Applied", AInfo[licNum]);
        }

    }

    if (updating) {
        var myResult;
        if (newLic) {
            myResult = aa.licenseScript.editRefLicenseProf(newLic);
        }
        if (transLic) {
            myResult = aa.licenseProfessional.editLicensedProfessional(transLic);
        }

        if (myResult && myResult.getSuccess()) {
            logDebug("Successfully updated License No. " + parentAltId);
        } else {
            logDebug("**ERROR: can't update lic prof: " + (myResult ? myResult.getErrorMessage() : "No result returned"));
        }
    }

    //Set renewal to complete, used to prevent more than one renewal record for the same cycle
    renewalCapProject = getRenewalCapByParentCapIDForIncomplete(parentCapId);
    if (renewalCapProject != null) {
        renewalCapProject.setStatus("Complete");
        renewalCapProject.setRelationShip("R");  // move to related records
        aa.cap.updateProject(renewalCapProject);
        aa.cap.updateAccessByACA(capId, "N");
    }



    //Start: Send Renewal Complete Notification
    var notificationTemplate = "SS_LICENSE_RENEWAL_COMP";
    var priContact = getContactObj(capId, "Qualifying Individual");
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    var acaUrl = acaSite.replace("/admin/Login.aspx", "")


    if (priContact) {
        var eParams = aa.util.newHashtable();
        addParameter(eParams, "$$altID$$", parentAltId);
        addParameter(eParams, "$$recordAlias$$", aa.cap.getCap(parentCapId).getOutput().getCapType().getAlias());
        addParameter(eParams, "$$ContactName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
        var contactEmail = "" + priContact.capContact.getEmail();
        addParameter(eParams, "$$acaRecordUrl$$", acaUrl);
        sendNotification("Accela@HollywoodFl.org", contactEmail, "", notificationTemplate, eParams, null, capId)
    }
    //End: Send Renewal Complete Notification

    // MAS SF#01486146 - get all associated building records and issue permit if criteria met
    if (newLic) {
        issueLpAssociatedRecords(newLic);
    }

} catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; // email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "POST_LICENSE_ISSUANCE", err + debug);
}


// MAS SF#01486146
function issueLpAssociatedRecords(licenseNumber) {
    var assoCapsScriptResult = aa.licenseScript.getCapIDsByLicenseModel(licenseNumber);
    if (assoCapsScriptResult.getSuccess()) {
        var assoCapsArr = assoCapsScriptResult.getOutput();
        if (assoCapsArr && assoCapsArr.length > 0) {
            for (var c in assoCapsArr) {
                var capIDScriptModel = assoCapsArr[c];
                var itemCapId = capIDScriptModel.getCapID();
                var itemCap = aa.cap.getCap(itemCapId).getOutput();
                var itemCapAppStatus = itemCap.getCapStatus();
                var itemAppTypeArr = itemCap.getCapType().toString().split("/");
                if (itemAppTypeArr[1] != "Amendment" && matches(itemCapAppStatus, "Ready to Issue", "Awaiting Payment")
                    && getCapBalanceDue(itemCapId) <= 0 && isLicenseProfActive(itemCapId)) {
                    //Verify that Master Permit is Issued before Issuing Sub-Permit
                    var masterPermitIssued = false;
                    var pCapId = getParentByCapId(itemCapId);
                    if (pCapId) {
                        masterPermitIssued = isTaskActiveByCapID("Inspection", pCapId);
                    }
                    if ((pCapId && masterPermitIssued) || !pCapId) {
                        issueBldPermitAndRunWfEvent(itemCapId);
                    }
                }
            }
        }
    }
}