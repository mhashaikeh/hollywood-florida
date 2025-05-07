/*------------------------------------------------------------------------------------------------------/
| Program        : POST_ENFORCEMENT_COMPLAINT_AUTO.js
| Event          : STDBASE - Post Script
| Usage          : Update Complaint with User and Inspection Assignments
| Created by     : JSHEAR 4/3/2025
/------------------------------------------------------------------------------------------------------*/

//Start Schedule and Assign Initial Inspection
try{
    setGISDistricts(capId, "Code Districts", true);
    var inspType = "Initial Inspection";
    var daysAhead = 0;

    // Get all inspections for the cap
    var inspResultObj = aa.inspection.getInspections(capId);
    if (!inspResultObj.getSuccess()) {
        logDebug("**ERROR: Failed to get inspections: " + inspResultObj.getErrorMessage());
    } else {
        var inspections = inspResultObj.getOutput();
        if (!inspections || inspections.length == 0) {
            logDebug("**WARNING: No inspections found for this record");
        } else {
            // Find and process the Initial Inspection
            for (var i in inspections) {  // Changed from for...of to for...in
                if (inspections[i].getInspectionType() == inspType) {
                    var inspectionId = inspections[i].getIdNumber();
                    var inspectorAssigned = autoAssignInspectionAndReturnUID(inspectionId);
                    
                    if (inspectorAssigned) {
                        // Assign the record to the same inspector
                        logDebug("inspectorId: " + inspectorAssigned)
                        var recordAssigned = assignCap(inspectorAssigned, capId);
                        
                        if (recordAssigned) {
                            logDebug("Successfully processed inspection and record assignment");
                        }
                        break; // Exit after processing the first matching inspection
                    }
                }
            }
        }
    }

    closeTask("Complaint Intake", "Complaint Routed", "", "");
    activateTask("Investigation");

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "POST_ENFORCEMENT_COMPLAINT_AUTO", err + debug + err.stack);
}
