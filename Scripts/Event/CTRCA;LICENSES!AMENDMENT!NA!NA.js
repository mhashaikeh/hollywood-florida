//Start AltId Modification
try{
        
    if (parentCapId != null) {
        parentAltId = parentCapId.getCustomID();
        cIds = getChildren("Licenses/Amendment/NA/NA", parentCapId);

        var amendNbr = "001"; // Default to "001" if no children are found
        
        if (!matches(cIds, null, "", undefined)) {
            cIds = cIds.filter(function(childCap) {
                var childCapIdStr = String(childCap); // Convert the object to string
                return childCapIdStr.indexOf("EST") == -1;
            });
            cIdLen = cIds.length;
            amendNbr = padWithZeroes(cIdLen, 3); // Ensure three digits
        }
        
        var newAltId = parentAltId + "-A" + amendNbr;
        var resAltId = aa.cap.updateCapAltID(capId, newAltId);
        
        if (resAltId.getSuccess() == true) {
            logDebug("Alt ID set to " + newAltId);
        } else {
            logDebug("Error updating Alt ID: " + resAltId.getErrorMessage());
        }
    }

    //Send Contact Submittal Emails
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    var acaUrl = acaSite.replace("/Admin/login.aspx", "");
    buildRecURL = acaUrl + getACAUrl(capId);
    buildPayURL = buildRecURL.replace("1000", "1009");
    var bureauName = lookup("Reporting Information Standards", "Bureau Name");
    var deptName;
    rFiles = [];

    contArr = getContactArray();
    for (x in contArr){
        if (!matches(contArr[x]["contactType"], null)) {
            contEmail = contArr[x]["email"];
            if(contEmail){
                var emailParameters = aa.util.newHashtable();
                getDepartmentParams4Notification(emailParameters, "Licensing Department");
                addParameter(emailParameters, "$$BureauName$$", bureauName);
                addParameter(emailParameters, "$$acaRecordUrl$$", buildRecURL);
                addParameter(emailParameters, "$$url4ACA$$", acaUrl);
                addParameter(emailParameters, "$$altID$$", newAltId);
                addParameter(emailParameters, "$$recordAlias$$", cap.getCapType().getAlias());
                addParameter(emailParameters, "$$AgencyName$$", "Hollywood");
                addParameter(emailParameters, "$$ContactName$$", contArr[x]["firstName"] + " " + contArr[x]["lastName"]);
                sendNotification("Accela@HollywoodFL.org", contEmail, "", "SS_APP_SUBMITTAL", emailParameters, rFiles);
                logDebug("Email Successfully sent to " + contEmail);

            }else{
                logDebug("No email address found for " + contArr[x]["firstName"] +" " + contArr[x]["lastName"] +" ' email not sent");
            }
        }
    }


} catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "CTRCA:Licenses/Amendment/NA/NA", err + debug + err.stack);
}
//End AltId Modification