/*------------------------------------------------------------------------------------------------------/
| Program        : POST_LIC_AMEND_LP_UPDATES.js
| Event          : STDBASE - Post Script
| Usage          : Update Renewal Expiration Date
| Created by     : JSHEAR 5/12/2024
/------------------------------------------------------------------------------------------------------*/

try {

   var updating = false;
    var parentCapId = getParent();
    if (!parentCapId) {
        logDebug("**ERROR: Parent CAP ID not found.");
    }

    pCap = aa.cap.getCap(parentCapId).getOutput();
    pAppTypeResult = pCap.getCapType();
    pAppTypeString = pAppTypeResult.toString();
    pAppTypeArray = pAppTypeString.split("/");
    
    var parentAltId = parentCapId.getCustomID();
    var licNum = (pAppTypeArray[2] == "State") ? "State License Number" : "County License Number";
    var licExp = (pAppTypeArray[2] == "State") ? "State License Expiration Date" : "County License Expiration Date";
    var transLic = getLpFromCap(parentCapId);
    var newLic = getRefLicenseProf(getAppSpecific(licNum,parentCapId));

    logDebug("licNum: " + licNum);
    logDebug("licExp: " + licExp);
    logDebug("newLic: " + newLic);
    // logDebug("transLic: " + transLic);

    if (newLic) {
        updating = true;
        logDebug("Updating existing Ref Lic Prof: " + parentAltId);


        if (AInfo["Update General Liability Insurance Information"] == "CHECKED") {
            newLic.setInsuranceCo(AInfo["Insurance Provider"]);
            logDebug("Set Insurance Provider: " + AInfo["Insurance Provider"]);

            newLic.setPolicy(AInfo["Insurance Policy Number"]);
            logDebug("Set Insurance Policy Number: " + AInfo["Insurance Policy Number"]);

            var insuranceExpDate = aa.date.parseDate(AInfo["Insurance Expiration Date"]);
            newLic.setInsuranceExpDate(insuranceExpDate);
            logDebug("Set Insurance Expiration Date: " + AInfo["Insurance Expiration Date"]);
        }

        if (AInfo["Update Workers Compensation Information"] == "CHECKED") {

            newLic.setWcPolicyNo(AInfo["Workers Compensation Number"]);
            logDebug("Set Workers Compensation Number: " + AInfo["Workers Compensation Number"]);

            var wcExpDate = aa.date.parseDate(AInfo["Workers Compensation Expiration Date"]);
            newLic.setWcExpDate(wcExpDate);
            logDebug("Set Workers Compensation Expiration Date: " + AInfo["Workers Compensation Expiration Date"]);

            newLic.setContLicBusName(AInfo["Workers Compensation Provider"]);
            logDebug("Set Workers Compensation Provider: " + AInfo["Workers Compensation Provider"]);

                if (AInfo["Workers Compensation Exempt"] == "Yes") {
                    newLic.setWcExempt("Y");
                    logDebug("Set Workers Compensation Exempt: Yes");
                } else {
                    newLic.setWcExempt("N");
                    logDebug("Set Workers Compensation Exempt: No");
                }
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

} catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "POST_LIC_AMEND_LP_UPDATES", err + debug + err.stack);
}
