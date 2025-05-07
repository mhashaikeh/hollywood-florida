try{
	// Send email to applicant requesting required documents and apply conditions
    if (wfTask == "Permit Issuance" && wfStatus == "Issued") {

	    if (!appHasCondition("Permit", "Applied", "Special Inspector Final Letter Required", null)) {
	        addStdCondition("Permit", "Special Inspector Final Letter Required");
	    }

	    // Send an email notifying contacts of needed document
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
					getDepartmentParams4Notification(eParams, "Building Division");

					addParameter(eParams, "$$altID$$", capId.getCustomID());
					addParameter(eParams, "$$recordAlias$$", aa.cap.getCap(capId).getOutput().getCapType().getAlias());
					addParameter(eParams, "$$wfComment$$", "Special Inspector Final Letter");
					addParameter(eParams, "$$BureauName$$", bureauName);

					sendNotification("Accela@HollywoodFl.org",contEmail,"",notificationTemplate,eParams,null,capId);
					logDebug('Notification Email Sent to: ' + contEmail);
				}
			}
		}
	}

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "WTUA:Building/Antenna/NA/NA", err + debug + err.stack);
}