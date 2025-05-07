try {
	//Start: If no Record Balnce and Awaiting Payment, send Issuance email with Building Permit Report
	if (appTypeArray[1] != "Amendment" && appTypeArray[2] != "Sidewalk Cafe") {
		if (balanceDue <= 0 && matches(capStatus, "Ready to Issue", "Awaiting Payment")) {
			// MAS SF#01486146 - add LP validation and Master Permit issued
			var regActive = isLicenseProfActive();
			if (regActive) {
				//Verify that Master Permit is Issued before Issuing Sub-Permit
				var masterPermitIssued = false;
				var pCapId = getParent();
				if (pCapId) {
					masterPermitIssued = isTaskActiveByCapID("Inspection", pCapId);
				}
				if ((pCapId && masterPermitIssued) || !pCapId) {
					issueBldPermitAndRunWfEvent(capId);
				}
			}
		}
	}
	//End: If no Record Balnce and Awaiting Payment, send Issuance email with Building Permit Report
} catch (err) {
	var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
	aa.sendMail("no-reply@accela.com", emailAddress, "", "PPA:*/*/*/*", err + debug + err.stack);
}