/*------------------------------------------------------------------------------------------------------/
| Program       : POST_ENFORCEMENT_COMPLAINT_INSPECTION_OUTCOME
| Event         : POST SCRIPT
| Usage         : Creates a child Enforcement/Case record from parent, closes initial investigation,
|                copies record data, schedules follow-up inspection, applies outcome-specific address
|                condition, and assigns to inspector based on specified violation outcomes
| Created by    : JSHEAR 4/4/2025
| Last Edited   : 
/------------------------------------------------------------------------------------------------------*/

try {
    // Initialize variables
    var outcomeResult = String(getCheckListCustomFieldValue("Outcome", "INVESTIGATION INFORMATION", capId, inspId));
    var complyTime = String(getCheckListCustomFieldValue("Inspection Date", "INSPECTION DATE", capId, inspId));
    var validOutcomes = ["Administrative Citation", "Animal Violation", "Dangerous Dog", 
                        "Environmental Services", "NMIP", "Notice of Violation"];

    // Determine violation type with fallback
    var checklistValue = String(getCheckListCustomFieldValue("Violation Type", "INVESTIGATION INFORMATION", capId, inspId));
    var violationType = checklistValue == "null" ? getAppSpecific("Violation Type", capId) : checklistValue;

    if (checklistValue != "null") {
        var violationDescription = lookup("ENF_CASE_ABBREV_TYPES", checklistValue);
        editAppSpecific("Violation Type", checklistValue, capId);
        editAppSpecific("Violation Description", violationDescription, capId);
        
        var violationCategory = getDrillDownParentForViolationType(checklistValue);
        if (violationCategory) {
            editAppSpecific("Violation Category", violationCategory, capId);
        }
    }
    var highPriority = String(getCheckListCustomFieldValue("High Priority", "INVESTIGATION INFORMATION", capId, inspId));
    if (highPriority != "null") {
        editAppSpecific("High Priority", highPriority, capId);
    }
    
    // Process only if outcome matches specified violations
    if (validOutcomes.indexOf(outcomeResult) != -1) {
        // Close initial investigation
        closeTask("Investigation", "Notice of Violation", "", "");
        updateAppStatus("Closed - Violation", "Updated By Script");

        // Create child case based on division
        var divisionField = getAppSpecific("Division", capId) || "Code Compliance";
        var childCap = createChildCase(divisionField, capId);

        editAppSpecific("Complaint Number",capId.getCustomID(),childCap);

        if (checklistValue != "null") {
            var violationRemedy = lookup("ENF_REMEDY",checklistValue);
            if (!matches(violationRemedy, null, undefined, "")){
                editAppSpecific("Violation Remedy", violationRemedy, childCap);
            }
        }
        
        var recordASIGroup = aa.appSpecificInfo.getByCapID(childCap);
        if (recordASIGroup.getSuccess()){
            var recordASIGroupArray = recordASIGroup.getOutput();
            for (i in recordASIGroupArray) {
                var group = recordASIGroupArray[i];
                var groupName = String(group.getGroupCode());
                var recordField = String(group.getCheckboxDesc());

                var sourceValue = getAppSpecific(recordField,capId);
                if (sourceValue != undefined || sourceValue != null){
                    logDebug("Editing: " + recordField + ": " + sourceValue + " To: " + capId.getCustomID());
                    editAppSpecific(recordField,sourceValue,childCap);
                }
            }
        }

        if (divisionField == "Environmental Services"){
            updateTask("Follow-Up Investigation", "ES Work Order", "", "", "", childCap);
        }
                       
        // Copy relevant data to child record
        copyRecordData(capId, childCap);

        // Set GIS districts
        setGISDistricts2(childCap, "Code Districts", true);

        // Schedule follow-up inspection
        scheduleFollowUpInspection(childCap, complyTime, violationType);

        // Handle address condition with specific type based on outcome
        manageAddressCondition(capId, outcomeResult);
        
        // Assign to inspector
        assignToInspector(capId, childCap);

        //Add to Daily Print Set
        addToDailySet();

        if (outcomeResult == "Notice of Violation"){
            var outcomeDelivery = String(getCheckListCustomFieldValue("Outcome Delivery", "INVESTIGATION INFORMATION", capId, inspId));
            if (outcomeDelivery != "Not Applicable"){
                addToSetNOV();
                //Start: Attache NOV Report to Violation
                var reportName = "Notice Of Violation";
                var rptParams = aa.util.newHashMap();
                var docGroup = "ENF_CASE";
                var docType = "Notice of Violation";
                var itemCapId = childCap;
                rptParams.put("RecordID", itemCapId.getCustomID());
                runReportAndAttachAsyncWaitTime(reportName, "Enforcement", itemCapId, rptParams, docGroup, docType);
                //End: Attache NOV Report to Violation
            }
        }

        if (outcomeResult == "Administrative Citation"){
            updateTask("Case Intake", "Citation Pending Payment", "", "", "", childCap);
            var adminAmount = Number(getCheckListCustomFieldValue("Administrative Citation Amount", "INVESTIGATION INFORMATION", capId));
            holdId = capId;
            capId = childCap;
            editTaskDueDate("Case Intake", dateAdd(null, 10));
            updateFee('CODE05', 'CODE_COMPLIANCE', 'FINAL', adminAmount, 'N');
            capId = holdId;
        }else{
            closeTaskByCapId("Case Intake", "Assigned", "", "", null, childCap);
        }
    }else{
        if (outcomeResult == "Administrative Citation Warning"){
            closeTask("Investigation", "Administrative Citation Warning", "", "");
            updateAppStatus("Closed - Warning", "Updated By Script");
        }
        if (outcomeResult == "Courtesy Notice"){
            scheduleFollowUpInspection(capId, complyTime, violationType);
        }
    }

    createAdditionalViolations();

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "POST_ENFORCEMENT_COMPLAINT_INSPECTION_OUTCOME", err + debug + err.stack);
}


function createChildCase(division, parentCapId) {
    var appType = ["Enforcement", "Case", matches(division, "Code Compliance", "Environmental Services") ? "NA" : division, "NA"];
    return createChild(appType[0], appType[1], appType[2], appType[3], 
                      violationType + " Created from " + parentCapId.getCustomID(), parentCapId);
}

function copyRecordData(sourceCap, targetCap) {
    copyDocumentsToCapID(sourceCap, targetCap);
    copyOwner(sourceCap, targetCap);
    copyAddresses(sourceCap, targetCap);
    copyParcels(sourceCap, targetCap);
}

function scheduleFollowUpInspection(cap, extDate, violationType) {
    var inspName = getAssigned();
    var inspRes = aa.person.getUser(inspName);
    if (inspRes.getSuccess()){
        inspectorObj = inspRes.getOutput();
    }else{
        inspectorObj = null 
    }
    // Ensure extDate is valid and in a parseable format (e.g., "MM/DD/YYYY")
    var inspType = divisionField == "Environmental Services" ? "ES Compliance Inspection" : "Follow-Up Inspection";
    if (extDate && extDate !== "null" && extDate !== "") {
        var parsedDate = aa.date.parseDate(extDate);
        if (parsedDate) {
            var schedRes = aa.inspection.scheduleInspection(cap, inspectorObj, parsedDate, null, inspType, "Scheduled via Script");

            if (schedRes.getSuccess()) {
                assignCap(inspName, cap);
                logDebug("Successfully scheduled inspection: Initial Inspection for " + extDate);
            } else {
                logDebug("**ERROR: Adding scheduling inspection Initial Inspection: " + schedRes.getErrorMessage());
            }
        } else {
            logDebug("**ERROR: Invalid date format for extDate: " + extDate);
        }
    } else {
        // Fallback to complyTime if extDate is invalid or null
        var complyTime = Number(lookup("ENF_COMPLY_TIME", violationType)) || 0;
        var schedRes = aa.inspection.scheduleInspection(cap, inspectorObj, aa.date.parseDate(dateAdd(null, complyTime)), null, inspType, "Scheduled via Script");

        if (schedRes.getSuccess()) {
            assignCap(inspName, cap);
            logDebug("Successfully scheduled inspection: Initial Inspection for " + dateAdd(null, complyTime));
        } else {
            logDebug("**ERROR: Adding scheduling inspection Initial Inspection: " + schedRes.getErrorMessage());
        }
    }
}

function manageAddressCondition(cap, outcome) {
    var primaryAddress = aa.address.getPrimaryAddressByCapID(cap, "Y");
    if (!primaryAddress.getSuccess()) {
        logDebug("Failed to get primary address");
        return;
    }

    var refAddress = primaryAddress.getOutput();
    var refID = refAddress.getRefAddressId();
    
    if (refID) {
        var conditionCount = aa.addressCondition.getAddressConditions(refID).getOutput().length;
        if (conditionCount == 0) {
            // Map outcomes to specific condition types
            var conditionType;
            switch(outcome) {
                case "Administrative Citation":
                    conditionType = "Administrative Citation";
                    break;
                case "Animal Violation":
                    conditionType = "Animal Violation";
                    break;
                case "Dangerous Dog":
                    conditionType = "Dangerous Dog Permit Required";
                    break;
                case "Environmental Services":
                    conditionType = "Environmental Services Work Order";
                    break;
                case "NMIP":
                    conditionType = "NMIP";
                    break;
                case "Notice of Violation":
                    conditionType = "Notice of Violation";
                    break;
                default:
                    conditionType = "Notice of Violation"; // Fallback
            }
            
            addAddressCondition(refID, conditionType, "Applied", "", "", "Notice");
            logDebug("Added condition: " + conditionType + " to Address " + refID);
        } else {
            logDebug("Condition already exists on Address " + refID);
        }
    }
}

function assignToInspector(sourceCap, targetCap) {
    var userId = getAssigned(sourceCap);
    assignCap(userId, targetCap);
}

function createAdditionalViolations() {

    var gsObjects = getGuideSheetObjects(inspId, capId);

    if (gsObjects && gsObjects.length > 0) {
        for (var j in gsObjects) {
            var gsObj = gsObjects[j];
            gsObj.loadInfoTables(); // Load ASIT data
            
            if (gsObj.validTables && gsObj.infoTables["NEW VIOLATION"]) {
                var newViolationTable = gsObj.infoTables["NEW VIOLATION"];
                for (var rowIdx in newViolationTable) {
                    var row = newViolationTable[rowIdx];
                    if (row["Source"] || row["Division"] || row["Violation Type"]) {
                        var  Source = "" + row["Source"] || "";
                        var violationType = "" + row["Violation Type"] || "";
                        var division = "" + row["Division"] || "";
                        var violationDescription = lookup("ENF_CASE_ABBREV_TYPES",violationType);
                        var appType = ["Enforcement", "Case", matches(division, "Code Compliance", "Environmental Services") ? "NA" : division, "NA"];
                        var childCap = createChild(appType[0], appType[1], appType[2], appType[3], violationType + " Created from " + capId.getCustomID(), capId);
                        editAppSpecific("Source of Complaint", Source, childCap);
                        editAppSpecific("Violation Type", violationType ,childCap);
                        editAppSpecific("Violation Description", violationDescription, childCap);
                        editAppSpecific("Violation Division", division, childCap);
                        editAppSpecific("Complaint Number", capId.getCustomID(), childCap);
                        var violationCategory = getDrillDownParentForViolationType(row["Violation Type"]);
                        if (violationCategory){
                            editAppSpecific("Violation Category", violationCategory, childCap);
                        }
                        copyASIFields(capId, childCap);
                        copyOwner(capId, childCap);
                        copyAddresses(capId, childCap);
                        copyParcels(capId, childCap);

                        var inspName = getAssigned();
                        var inspRes = aa.person.getUser(inspName);
                        if (inspRes.getSuccess()){
                            inspectorObj = inspRes.getOutput();
                        }else{
                            inspectorObj = null 
                        }
                        complyTime = Number(lookup("ENF_COMPLY_TIME", violationType)) || 0;
                        assignCap(inspName, childCap);
                        var schedRes = aa.inspection.scheduleInspection(childCap, inspectorObj, aa.date.parseDate(dateAdd(null, complyTime)), null, "Follow-Up Inspection", "Scheduled via Script");

                        if (schedRes.getSuccess()){
                            logDebug("Successfully scheduled inspection : Initail Inspection for " + dateAdd(null, 0));
                        }else{
                            logDebug("**ERROR: adding scheduling inspection Initial Inspection: " + schedRes.getErrorMessage());
                        }
                    }
                }
            } else {
                logDebug("No NEW VIOLATION data found for inspection " + inspId + " in guidesheet item " + j);
            }
        }
    } else {
        logDebug("No guidesheets found for inspection " + inspId);
    }
}

function addToDailySet() {
    var theSetName = "DAILY_CODE_";
    theSetName += aa.util.formatDate(new Date(), "MMddYYYY");

    var theSet = aa.set.getSetByPK(theSetName);
    if (!theSet.getSuccess() || !theSet.getOutput()) {
        theSet = createSet(theSetName, theSetName, "Daily Letter - Code", "Ready to Process");
        if (!theSet) {
            logDebug("**ERROR: Failed to create set " + theSetName + ": " + theSet.getErrorMessage());
        }
    }

    var added = aa.set.addCapSetMember(theSetName, childCap);
    if (!added.getSuccess()) {
        logDebug("**ERROR: Failed to add capId to set " + theSetName + ": " + added.getErrorMessage());
    }else{

        // Add row to Mailed Letter Tracking facedtable
        var letterRow = new Array();
        letterRow["Letter Type"] = "Daily Letter";
        letterRow["Date Sent"] = aa.util.formatDate(new Date(), "MM/dd/YYYY");
        letterRow["Set ID"] = theSetName;

        var letterTable = new Array();
        letterTable.push(letterRow);
        addASITable("LETTERS", letterTable, childCap);
    }
}

function addToSetNOV() {
    var theSetName = "NOV_CODE_";
    theSetName += aa.util.formatDate(new Date(), "MMddYYYY");

    var theSet = aa.set.getSetByPK(theSetName);
    if (!theSet.getSuccess() || !theSet.getOutput()) {
        theSet = createSet(theSetName, theSetName, "Notice of Violation - Code", "Ready to Process");
        if (!theSet) {
            logDebug("**ERROR: Failed to create set " + theSetName + ": " + theSet.getErrorMessage());
        }
    }

    var added = aa.set.addCapSetMember(theSetName, childCap);
    if (!added.getSuccess()) {
        logDebug("**ERROR: Failed to add capId to set " + theSetName + ": " + added.getErrorMessage());
    }
}