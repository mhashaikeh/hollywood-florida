try{
    if (balanceDue <= 0) {
        if (getAppStatus() == "Ready to Renew") {
            updateTask("Permit Renewal", "Payment Recieved", "", "");

            /* Moving Issuance to WTUA for manual permit doc upload
            logDebug("parentLic: " + parentCapId);

            var parentCap = aa.cap.getCap(parentCapId).getOutput();
            var parentAltId = parentCap.getCapID().getCustomID();

            var b1Exp = new licenseObject(null, parentCapId);
            if (b1Exp) {
                // Get the current expiration date and extend it by 1 year
                var vExpDate = new Date(b1Exp.b1ExpDate);
                var vNewExpDate = new Date(vExpDate.getFullYear() + 1, vExpDate.getMonth(), vExpDate.getDate());
                b1Exp.setExpiration(dateAdd(vNewExpDate, 0));

                // Set license record expiration and status to Active
                var b1ExpResult = aa.expiration.getLicensesByCapID(parentCapId);
                if (b1ExpResult.getSuccess()) {
                    logDebug("Setting Exp Status");
                    var expModel = b1ExpResult.getOutput();
                    expModel.setExpStatus("Active");
                    aa.expiration.editB1Expiration(expModel.getB1Expiration());
                    logDebug("Exp Status: " + expModel.getExpStatus());

                    // Update workflow and application status

                    updateAppStatus("Active", "Updated via PPA", parentCapId);

                    /* email to be sent and renewal to be completed when staff marks record as issued 
                    // Prepare for contact and notification
                    var priContact = getContactObj(capId, "Applicant");
                    if (priContact) {
                        var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
                        var acaUrl = acaSite.replace("/Admin/login.aspx", "");
                        var buildRecURL = acaUrl + getACAUrl(capId);
                        var recCap = aa.cap.getCap(capId).getOutput();
                        var params = aa.util.newHashtable();
                        getDepartmentParams4Notification(params, "Engineering Division");
                        addParameter(params, "$$BureauName$$", lookup("Reporting Information Standards", "Bureau Name"));
                        addParameter(params, "$$AgencyName$$", "Hollywood");
                        addParameter(params, "$$acaRecordUrl$$", buildRecURL);
                        addParameter(params, "$$altID$$", capId.getCustomID());
                        addParameter(params, "$$pAltID$$", parentCapId);
                        addParameter(params, "$$recordAlias$$", recCap.getCapType().getAlias());
                        addParameter(params, "$$ContactName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
                        addParameter(params, "$$url4ACA$$", acaUrl);

                        // Attach relevant documents
                        var rFiles = [];
                        var docList = aa.document.getDocumentListByEntity(capId.toString(), "CAP").getOutput();
                        if (docList) {
                            for (var i = 0; i < docList.size(); i++) {
                                if (docList.get(i).getDocCategory() == "Permit") {
                                    var docContent = aa.document.downloadFile2Disk(docList.get(i), "PublicWorks", "", "", true);
                                    if (docContent.getSuccess()) {
                                        rFiles.push(docContent.getOutput());
                                    } else {
                                        logDebug("Failed to download document: " + docList.get(i).getDocName());
                                    }
                                }
                            }
                        }

                        // Send notification
                        sendNotification("Accela@HollywoodFl.org", priContact.capContact.getEmail(), "", "SS_PERMIT_ISSUANCE", params, rFiles);
                        sendNotification("Accela@HollywoodFl.org", "ctppermits@hollywoodfl.org", "", "SS_PERMIT_ISSUANCE", params, null,capId);
                    } else {
                        logDebug("No applicant found for record: " + capId.getCustomID());
                    }

                    // Mark renewal as complete
                    var renewalCapProject = getRenewalCapByParentCapIDForIncomplete(parentCapId);
                    if (renewalCapProject) {
                        renewalCapProject.setStatus("Complete");
                        renewalCapProject.setRelationShip("R");
                        aa.cap.updateProject(renewalCapProject);
                        aa.cap.updateAccessByACA(capId, "N");
                    } else {
                        logDebug("No incomplete renewal project found for parentCapId: " + parentCapId.getCustomID());
                    }
                } else {
                    logDebug("Failed to retrieve expiration model for parentCapId: " + parentCapId.getCustomID());
                }
            } else {
                logDebug("Failed to instantiate licenseObject for parentCapId: " + parentCapId.getCustomID());
            }*/
        }

    }
} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "PRA:PUBLICWORKS/ENGINEERING/SIDEWALK CAFE/RENEWAL", err + debug + err.stack);
}

