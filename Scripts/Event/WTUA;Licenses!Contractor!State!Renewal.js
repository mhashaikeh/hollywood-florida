if (wfStatus == "Additional Info Required"){
    var notificationTemplate = "SS_ADDITIONAL_INFO_REQD";
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    var acaUrl = acaSite.replace("/admin/Login.aspx", "");
    var bureauName = lookup("Reporting Information Standards", "Bureau Name");

    contArr = getContactArray();
    for (x in contArr){
        if (!matches(contArr[x]["contactType"], null)) {
            contEmail = contArr[x]["email"];
            if(contEmail){
                var eParams = aa.util.newHashtable(); 
                getDepartmentParams4Notification(eParams, "Licensing Department");

                addParameter(eParams, "$$altID$$", capId.getCustomID());
                addParameter(eParams, "$$recordAlias$$", aa.cap.getCap(parentCapId).getOutput().getCapType().getAlias());
                addParameter(eParams, "$$wfComment$$", wfComment);
                addParameter(eParams, "$$BureauName$$", bureauName);

                sendNotification("Accela@HollywoodFl.org",contEmail,"",notificationTemplate,eParams,null,capId);
                logDebug('Notification Email Sent to: ' + contEmail);
            }
        }
    }
}