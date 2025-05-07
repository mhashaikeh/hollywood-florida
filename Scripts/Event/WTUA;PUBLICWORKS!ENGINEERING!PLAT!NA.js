
if (wfStatus == "Notification Sent") {
    var requestType = getAppSpecific("Request Type");
    var docCategory = "";
    var rFiles = [];
    var priContact = getContactObj(capId, "Applicant");
    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
    var acaUrl = acaSite.replace("/Admin/login.aspx", "");
    var buildRecURL = acaUrl + getACAUrl(capId);
    var recCap = aa.cap.getCap(capId).getOutput();
    
    // Determine document category
    if (requestType == "New Plat" || requestType == "Plat Amendment") {
        docCategory = "Resolution";
    } else if (requestType == "Lot Line/Subdivision" || requestType == "Waiver of Plat") {
        docCategory = "Decision Letter";
    } else if (requestType == "Other") {
        var cityCommission = getTaskSpecific("Engineering Review", "City Commission Meeting");
        docCategory = (cityCommission == "Yes") ? "Resolution" : "Decision Letter";
    }
    
    // Get document list and attach the specified document
    var docList = aa.document.getDocumentListByEntity(capId.toString(), "CAP").getOutput();
    if (docList && docList.size() > 0) {
        for (var i = 0; i < docList.size(); i++) {
            if (docList.get(i).getDocCategory() == docCategory) {
                var docContent = aa.document.downloadFile2Disk(docList.get(i), "PublicWorks", "", "", true);
                if (docContent.getSuccess()) {
                    rFiles.push(docContent.getOutput());
                }
                break; // Stop after finding the first matching document
            }
        }
    }
    
    // Send email if contact exists and document was found
    if (priContact && rFiles.length > 0) {
        var params = aa.util.newHashtable();
        getDepartmentParams4Notification(params, "Engineering Division");
        var bureauName = lookup("Reporting Information Standards", "Bureau Name");
        addParameter(params, "$$BureauName$$", bureauName);
        addParameter(params, "$$AgencyName$$", "Agency");
        addParameter(params, "$$acaRecordUrl$$", buildRecURL);
        addParameter(params, "$$altID$$", capId.getCustomID());
        addParameter(params, "$$recordAlias$$", recCap.getCapType().getAlias());
        addParameter(params, "$$ContactName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
        addParameter(params, "$$url4ACA$$", acaUrl);
        addParameter(params, "$$docCategory$$", docCategory);
        
        var emailAddress = "" + priContact.capContact.getEmail();
        sendNotification("Accela@hollywoodfl.org", emailAddress, "", "SS_PERMIT_STATUS", params, rFiles);
    }
}
