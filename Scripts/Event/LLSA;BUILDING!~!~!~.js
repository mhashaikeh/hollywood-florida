/* Moved to LLSA;~!~!~!~
//Start: Notify LP upon Submission
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
    addParameter(emailParameters, "$$altID$$", capId.getCustomID());
    addParameter(emailParameters, "$$recordAlias$$", cap.getCapType().getAlias());
    addParameter(emailParameters, "$$ContactName$$",""+firstName + " " + lastName);
    addParameter(emailParameters, "$$licNbr$$",""+licNbr);
    addParameter(emailParameters, "$$mmddyy$$", sysDateMMDDYYYY);
    sendNotification("Accela@HollywoodFL.org",eMail,"","SS_LP_APPLIED_NOTIFICATION",emailParameters,null,capId);
}
//End: Notify LP upon Submission
*/