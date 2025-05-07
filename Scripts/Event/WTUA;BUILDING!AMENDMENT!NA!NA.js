// showMessage = true;
// showDebug = true;
try{	

  if (wfStatus == "Modification Request Approved") {

	//SF:01476751
	if (AInfo["Type of Amendment"] == "Permit Renewal"){
		var pCapId = getParent();
		updateTaskLocal("Plans Coordination", "Ready to Issue", "Updated By EMSE script", "", "", pCapId);
		activateTaskLocal("Permit Issuance", pCapId);
		updateTaskLocal("Permit Issuance", "In Progress", "Updated By EMSE script", "", "", pCapId);
		updateAppStatus("Ready to Issue", "", pCapId);
	}
	//SF:01476751-END

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
  aa.sendMail("no-reply@accela.com", emailAddress, "", "WTUA;BUILDING!AMENDMENT!NA!NA", err + debug + err.stack);
}


function updateTaskLocal(wfstr, wfstat, wfcomment, wfnote) // optional process name, cap id
{
	var useProcess = false;
	var processName = "";
	if (arguments.length > 4) {
		if (arguments[4] != "") {
			processName = arguments[4]; // subprocess
			if(processName == null || processName == undefined || processName == 'NA' || processName == ""){
				useProcess = false;
			}else{
				useProcess = true;
			}
		}
	}
	var itemCap = capId;
	if (arguments.length == 6)
		itemCap = arguments[5]; // use cap ID specified in args

	var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		aa.print("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	if (!wfstat)
		wfstat = "NA";

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var dispositionDate = aa.date.getCurrentDate();
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();
			if (useProcess)
				aa.workflow.handleDisposition(itemCap, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
			else
				aa.workflow.handleDisposition(itemCap, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
			aa.print("Updating Workflow Task " + wfstr + " with status " + wfstat);
		}
	}
}

function activateTaskLocal(wfstr, capId) // optional process name
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 3) {
		processName = arguments[2]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		aa.print("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase() .equals(wfstr.toUpperCase())
				&& (!useProcess || fTask.getProcessCode().equals(processName))) {
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();

			if (useProcess) {
				aa.workflow.adjustTask(capId, stepnumber, processID, "Y", "N", null, null)
			} else {
				aa.workflow.adjustTask(capId, stepnumber, "Y", "N", null, null)
			}
			aa.print("Activating Workflow Task: " + wfstr);
		}
	}
}