
try {
    // Send email to applicant requesting required documents and apply conditions
    if (wfTask == "Permit Issuance" && wfStatus == "Issued") {
        var requiredDocs = [];

        // Get ASI fields
        var deckMaterial = getAppSpecific("Deck Material");
        var patioMaterial = getAppSpecific("Patio Material");
        var deckNearDwelling = getAppSpecific("Deck Located within 1 Foot of Dwelling");
        var patioNearDwelling = getAppSpecific("Patio Located within 1 Foot of Dwelling");

        // Rule 1: Concrete Compaction (Conditionally Required)
        // Required if Concrete Slab is indicated for Deck or Patio
        if (deckMaterial == "Concrete" || patioMaterial == "Concrete") {
            requiredDocs.push("Concrete Compaction");
			if (!appHasCondition("Permit", "Applied", "Concrete Compaction Required", null)) {
				addStdCondition("Permit", "Concrete Compaction Required");
			}
        }

        // Rule 2: Proof of Subterranean Termite Treatment (Conditionally Required)
        // Required if Deck or Patio is within 1 foot of dwelling
        if (deckNearDwelling == "Yes" || patioNearDwelling == "Yes") {
            requiredDocs.push("Proof of Subterranean Termite Treatment");
			if (!appHasCondition("Permit", "Applied", "Proof of Subterranean Termite Treatment Required", null)) {
				addStdCondition("Permit", "Proof of Subterranean Termite Treatment Required");
			}

        }

        // If there are required docs, send an email
		if (requiredDocs.length > 0) {
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
						addParameter(eParams, "$$wfComment$$", requiredDocs.join(", "));
						addParameter(eParams, "$$BureauName$$", bureauName);

						sendNotification("Accela@HollywoodFl.org",contEmail,"",notificationTemplate,eParams,null,capId);
						logDebug('Notification Email Sent to: ' + contEmail);
					}
				}
			}
		}
    }
} catch (err) {
  var emailAddress = "jshear@accela.com"; //email to send report
  aa.sendMail("no-reply@accela.com", emailAddress, "", "WTUA:Building/Commercial/Accessory/NA", err + debug + err.stack);
}
