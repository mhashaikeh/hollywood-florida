if (conditionType == "Sub-Permits") {
	var priContact = getContactObj(capId,"Applicant");
	if(priContact){
		eParams = aa.util.newHashtable();
		addParameter(eParams, "$$altId$$", capId.getCustomID());
		addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
		addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
		addParameter(eParams, "$$conditionName$$", conditionType);
		addParameter(eParams, "$$conditionShortComments$$", conditionComment);
		var rFiles = [];
		var priEmail = ""+priContact.capContact.getEmail();
		sendNotification("Accela@HollywoodFl.org",priEmail,"","SS_SUB_PERMIT_REQUIRED",eParams, rFiles,capId)
	}
}
