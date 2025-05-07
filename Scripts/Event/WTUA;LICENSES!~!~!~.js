//Start: Hide Closed Records in ACA
if (matches(wfStatus, "Registration Complete", "Denied", "Withdrawn", "Closed")) {
	aa.cap.updateAccessByACA(capId, "N");
}
//End: Hide Closed Records in ACA

//MAS #01489237 Enabling Renewal record to ACA
if (appMatch("Licenses/Contractor/*/Renewal") && matches(wfStatus, "Additional Info Required")) {

	//1. Set B1PERMIT.B1_ACCESS_BY_ACA to "Y" for renewal CAP
	aa.cap.updateAccessByACA(capId, "Y");


}
logDebug("WTUA;LICENSES!~!~!~.js: Start of WTUA for Licenses/Contractor/*/License");
//Start Renewal of record automation
if ((appMatch("Licenses/Contractor/County/License") || appMatch("Licenses/Contractor/State/License"))  && matches(wfStatus, "Active")) {
	try {
		licenseRenewalIssuance();
	} catch (err) {
		logDebug("**ERROR: Exception occurred in licenseRenewalIssuance: " + err.message);
		var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
		aa.sendMail("no-reply@accela.com", emailAddress, "", "WTUA;Licenses!~!~!~", err + debug + err.stack);
	}
}
function licenseRenewalIssuance() {
	logDebug("Starting License Renewal Issuance Process");
	// Rules
	var issuedExpirationStatus = "Active";
	var expirationType = "Function";
	var customExpirationFunction = "getStateExpDate";

	if (capId) {
		// Expiration
		var rB1ExpResult = aa.expiration.getLicensesByCapID(capId).getOutput();
		if (issuedExpirationStatus != null && issuedExpirationStatus != "") {
			rB1ExpResult.setExpStatus(issuedExpirationStatus);
		}
		if (expirationType != null && expirationType != "") {

			if (expirationType == "Function" && customExpirationFunction != null && customExpirationFunction != "") {
				var dateCalculationFuntion = customExpirationFunction + "( rB1ExpResult )";
				var dateResult = eval("(" + dateCalculationFuntion + ")");
				if (dateResult instanceof Date) {
					rB1ExpResult.setExpDate(aa.date.parseDate(dateAdd(dateResult, 0)));
				} else {
					logDebug("WARNING: Custom Function return values are not accepted as date");
				}

			}
		}
		aa.expiration.editB1Expiration(rB1ExpResult.getB1Expiration());
		// ------------------------------------------------------------------



		var licNum = (appTypeArray[2] == "State") ? "State License Number" : "County License Number";
		var licExp = (appTypeArray[2] == "State") ? "State License Expiration Date" : "County License Expiration Date";
		var newLic = getRefLicenseProf(AInfo[licNum]);
		var updating = false; // Initialize updating to false
		
		if (newLic) {
			logDebug("Checking fields for updates for Ref Lic Prof: " + capId);
			

			// Get values from AInfo
			var insuranceProvider = AInfo["Insurance Provider"];
			var insurancePolicyNumber = AInfo["Insurance Policy Number"];
			var insuranceExpDate = AInfo["Insurance Expiration Date"] ? aa.date.parseDate(AInfo["Insurance Expiration Date"]) : null;
			var businessLicenseNumber = AInfo[licNum];
			var businessLicExpDate = AInfo[licExp] ? aa.date.parseDate(AInfo[licExp]) : null;
			var wcNumber = AInfo["Workers Compensation Number"];
			var wcExpDate = AInfo["Workers Compensation Expiration Date"] ? aa.date.parseDate(AInfo["Workers Compensation Expiration Date"]) : null;
			var wcProvider = AInfo["Workers Compensation Provider"];
			var wcExempt = AInfo["Workers Compensation Exempt"];
			var licenseCategory = AInfo["License Category"];

			// Get values from newLic
			var currentInsProvider = newLic.getInsuranceCo();
			var currentInsPolicy = newLic.getPolicy();
			var currentInsExpDate = newLic.getInsuranceExpDate();
			var currentBusLicense = newLic.getBusinessLicense();
			var currentBusLicExpDate = newLic.getBusinessLicExpDate();
			var currentWcNumber = newLic.getWcPolicyNo();
			var currentWcExpDate = newLic.getWcExpDate();
			var currentWcProvider = newLic.getContLicBusName();
			var currentWcExempt = newLic.getWcExempt();
			var currentLicType = newLic.getLicenseType();

			// Check Insurance Provider
			if (insuranceProvider && currentInsProvider != insuranceProvider) {
				newLic.setInsuranceCo(insuranceProvider);
				updating = true;
				logDebug("Updated Insurance Provider: " + insuranceProvider);
			}

			// Check Insurance Policy Number
			if (insurancePolicyNumber && currentInsPolicy != insurancePolicyNumber) {
				newLic.setPolicy(insurancePolicyNumber);
				updating = true;
				logDebug("Updated Insurance Policy Number: " + insurancePolicyNumber);
			}

			// Check Insurance Expiration Date
			if (insuranceExpDate && (!currentInsExpDate || currentInsExpDate != insuranceExpDate)) {
				newLic.setInsuranceExpDate(insuranceExpDate);
				updating = true;
				logDebug("Updated Insurance Expiration Date: " + insuranceExpDate);
			}

			// Check Business License Number
			if (businessLicenseNumber && currentBusLicense != businessLicenseNumber) {
				newLic.setBusinessLicense(businessLicenseNumber);
				updating = true;
				logDebug("Updated Business License: " + businessLicenseNumber);
			}

			// Check Business License Expiration Date
			if (businessLicExpDate && (!currentBusLicExpDate || currentBusLicExpDate != businessLicExpDate)) {
				newLic.setBusinessLicExpDate(businessLicExpDate);
				updating = true;
				logDebug("Updated Business License Expiration Date: " + businessLicExpDate);
			}

			// Check Workers Compensation Number
			if (wcNumber && currentWcNumber != wcNumber) {
				newLic.setWcPolicyNo(wcNumber);
				updating = true;
				logDebug("Updated Workers Compensation Number: " + wcNumber);
			}

			// Check Workers Compensation Expiration Date
			if (wcExpDate && (!currentWcExpDate || currentWcExpDate != wcExpDate)) {
				newLic.setWcExpDate(wcExpDate);
				updating = true;
				logDebug("Updated Workers Compensation Expiration Date: " + wcExpDate);
			}

			// Check Workers Compensation Provider
			if (wcProvider && currentWcProvider != wcProvider) {
				newLic.setContLicBusName(wcProvider);
				updating = true;
				logDebug("Updated Workers Compensation Provider: " + wcProvider);
			}

			// Check Workers Compensation Exempt Status
			if (wcExempt == "Yes" && currentWcExempt != "Y") {
				newLic.setWcExempt("Y");
				updating = true;
				logDebug("Updated Workers Compensation Exempt: Yes");
			} else if (wcExempt != "Yes" && currentWcExempt != "N") {
				newLic.setWcExempt("N");
				updating = true;
				logDebug("Updated Workers Compensation Exempt: No");
			}

			// Check License Type
			if (licenseCategory && licenseCategory != currentLicType) {
				newLic.setLicenseType(licenseCategory);
				updating = true;
				logDebug("Updated License Type: " + licenseCategory);
			}

			// Check and remove license condition if exists
			if (licHasCondition("Status", "Applied", "Contractor - must update credentials", businessLicenseNumber)) {
				removeLicConditionStatus("Status", "Contractor - must update credentials", "Applied", businessLicenseNumber);
				updating = true;
				logDebug("Removed License Condition: Contractor - must update credentials");
			}
		}
		else {
			logDebug("No License Profile found for " + capId);
		}

		if (updating) {
			var myResult;
			if (newLic) {
				myResult = aa.licenseScript.editRefLicenseProf(newLic);
			}

			if (myResult && myResult.getSuccess()) {
				logDebug("Successfully updated License No. " + capId);
			} else {
				logDebug("**ERROR: can't update lic prof: " + (myResult ? myResult.getErrorMessage() : "No result returned"));
			}

			//Start: Send Renewal Complete Notification
			var notificationTemplate = "SS_LICENSE_RENEWAL_COMP";
			var priContact = getContactObj(capId, "Qualifying Individual");
			var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
			var acaUrl = acaSite.replace("/admin/Login.aspx", "")

			if (priContact) {
				var eParams = aa.util.newHashtable();
				getDepartmentParams4Notification(eParams, "Licensing Department");
				addParameter(eParams, "$$altID$$", capId.getCustomID());
				addParameter(eParams, "$$recordAlias$$", aa.cap.getCap(capId).getOutput().getCapType().getAlias());
				addParameter(eParams, "$$ContactName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
				var contactEmail = "" + priContact.capContact.getEmail();
				addParameter(eParams, "$$acaRecordUrl$$", acaUrl);
				sendNotification("Accela@HollywoodFl.org", contactEmail, "", notificationTemplate, eParams, null, capId)
			}
			//End: Send Renewal Complete Notification

			//todo but first the function def must be moved to includes_custom
			//issueLpAssociatedRecords(businessLicenseNumber);
		}
		// ------------------------------------------------------------------
	}
}
