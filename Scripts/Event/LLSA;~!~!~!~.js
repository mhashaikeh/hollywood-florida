//Start: Notify LP upon Submission
if (appTypeArray[0] != "Licenses"){
    for (i in licenseList) {
        var thisLic = licenseList[i];
        var licNbr = thisLic.getStateLicense();
        var firstName = thisLic.getContactFirstName();
        var lastName = thisLic.getContactLastName();
        var eMail = thisLic.getEMailAddress()
        emailParameters = aa.util.newHashtable();
        var deptName = (appTypeArray[0] == "PublicWorks") ? "Engineering Division" : appTypeArray[0] + " Division";
        getDepartmentParams4Notification(emailParameters, deptName);
        var sysDate = aa.date.getCurrentDate();
        var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");
        var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
        var acaUrl = acaSite.replace("/Admin/login.aspx", "");
        buildRecURL = acaUrl + getACAUrl(capId);
        addParameter(emailParameters, "$$url4ACA$$", acaUrl);
        addParameter(emailParameters, "$$acaRecordUrl$$", buildRecURL);
        addParameter(emailParameters, "$$altID$$", capId.getCustomID());
        addParameter(emailParameters, "$$recordAlias$$", cap.getCapType().getAlias());
        addParameter(emailParameters, "$$ContactName$$",""+firstName + " " + lastName);
        addParameter(emailParameters, "$$licNbr$$",""+licNbr);
        addParameter(emailParameters, "$$mmddyy$$", sysDateMMDDYYYY);
        sendNotification("Accela@HollywoodFl.org",eMail,"","SS_LP_APPLIED_NOTIFICATION",emailParameters,null,capId);
    }
}
//End: Notify LP upon Submission

//Start: Apply Condition for County Contractor Verification
if (appTypeArray[0] != "Licenses" && appTypeArray[1] != "Amendment"){
    for (i in licenseList) {
        var thisLic = licenseList[i];
        var licType = thisLic.getLicenseType();
        countyLic = lookup("CTR_COUNTY_CATEGORY", licType);
        if (countyLic != undefined){
            if (!appHasCondition("County", "Applied", "Manual License Number and Expiration Validation Required", null)) {
                addStdCondition("County", "Manual License Number and Expiration Validation Required");
            }
        }
    }
}
//Start: County Contractor Validation Check