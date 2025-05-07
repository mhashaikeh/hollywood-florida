/*------------------------------------------------------------------------------------------------------/
| Program       : PRE_PREPARE_CONTACT_PARAMS_SEND_PAYMENT_DUE.js
| Event         : STDBASE - Pre Script
| Usage         : prepare initial email template parameters
| Created by    : JSHEAR 5/2/2024
/------------------------------------------------------------------------------------------------------*/


var capDetails = aa.cap.getCapDetail(capId).getOutput();
if (capDetails.getBalance() > 0) {
    var params = aa.util.newHashtable();
    getContactParams4Notification(params, "Applicant");
    getRecordParams4Notification(params);
    var agencyAddress= lookup("RPT_CONFIG","Agency Address Single Line");
    addParameter(params, "$$BureauAddress$$", agencyAddress);
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    var acaUrl = acaSite.replace("/Admin/login.aspx", "");
    addParameter(params, "$$url4ACA$$", acaUrl);
    aa.env.setValue("CustomEmailParams", params);
}else{
    cancelCfgExecution = true;
}