/*------------------------------------------------------------------------------------------------------/
| Program        : POST_BUILDING_LP_VALIDATION.js
| Event          : STDBASE - Post Script
| Usage          : Validate License Registration is Active
| Created by     : JSHEAR 5/12/2024
/------------------------------------------------------------------------------------------------------*/

if (wfStatus == "Ready to Issue" && AInfo["Owner as Builder"] != "Yes") {
    // MAS SF#01486146
    var regActive = isLicenseProfActive();
    if (!regActive) {
        /* MAS SF#01486146 - Stopped
        closeTask("Plans Coordination", "Inactive", "Contractor in Inactive Status", "");
        updateAppStatus("Inactive","");
        */

        //Start: Send Renewal Complete Notification
        // MAS SF#01486146
        var lpInfoModel = getPrimaryFirstLP();
        if (!lpInfoModel) { // no LP attached to the record
            // send notification to staff
            var notificationTemplate = "APP_MISSING_LP";
            var emailToList = lookup("INTERNAL_EMAIL_LIST", "APP_MISSING_LP");
            var emailParameters = aa.util.newHashtable();
            emailParameters.put("$$altID$$", capId.getCustomID());
            sendNotification("Accela@HollywoodFl.org", emailToList, "", notificationTemplate, emailParameters, null, capId);
        } else {
            var licNum = String(lpInfoModel.getLicenseNbr());
            var licType = lpInfoModel.getLicenseType();
            var lpEmail = lpInfoModel.getEmail();
            var lpFirstName = lpInfoModel.getContactFirstName();
            var lpLastName = lpInfoModel.getContactLastName();
            var bizName = lpInfoModel.getBusinessName();

            var notificationTemplate = "SS_LP_STANDING";
            var contactTypesArray = new Array("Applicant", "Property Owner");
            var contactObjArray = getContactObjs(capId, contactTypesArray);
            var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
            var acaUrl = acaSite.replace("/Admin/login.aspx", "");
            buildRecURL = acaUrl + getACAUrl(capId);
            var bureauName = lookup("Reporting Information Standards", "Bureau Name");

            // Loop through each contact in the contactObjArray
            for (var iCon in contactObjArray) {
                var tContactObj = contactObjArray[iCon];
                var contactEmail = tContactObj.people.getEmail();

                // Create parameters for the notification
                var eParams = aa.util.newHashtable();
                getDepartmentParams4Notification(eParams, "Building Division");
                addParameter(eParams, "$$BureauName$$", bureauName);
                addParameter(eParams, "$$firstName$$", lpFirstName);
                addParameter(eParams, "$$lastName$$", lpLastName);
                addParameter(eParams, "$$businessName$$", bizName);
                addParameter(eParams, "$$LicenseNumber$$", licNum);
                addParameter(eParams, "$$LicenseType$$", licType);
                //addParameter(eParams, "$$ContactName$$", tContactObj.people.getFirstName() + " " + tContactObj.people.getLastName());
                addParameter(eParams, "$$altID$$", capId.getCustomID());
                addParameter(eParams, "$$recordAlias$$", aa.cap.getCap(capId).getOutput().getCapType().getAlias());
                addParameter(eParams, "$$acaRecordUrl$$", buildRecURL);

                // Send notification to the contact
                sendNotification("Accela@HollywoodFl.org", contactEmail, "", notificationTemplate, eParams, null, capId);
            }
            // Send notification to the LP
            sendNotification("Accela@HollywoodFl.org", lpEmail, "", notificationTemplate, eParams, null, capId);
        }
    }
}
