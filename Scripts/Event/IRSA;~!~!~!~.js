//Start: Create Pending Inspection if not Passed

cap = aa.cap.getCap(capId).getOutput();
appTypeResult = cap.getCapType();
appTypeString = appTypeResult.toString();
appTypeArray = appTypeString.split("/");

if (appTypeArray[0] != "Enforcement"){
    if (inspResult != "Passed") {
        createPendingInspection(inspGroup, inspType);
    }
}
//End: Create Pending Inspection if not Passed


//Start: Apply Failed Fee
if (inspResult == "Failed - Fee") {
    var failedFee = "";
    failedFee = addFee('BLD16', 'BUILDING', 'FINAL', 1, 'Y');
    editFeeComment(failedFee, inspType);
    invoiceAllFees();
}
//End: Apply Failed Fee

// Start: Apply Closed Date After Final Inspection has been Passed
var isFinalInspection = (inspType.indexOf("Final") > -1 && inspType.indexOf("TCO") == -1 && inspType.indexOf("PCO") == -1);
var isMatchingType = (
    inspType.indexOf(appTypeArray[2]) > -1 && appTypeArray[2] != "Tree Removal") ||
    (appTypeArray[1] == "Fence" && inspType == "Final Fence Inspection") ||
    (appTypeArray[1] == "Roofing" && inspType == "Roofing Final Inspection") ||
    (appTypeArray[1] == "Window and Door" && inspType == "Final WDS Inspection") ||
    (appTypeArray[0] == "Fire" && inspType.indexOf(appTypeArray[2]) > -1) ||
    (appTypeArray[1] == "Engineering" && appTypeArray[2] != "Tree Removal" && inspType.indexOf(appTypeArray[1]) > -1) ||
    (inspType == "Final Fire Bureau Inspection" && appTypeArray[2] == "Eng Life Safety") ||
    (inspType == "Fire Main Final Inspection" && appTypeArray[2] == "Underground Main") ||
    (inspType == "Final Landscape Inspection" && appTypeArray[2] == "Tree Removal") ||
    (inspType == "Final Drainage Inspection" && appTypeArray[2] == "Onsite Drainage") ||
    (inspType == "Final Utilities Inspection" && appTypeArray[2] == "Station");

if (isFinalInspection && isMatchingType) {
    var appCloseDate = getAppSpecific("Closed Date");
    if (inspResult == "Passed") {
        var today = new Date();
        var closedDateString = (today.getMonth() + 1) + "/" + today.getDate() + "/" + today.getFullYear();
        editAppSpecific("Closed Date", closedDateString);
        closeTask("Inspection", "Final Inspection Complete", "Closed via Script", "");
    } else {
        if (!matches(appCloseDate, "", null, undefined) && isTaskComplete("Inspection")) {
            editAppSpecific("Closed Date", "");
            activateTask("Inspection");
            updateAppStatus("Inspection Phase", "Updated By IRSA:*/*/*/* Script");
        }
    }
    
    // Start: Close Sub-Permit Conditions on Parent
    var isSubPermit = getAppSpecific("Is this application being submitted as a sub-permit to a master building permit", capId);
    if (isSubPermit == "Yes"){
        var parentCapId = getParent();
        if (parentCapId) {
            var parentCap = aa.cap.getCap(parentCapId).getOutput();
            var parentCapType = parentCap.getCapType().toString();

            // Check if parent is of type PublicWorks/Engineering/Site Improvement/NA
            if (parentCapType == "PublicWorks/Engineering/Site Improvement/NA") {
                logDebug("Parent record type matches the criteria.");

                // Get all conditions applied to the parent record
                var condResult = aa.capCondition.getCapConditions(parentCapId);
                if (condResult.getSuccess()) {
                    var conditions = condResult.getOutput();

                    for (var i in conditions) {
                        var condition = conditions[i];

                        // Check if condition type is Sub-Permits and status is Applied
                        if (condition.getConditionType() == "Sub-Permits" && condition.getConditionStatus() == "Applied") {
                            logDebug("Within condition type and status check.");
                            var conditionDescription = condition.getConditionDescription();

                            // Get the child record alias
                            var childAlias = String(cap.getCapType().getAlias()); // Explicitly convert to a JavaScript string
                            var cleanedAlias = childAlias.replace(/Commercial|Residential/gi, "").trim();
                            logDebug("conditionDescription: " + conditionDescription + " cleanedAlias: " + cleanedAlias);

                            // Check if the cleaned alias is mentioned in the condition description
                            if (conditionDescription && conditionDescription.indexOf(cleanedAlias) > -1) {
                                logDebug("Child record alias found in condition description. Updating condition status.");

                                // Update the condition status to Condition Met
                                condition.setConditionStatus("Condition Met");
                                var updateResult = aa.capCondition.editCapCondition(condition);

                                if (updateResult.getSuccess()) {
                                    logDebug("Condition successfully updated to Condition Met.");
                                } else {
                                    logDebug("Failed to update condition: " + updateResult.getErrorMessage());
                                }
                            }
                        }
                    }
                }
            } 
        } 
    }
	// End: Close Sub-Permit Conditions on Parent
}
// End: Apply Closed Date After Final Inspection has been Passed

//Start: Send Inspection Result Email and Report
var reportName = "Inspection Result Ticket";
var notificationTemplate = "SS_INSPECTION_RESULTED";

// Set the report parameters.
var rptParams = aa.util.newHashMap();
var altId = capId.getCustomID();
rptParams.put("p1Value", inspId);

contArr = getContactArray();
var ccEmail = "";
var contEmail = "";
for (x in contArr) {
    if (!matches(contArr[x]["contactType"], null)) {
        if (contArr[x]["contactType"] == "Applicant") {
            contEmail = contArr[x]["email"];
            if (contEmail) {
                var eParams = aa.util.newHashtable();
                var deptName = "";
                if (appTypeArray[0] == "Fire") {
                    deptName = "Fire Prevention";
                } else if (appTypeArray[0] == "PublicWorks") {
                    deptName = "Engineering Division";
                } else {
                    deptName = appTypeArray[0] + " Division";
                }
                var bureauName = lookup("Reporting Information Standards", "Bureau Name");
                var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
                var acaUrl = acaSite.replace("/Admin/login.aspx", "");
                buildRecURL = acaUrl + getACAUrl(capId);
                addParameter(eParams, "$$BureauName$$", bureauName);
                getDepartmentParams4Notification(eParams, deptName);
                addParameter(eParams, "$$altID$$", altId);
                addParameter(eParams, "$$acaRecordUrl$$", buildRecURL);
                addParameter(eParams, "$$recordAlias$$", cap.getCapType().getAlias());
                addParameter(eParams, "$$ContactName$$", contArr[x]["firstName"] + " " + contArr[x]["lastName"]);
                addParameter(eParams, "$$inspResultDate$$", inspResultDate);
                addParameter(eParams, "$$inspType$$", inspType);
                addParameter(eParams, "$$inspResult$$", inspResult);
                addParameter(eParams, "$$inspComment$$", inspComment);
            }
        }
        if (contArr[x]["contactType"] == "Property Owner") {
            ccEmail = contArr[x]["email"];
        }
    }
}
if (contEmail) {
    runReportAndSendAsyncWaitTime(reportName, cap.getCapModel().getModuleName(), capId, rptParams, "Accela@HollywoodFl.org", contEmail, notificationTemplate, eParams, ccEmail);
}
//End: Send Inspection Result Email and Report  