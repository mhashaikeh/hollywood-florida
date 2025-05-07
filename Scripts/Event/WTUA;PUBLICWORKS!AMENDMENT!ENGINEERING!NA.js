try{	

  if (wfStatus == "Modification Request Approved") {

      if (AInfo["Type of Amendment"] == "Change Architect or Engineer"){
      	var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
      	var acaUrl = acaSite.replace("/admin/Login.aspx", "");

	      // Notify LP upon Submission
	      var licenseProfResult = aa.licenseProfessional.getLicensedProfessionalsByCapID(capId);
	      if (licenseProfResult.getSuccess()) {
	          var licenseProfList = licenseProfResult.getOutput();
	          if (licenseProfList) {
	              for (var i = 0; i < licenseProfList.length; i++) {
	                  var licenseProf = licenseProfList[i];
	                  if (licenseProf.getLicenseNbr() != null) {
	                      var emailParameters = aa.util.newHashtable();
	                      addParameter(emailParameters, "$$altID$$", capId.getCustomID());
	                      addParameter(emailParameters, "$$recordAlias$$", cap.getCapType().getAlias());
	                      addParameter(emailParameters, "$$ContactName$$", licenseProf.getContactFirstName() + " " + licenseProf.getContactLastName());
	                      addParameter(emailParameters, "$$url4ACA$$", acaUrl);
	                      addParameter(emailParameters, "$$wfComment$$",wfComment);

	                      sendNotification("Accela@HollywoodFl.org", licenseProf.getEmail(), "", "SS_REQUEST_APPROVED", emailParameters, null, capId);
	                  }
	              }
	          }
	      }

	      // Send Notification for sub-permits upon Submission
	      pCapId = getParent();
	      var priContact = getContactObj(pCapId, "Property Owner");
	      if (priContact) {
			var eParams = aa.util.newHashtable();
			addParameter(eParams, "$$altID$$", capId.getCustomID());
			addParameter(eParams, "$$recordAlias$$", cap.getCapType().getAlias());
			addParameter(eParams, "$$ContactName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
			addParameter(eParams, "$$url4ACA$$", acaUrl);
			addParameter(eParams, "$$wfComment$$", wfComment);
			addParameter(eParams, "$$amendType$$", AInfo["Type of Amendment"]);

			sendNotification("Accela@HollywoodFl.org", priContact.capContact.getEmail(), "", "SS_REQUEST_APPROVED", eParams, null, capId);
	      }

	    }
  }

  //Start: Apply Amendment Fees
	if (wfStatus == "Awaiting Payment"){
		if (matches(AInfo["Type of Amendment"],"Change Primary Contractor","Change Sub-Contractor")){
			if (!feeExists("BLD10")){
				updateFee("BLD10", "BUILDING", "FINAL", 1, "N");
			}
		}
		var newFeeFound = false;
		var targetFees = loadFees(capId);
		for (tFeeNum in targetFees) {
			targetFee = targetFees[tFeeNum];
			if (targetFee.status == "NEW") {
				newFeeFound = true;
			}
		}
		if(newFeeFound){
			invoiceAllFees();
		}
	}
  //End: Apply Amendment Fees

	if (wfStatus + "" === "Notice - Engineer Architect Change") {
		// Fire the Digital Plan Room actions for change of architect or engineer
		// On the parent record:
		// 	Deactivate any review tasks
		// 	Activate Plans Distrubtion and set to Awaiting Plans
		// 	Open up a new review package in the Digital Plan Room
		// 	Send notification to contacts/professionals to uplaod new plans and documents
		//
		// Open questions:
		// 	What if the permit is already issued, what should happen in that scenario and how do we check for it?
		var pCapId = getParent();
		if (pCapId) {
			fireDprWorkflowActions(pCapId, "Change Architect or Engineer", "Process");
		}
	}
} catch (err) {
  var emailAddress = "jshear@accela.com"; //email to send report
  aa.sendMail("no-reply@accela.com", emailAddress, "", "WTUA;PUBLICWORKS!AMENDMENT!ENGINEERING!NA", err + debug + err.stack);
}
