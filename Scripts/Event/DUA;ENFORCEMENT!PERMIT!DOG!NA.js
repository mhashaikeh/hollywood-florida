try {

    if (documentUploadedFrom == "ACA") {
        var capIdStatusClass = getCapIdStatusClass(capId);
        if (String(capIdStatusClass) == "COMPLETE") {

            var capStatus = aa.cap.getCap(capId).getOutput().getCapStatus();
            
            // set to Document Received for any document upload pre-issuance
            if (capStatus != "Active" || capStatus.indexOf("Closed") != -1) {
                updateAppStatus("Document Received", "Updated via DUA - document uploaded pre-issuance or closed status");
            }

            // Check for specific documents when status is Issued
            if (capStatus == "Active") {

            var hasRequestOfClosure = false;
            var hasNoticeOfOwnerChange = false;
            

                var docArray = documentModelArray.toArray();
                for (each in docArray) {
                    var aDoc = docArray[each];
                    docCats = aDoc.getDocCategory();
                    if (docCats == "Request for Closure") {
                        hasRequestOfClosure = true;
                    }
                    if (docCats == "Notice of Ownership Change") {
                        hasNoticeOfOwnerChange = true;
                    }
                }
                
                if (hasRequestOfClosure || hasNoticeOfOwnerChange) {
                    updateAppStatus("Document Received", "Updated via DUA script - required documents received");
                }
            }
        }
    }
} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "DUA:Enforcement/Permit/Dog/NA", err + debug + err.stack);
}