try {

    var licType = AInfo["License Category"];

    var parentCapId = getParent();
    if (!parentCapId) {
        logDebug("**ERROR: Parent CAP ID not found.");
    }

    var parentAltId = parentCapId.getCustomID();

    var licfld = appTypeArray[2] == "State" ? "State License Number" : "County License Number";
    //var licfld = appTypeArray[2] == "State" ? "State License Number" : "State Registration Number";
    var licExp = appTypeArray[2] == "State" ? "State License Expiration Date" : "County License Expiration Date";
    var compExempt = AInfo["Workers Compensation Exempt"] == "Yes" ? "Y" : "N";

    var licNum = getAppSpecific(licfld, capId);
    var rlp = new licenseProfObject(licNum, licType, parentCapId);
    var businessName = getContactsCompanyName("Qualifying Individual");


    if (rlp.refLicModel) {
        var vNewLic = getRefLicenseProf(licNum);
    } else {
        var vNewLic = aa.licenseScript.createLicenseScriptModel();
    }
    vNewLic.setAuditStatus("A");
    vNewLic.setAgencyCode(aa.getServiceProviderCode());
    vNewLic.setAuditDate(sysDate);
    vNewLic.setAuditID(currentUserID);
    vNewLic.setLicenseType(AInfo["License Category"]);
    vNewLic.setLicState("FL");
    vNewLic.setStateLicense(licNum);
    vNewLic.setLicenseExpirationDate(aa.date.parseDate(AInfo[licExp]));
    vNewLic.setBusinessLicense(licNum);
    vNewLic.setBusinessName(businessName);
    //vNewLic.setBusinessLicExpDate(aa.date.parseDate(AInfo[licExp]));
    vNewLic.setInsuranceCo(AInfo["Insurance Provider"]);
    vNewLic.setPolicy(AInfo["Insurance Policy Number"]);
    vNewLic.setInsuranceExpDate(aa.date.parseDate(AInfo["Insurance Expiration Date"]));
    vNewLic.setWcPolicyNo(AInfo["Workers Compensation Number"]);
    vNewLic.setWcExpDate(aa.date.parseDate(AInfo["Workers Compensation Expiration Date"]));
    vNewLic.setContLicBusName(AInfo["Workers Compensation Provider"]);
    vNewLic.setWcExempt(compExempt);

    var aplcnt = getContactObj(capId, "Qualifying Individual");
    if (aplcnt) {
        vNewLic.setContactLastName(aplcnt.capContact.lastName);
        vNewLic.setContactFirstName(aplcnt.capContact.firstName);
        vNewLic.setEMailAddress(aplcnt.capContact.email);
        vNewLic.setPhone1(aplcnt.capContact.phone1);
        vNewLic.setPhone2(aplcnt.capContact.phone2);
        //vNewLic.setEMailAddress(aplcnt.people.getEmail());

        qualAddress = aplcnt.addresses;
        for (x in qualAddress) {
            thisAddr = qualAddress[x];
            if (thisAddr.getAddressType() == "Business") {
                vNewLic.setAddress1(thisAddr.addressLine1);
                vNewLic.setCity(thisAddr.city)
                vNewLic.setZip(thisAddr.zip);
            }
        }
    }
    

    if (rlp.refLicModel) {
        var myResult = aa.licenseScript.editRefLicenseProf(vNewLic);
        if (myResult && myResult.getSuccess()) {
            logDebug("Successfully updated License");
        } else {
            logDebug("**ERROR: can't update lic prof: " + (myResult ? myResult.getErrorMessage() : "No result returned"));
        }
    } else {
        aa.licenseScript.createRefLicenseProf(vNewLic);
        var tmpLicObj = licenseProfObject(licNum, licType, parentCapId);
        if (tmpLicObj.valid) {
            logDebug("Valid Done");
            tmpLicObj.copyToRecord(parentCapId, true);
        } else {
            logDebug("Invalid Done");
        }

    }

    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    var acaUrl = acaSite.replace("/Admin/login.aspx", "");
    buildRecURL = acaUrl + getACAUrl(parentCapId);
    if (aplcnt) {
        var contactEmail = "" + aplcnt.capContact.getEmail();
        var params = aa.util.newHashtable();
        getDepartmentParams4Notification(params, "Building Division");
        var bureauName = lookup("Reporting Information Standards", "Bureau Name");
        addParameter(params, "$$BureauName$$", bureauName);
        cap = aa.cap.getCap(parentCapId).getOutput();
        addParameter(params, "$$altID$$", cap.getCapID().getCustomID());
        addParameter(params, "$$recordAlias$$", cap.getCapType().getAlias());
        addParameter(params, "$$ContactName$$", aplcnt.capContact.firstName + " " + aplcnt.capContact.lastName);
        addParameter(params, "$$acaRecordUrl$$", buildRecURL);
        sendNotification("Accela@HollywoodFl.org", contactEmail, "", "SS_LICENSE_ISSUED_REPORT", params, null, capId);
    }

} catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "POST_LICENSES_TL_LICENSE_ISSUANCE", err + debug + err.stack);
}
