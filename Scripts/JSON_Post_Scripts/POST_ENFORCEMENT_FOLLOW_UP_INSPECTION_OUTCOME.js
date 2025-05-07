/*------------------------------------------------------------------------------------------------------/
| Program       : POST_ENFORCEMENT_FOLLOW_UP_INSPECTION_OUTCOME
| Event         : POST SCRIPT
| Usage         : Script performs tasks based upon Outcome result of associated checklist 
| Created by    : JSHEAR 4/4/2025
| Last Edited   : 
/------------------------------------------------------------------------------------------------------*/

try {
    // Initialize variables
    var outcomeResult = String(getCheckListCustomFieldValue("Outcome", "INVESTIGATION INFORMATION", capId, inspId));

    if (outcomeResult == "Special Magistrate Hearing"){
        closeTask("Follow-Up Investigation", "Special Magistrate", "", "");
    }

    if (outcomeResult == "Violation Corrected"){
        closeTask("Follow-Up Investigation", "Violation Corrected", "", "");
        updateAppStatus("Closed - Violation Corrected", "Closed by passing follow-up inspection - script");
        closeWorkflow(capId);
        
        //Remove Condition
        var primaryAddress = aa.address.getPrimaryAddressByCapID(capId, "Y");

        if (primaryAddress.getSuccess()) {
            var refAddress = primaryAddress.getOutput();
            var refID = refAddress.getRefAddressId();
            // logDebug("Primary Address is " + refAddress);
            logDebug("Ref Address ID is " + refID);
        }

        if (refID) {
            var refAddrConds = aa.addressCondition.getAddressConditions(refID);
            refAddrConds = refAddrConds.getOutput().length;
            logDebug("Condition Count is: " + refAddrConds);
            //logDebug("Condition Count is: " + parcelCondtionCount);

            //If condition exists on parcel remove it
            if (refAddrConds > 0) {
                var compNumber = getAppSpecific("Complaint Number");
                if (!matches(compNumber,null,undefined,"")){
                    var pCapId = getApplication(compNumber);
                    var outCome = getInitialInspOutcomeFieldValue(pCapId);
                }else{
                    var outCome = getInitialInspOutcomeFieldValue(capId);
                }
                removeAddressCondition(String(outCome));
            } else {
                logDebug("No condition on this Address " + refID);
            }
        }
    }

    if (outcomeResult == "Extension Granted"){
        extDate = String(getCheckListCustomFieldValue("Inspection Date", "INSPECTION DATE", capId, inspId));
        violationType = String(getCheckListCustomFieldValue("Violation Type", "INVESTIGATION INFORMATION", capId, inspId));
        scheduleFollowUpInspection(capId, extDate, violationType);
    }

    if (outcomeResult == "Dangerous Dog"){
        editAppSpecific("Declared Dangerous Dog", "Yes",capId);
        updateTask("Follow-Up Investigation", "Dangerous Dog Notice", "", "");
        assignTask("Follow-Up Investigation","JRICKEY");
        editAppSpecific("Dangerous Dog Appeal Deadline", dateAdd(null, 5), capId);
        editTaskDueDate("Follow-Up Investigation", dateAdd(null, 14));
    }

    var highPriority = String(getCheckListCustomFieldValue("High Priority", "INVESTIGATION INFORMATION", capId, inspId));
    if (highPriority != "null") {
        editAppSpecific("High Priority", highPriority, capId);
    }


    createAdditionalViolations();

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "POST_ENFORCEMENT_FOLLOW_UP_INSPECTION_OUTCOME", err + debug + err.stack);
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

function scheduleFollowUpInspection(cap, extDate, violationType) {
    var inspName = getAssigned();
    var inspRes = aa.person.getUser(inspName);
    var inspectorObj = null;

    if (inspRes.getSuccess()) {
        inspectorObj = inspRes.getOutput();
    } else {
        logDebug("**ERROR: Could not retrieve inspector: " + inspRes.getErrorMessage());
    }

    // Ensure extDate is valid and in a parseable format (e.g., "MM/DD/YYYY")
    if (extDate && extDate !== "null" && extDate !== "") {
        var parsedDate = aa.date.parseDate(extDate);
        if (parsedDate) {
            var schedRes = aa.inspection.scheduleInspection(cap, inspectorObj, parsedDate, null, inspType, "Scheduled via Script");

            if (schedRes.getSuccess()) {
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
            logDebug("Successfully scheduled inspection: Initial Inspection for " + dateAdd(null, complyTime));
        } else {
            logDebug("**ERROR: Adding scheduling inspection Initial Inspection: " + schedRes.getErrorMessage());
        }
    }
}


