
if (wfStatus == "Notification Sent") {
    var requestType = getAppSpecific("Request Type");
    var docAttached = false;
    var docCategory = "";
    var emailAttachment = null;
    
    // Get document list
    var docList = aa.document.getDocumentListByEntity(capId.toString(), "CAP").getOutput();
    
    if (requestType == "New Plat" || requestType == "Plat Amendment") {
        docCategory = "Resolution";
        if (docList) {
            for (var i = 0; i < docList.size(); i++) {
                if (docList.get(i).getDocCategory() == docCategory) {
                    docAttached = true;
                    emailAttachment = docList.get(i);
                }
            }
        }
        if (!docAttached) {
            showMessage = true;
            cancel = true;
            comment("Error: 'Resolution' document is required and has not been uploaded.");
        } 
    }else if (requestType == "Lot Line/Subdivision" || requestType == "Waiver of Plat") {
        docCategory = "Decision Letter";
        if (docList) {
            for (var i = 0; i < docList.size(); i++) {
                if (docList.get(i).getDocCategory() == docCategory) {
                    docAttached = true;
                    emailAttachment = docList.get(i);
                }
            }
        }
        if (!docAttached) {
            showMessage = true;
            cancel = true;
            comment("Error: 'Decision Letter' document is required and has not been uploaded.");
        } 
    }else if (requestType == "Other") {
        var cityCommission = getTaskSpecific("Engineering Review", "City Commission Meeting");
        docCategory = (cityCommission == "Yes") ? "Resolution" : "Decision Letter";
        
        if (docList) {
            for (var i = 0; i < docList.size(); i++) {
                if (docList.get(i).getDocCategory() == docCategory) {
                    docAttached = true;
                    emailAttachment = docList.get(i);
                }
            }
        }
        if (!docAttached) {
            showMessage = true;
            cancel = true;
            comment("Error: '" + docCategory + "' document is required and has not been uploaded.");
        } 
    }
}
