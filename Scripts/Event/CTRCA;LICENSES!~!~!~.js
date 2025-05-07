 if (appTypeArray[3] == "Application"){
        // Start Apply Manual Validation Conditions
        var licCat = AInfo['License Category'];

        if (licCat.indexOf("Fire Protection System Contractor") != -1) {
                addStdCondition("Fire Protection", "Manual License Number and Expiration Validation Required");
        }

        if (licCat == "Liquified Petroleum Gas License LP Gas Installer") {
                addStdCondition("Liquified Petroleum", "Manual License Number and Expiration Validation Required");
        }
        // End Apply Manual Validation Conditions

        //Start: Send Notification upon Submission
        var notificationTemplate = "SS_APP_SUBMITTAL";

        var priContact = getContactObj(capId,"Qualifying Individual");
        var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
        var acaUrl = acaSite.replace("/Admin/login.aspx", "")
        buildRecURL = acaUrl + getACAUrl(capId);
        if(priContact){
                var eParams = aa.util.newHashtable();
		getDepartmentParams4Notification(eParams, "Building Division");
                var bureauName = lookup("Reporting Information Standards", "Bureau Name");
                addParameter(eParams, "$$BureauName$$", bureauName);
                addParameter(eParams, "$$altID$$", capId.getCustomID());
                addParameter(eParams, "$$recordAlias$$", cap.getCapType().getAlias());
                addParameter(eParams, "$$ContactName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
                var contactEmail = ""+priContact.capContact.getEmail();
                addParameter(eParams, "$$url4ACA$$", acaUrl);
                addParameter(eParams, "$$acaRecordUrl$$", buildRecURL);
                sendNotification("Accela@HollywoodFl.org",contactEmail,"",notificationTemplate,eParams,null,capId)
        }

        //End: Send Notification upon Submission
}

