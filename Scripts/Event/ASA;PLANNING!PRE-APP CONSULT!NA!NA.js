try {

    if (!publicUser){
        //Send Contact Submittal Emails
        var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
        var acaUrl = acaSite.replace("/Admin/login.aspx", "");
        buildRecURL = acaUrl + getACAUrl(capId);
        buildPayURL = buildRecURL.replace("1000", "1009");
        var bureauName = lookup("Reporting Information Standards", "Bureau Name");
        var deptName;
        rFiles = [];
        deptName = "Planning Division";

        contArr = getContactArray();
        for (x in contArr){
            if (!matches(contArr[x]["contactType"], null)) {
                contEmail = contArr[x]["email"];
                if(contEmail){
                    var emailParameters = aa.util.newHashtable();
                    getDepartmentParams4Notification(emailParameters, deptName);
                    addParameter(emailParameters, "$$BureauName$$", bureauName);
                    addParameter(emailParameters, "$$acaRecordUrl$$", buildRecURL);
                    addParameter(emailParameters, "$$url4ACA$$", acaUrl);
                    addParameter(emailParameters, "$$altID$$", capId.getCustomID());
                    addParameter(emailParameters, "$$recordAlias$$", cap.getCapType().getAlias());
                    addParameter(emailParameters, "$$AgencyName$$", "Hollywood");
                    addParameter(emailParameters, "$$ContactName$$", contArr[x]["firstName"] + " " + contArr[x]["lastName"]);
                    sendNotification("Accela@HollywoodFL.org", contEmail, "", "SS_APP_SUBMITTAL_PAC", emailParameters, rFiles);
                    logDebug("Email Successfully sent to " + contEmail);

                }else{
                    logDebug("No email address found for " + contArr[x]["firstName"] +" " + contArr[x]["lastName"] +" ' email not sent");
                }
            }
        }

        // Define proposal types with full names, abbreviations, and their corresponding fields
        var proposalTypes = {
            "Residential": {
                abbr: "Res",
                numberField: "Number of Residential Units" 
            },
            "Commercial": {
                abbr: "Comm",
                numberField: "Number of Commercial Parking Spaces"
            },
            "Office": {
                abbr: "Off",
                numberField: "Number of Office Parking Spaces"
            },
            "Industrial": {
                abbr: "Ind",
                numberField: "Number of Industrial Parking Spaces"
            },
            "Hotel": {
                abbr: "Hotel",
                numberField: "Number of Hotel Rooms"
            },
            "Institutional Facility": {
                abbr: "Inst",
                numberField: "Number of Institutional Facility Parking Spaces"
            },
            "Places of Worship or Assembly": {
                abbr: "Worship",
                numberField: "Number of Worship or Assembly Parking Spaces"
            },
            "Automobile Related Uses": {
                abbr: "Auto",
                numberField: "Number of Automobile Related Uses Parking Spaces"
            }
        };
        // Build the new application name based on checked proposal types
        var newAppNameParts = [];
        
        for (var type in proposalTypes) {
            var abbr = proposalTypes[type].abbr;
            var numberField = proposalTypes[type].numberField;
            
            // Check if the proposal type checkbox is checked
            if (AInfo[type] && AInfo[type].toUpperCase() == "CHECKED") {
                // For Commercial and Office, only use the displayName; for others, include the number
                var displayName = (type == "Commercial" || type == "Office") ? abbr : type;
                if (type == "Commercial" || type == "Office") {
                    newAppNameParts.push(displayName);
                } else {
                    var numValue = AInfo[numberField] ? parseInt(AInfo[numberField], 10) : 0;
                    if (isNaN(numValue)) numValue = 0;
                    newAppNameParts.push(displayName + " " + numValue);
                }
            }
        }
        
        // Construct the new application name
        var newAppName = newAppNameParts.length > 0 ? newAppNameParts.join(" | ") : "No Proposal Types Selected";
        
        // Update the application name using editAppName
        editAppName(newAppName);
        
        logDebug("Successfully updated application name to: " + newAppName);
    }


} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ASA:Planning/Pre-App Consult/NA/NA", err + debug + err.stack);
}