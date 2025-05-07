
/*------------------------------------------------------------------------------------------------------/
| Program       : PRE_APP_PAYMENT_DUE.js
| Event         : STDBASE - Pre Script
| Usage         : prepare initial APP_PAYMENT_DUE email template parameters and 
|                 cancel if no balance due or it is an Amendment record
| Created by    : IISMAIL 03/04/2025
/------------------------------------------------------------------------------------------------------*/
if (appTypeArray[1] == "Amendment") {
    cancelCfgExecution = true;
} else {
    var capDetails = aa.cap.getCapDetail(capId).getOutput();
    if (capDetails.getBalance() > 0) {
        var params = aa.util.newHashtable();
        getContactParams4Notification(params, "Applicant");
        getRecordParams4Notification(params);
        var agencyAddress = lookup("RPT_CONFIG", "Agency Address Single Line");
        addParameter(params, "$$BureauAddress$$", agencyAddress);
        var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
        var acaUrl = acaSite.replace("/Admin/login.aspx", "");
        addParameter(params, "$$url4ACA$$", acaUrl);
        aa.env.setValue("CustomEmailParams", params);
    } else {
        cancelCfgExecution = true;
    }
}
