if(balanceDue<=0 && matches(capStatus,"Ready to Issue","Awaiting Payment")){

    updateTask("Permit Issuance", "Payment Recieved", "", "");

    /* Moving Issuance to WTUA for manual permit doc uploads
    var approvedDate = null;
    var expirationDate = null;

    // Get the system's current date and derive current year from it
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    var prevYear = currentYear - 1;
    var nextYear = currentYear + 1;

    // Retrieve the approval date from the workflow task "Plans Coordination" with disposition "Ready to Issue"
    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess()) {
        var workflowTasks = workflowResult.getOutput();
        for (var i = 0; i < workflowTasks.length; i++) {
            var task = workflowTasks[i];
            if (task.getTaskDescription() == "Plans Coordination" && task.getDisposition() == "Ready to Issue") {
                approvedDate = task.getStatusDate();
                break;
            }
        }

        logDebug("approvedDate: " + approvedDate);

        if (approvedDate) {
            approvedDate = new Date(approvedDate.getTime());

            // Define your date range boundaries based on the current year (system date)
            var prevYearOct1 = new Date(prevYear, 9, 1);         // October 1, prevYear
            var currentYearApr1 = new Date(currentYear, 3, 1);   // April 1, currentYear
            var currentYearApr2 = new Date(currentYear, 3, 2);   // April 2, currentYear
            var currentYearDec31 = new Date(currentYear, 11, 31); // December 31, currentYear

            // Check which range the approvedDate falls into:
            if (approvedDate >= prevYearOct1 && approvedDate <= currentYearApr1) {
                // Approved between October 1 of previous year and April 1 of current year
                expirationDate = new Date(currentYear, 8, 30); // September 30, currentYear
            } else if (approvedDate >= currentYearApr2 && approvedDate <= currentYearDec31) {
                // Approved between April 2 and December 31 of current year
                expirationDate = new Date(nextYear, 8, 30); // September 30, nextYear
            } else {
                // If it doesn't fall into either range
                logDebug("Approval date does not fall into defined expiration ranges.");
            }
        }
    }

    // If we have a valid expiration date, update the expiration model
    if (expirationDate) {
        var expirationModel = aa.expiration.getLicensesByCapID(capId).getOutput();
        if (expirationModel) {
            expirationModel.setExpDate(aa.date.parseDate((expirationDate.getMonth() + 1) + "/" + expirationDate.getDate() + "/" + expirationDate.getFullYear()));
            expirationModel.setExpStatus("Active");
            var updateResult = aa.expiration.editB1Expiration(expirationModel.getB1Expiration());
            if (updateResult.getSuccess()) {
                logDebug("Expiration date updated to " + expirationDate.toLocaleDateString() + " and status set to Active.");
            } else {
                logDebug("Failed to update expiration: " + updateResult.getErrorMessage());
            }
        } else {
            logDebug("Failed to retrieve expiration model for record.");
        }

        // Update related tasks and record status
        
        //updateAppStatus("Active", "Updated via PPA", capId);

        // Handle notification with relevant documents attached
        var priContact = getContactObj(capId, "Applicant");
        var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
        var acaUrl = acaSite.replace("/Admin/login.aspx", "");
        var buildRecURL = acaUrl + getACAUrl(capId);
        var recCap = aa.cap.getCap(capId).getOutput();
        var docName = "Permit";
        var rFiles = [];

        if (priContact) {
            var params = aa.util.newHashtable();
            getDepartmentParams4Notification(params, "Engineering Division");
            var bureauName = lookup("Reporting Information Standards", "Bureau Name");
            addParameter(params, "$$BureauName$$", bureauName);
            addParameter(params, "$$AgencyName$$", "Hollywood");
            addParameter(params, "$$acaRecordUrl$$", buildRecURL);
            addParameter(params, "$$altID$$", capId.getCustomID());
            addParameter(params, "$$recordAlias$$", recCap.getCapType().getAlias());
            addParameter(params, "$$ContactName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
            var emailAddress = "" + priContact.capContact.getEmail();
            addParameter(params, "$$url4ACA$$", acaUrl);

            var docList = aa.document.getDocumentListByEntity(capId.toString(), "CAP").getOutput();
            if (docList && docList.size() > 0) {
                for (var i = 0; i < docList.size(); i++) {
                    if (docList.get(i).getDocCategory() == docName) {
                        var docContent = aa.document.downloadFile2Disk(docList.get(i), "PublicWorks", "", "", true);
                        var rFile = docContent.getOutput();
                        rFiles.push(rFile);
                    }
                }
            }

            sendNotification("Accela@HollywoodFl.org", emailAddress, "", "SS_PERMIT_ISSUANCE", params, rFiles);
        }

    } else {
        logDebug("Expiration date calculation failed for " + capId.getCustomID() + ".");
    }
    */
}