// Define helper functions for validations

/**
 * Gets the inspection group for a given inspection type by checking the record's inspections.
 * @param {string} inspType - The inspection type.
 * @param {object} capId - The CapID object for the current record.
 * @returns {string} - The inspection group code or null if not found.
 */
function getInspectionGroup(inspType, capId) {
    try {
        var inspResult = aa.inspection.getInspections(capId);
        if (inspResult.getSuccess()) {
            var inspList = inspResult.getOutput();
            if (inspList && inspList.length > 0) {
                for (var i = 0; i < inspList.length; i++) {
                    var inspection = inspList[i];
                    var inspectionModel = inspection.getInspection(); // Get the InspectionModel
                    // Compare inspType with the type from the InspectionModel
                    if (inspectionModel && inspectionModel.getInspectionType() == inspType) {
                        var groupCode = inspectionModel.getInspectionGroup(); // Get group code from InspectionModel
                        if (groupCode) {
                          return groupCode + ""; // Ensure it's a string
                        }
                    }
                }
            }
        } else {
            logDebug("Error getting inspections for capId " + capId.getCustomID() + ": " + inspResult.getErrorMessage());
        }
        // If not found via record inspections, optionally fallback or return null
        logDebug("Inspection group not found for type '" + inspType + "' on record " + capId.getCustomID());
        return null;
    } catch (err) {
        logDebug("Error in getInspectionGroup: " + err.message);
        return null;
    }
}

/**
 * Checks if all prerequisite inspections are resulted before scheduling a final inspection.
 * @param {string} appTypeString - The application type string (e.g., "Building/Permit/New/NA").
 * @param {string} inspType - The type of inspection being scheduled.
 * @param {object} capId - The CapID object.
 * @returns {boolean} - True if validation fails (cancel), false otherwise.
 */
function validatePrerequisites(appTypeString, inspType, capId) {
    var appTypeArray = appTypeString.split("/");
    var isFinalInspection = (inspType.indexOf("Final") > -1 && inspType.indexOf("TCO") == -1 && inspType.indexOf("PCO") == -1);
    // Check for Building/Fence/Window and Door types
    var isMatchingTypeBuilding = (appTypeArray[0] == "Building" && (inspType.indexOf(appTypeArray[2]) > -1 || inspType.indexOf(appTypeArray[1]) > -1 || inspType.indexOf("Fence") > -1 || (appTypeArray[1] == "Window and Door" && inspType.indexOf("WDS") > -1)));
    // Check for Engineering types
    var isMatchingTypeNonBuilding = (appTypeArray[0] == "PublicWorks" || appTypeArray[0] == "Fire");
    if (isFinalInspection && (isMatchingTypeBuilding || isMatchingTypeNonBuilding)) {
        var inspResultObj = aa.inspection.getInspections(capId);
        if (inspResultObj.getSuccess()) {
            var inspTypeArr = inspResultObj.getOutput();
            for (var xx in inspTypeArr) {
                // Check if the inspection is not the current one, not another final, and is still open
                if (inspTypeArr[xx].getInspectionType() != inspType &&
                    inspTypeArr[xx].getInspectionType().indexOf("Final") == -1 &&
                    matches(inspTypeArr[xx].getInspectionStatus(), null, undefined, "", "Scheduled", "Pending")) {
                    showMessage = true; // Set flag before commenting
                    comment("* Result all inspections before scheduling Final.<br>");
                    return true; // Validation failed
                }
            }
        }
    }
    return false; // Validation passed
}

/**
 * Checks if all child records are closed before scheduling a final Building inspection.
 * @param {string} appTypeString - The application type string.
 * @param {string} inspType - The type of inspection being scheduled.
 * @returns {boolean} - True if validation fails (cancel), false otherwise.
 */
function validateChildRecordsClosed(appTypeString, inspType) {
    var appTypeArray = appTypeString.split("/");
    var isFinalInspection = (inspType.indexOf("Final") > -1 && inspType.indexOf("TCO") == -1 && inspType.indexOf("PCO") == -1);
    var isMatchingTypeBuilding = (appTypeArray[0] == "Building" && (inspType.indexOf(appTypeArray[2]) > -1 || inspType.indexOf(appTypeArray[1]) > -1 || inspType.indexOf("Fence") > -1 || (appTypeArray[1] == "Window and Door" && inspType.indexOf("WDS") > -1)));
    // Check for Engineering types
    var isMatchingTypeNonBuilding = (appTypeArray[0] == "PublicWorks" || appTypeArray[0] == "Fire");
    
    if (isFinalInspection && (isMatchingTypeBuilding || isMatchingTypeNonBuilding)) {
        // Assuming isAllChildrenClosed is a function defined elsewhere (e.g., INCLUDES_ACCELA_FUNCTIONS)
        if (typeof isAllChildrenClosed === 'function' && !isAllChildrenClosed()) {
            showMessage = true; // Set flag before commenting
            comment("* Close all sub-permits before scheduling Final.<br>");
            return true; // Validation failed
        }
    }
    return false; // Validation passed
}

/**
 * Checks if a "Notice of Commencement Required" condition exists.
 * @returns {boolean} - True if validation fails (cancel), false otherwise.
 */
function validateNoticeOfCommencement() {
    // Assuming appHasCondition is a function defined elsewhere (e.g., INCLUDES_ACCELA_FUNCTIONS)
    if (typeof appHasCondition === 'function' && (appHasCondition("Record", "Applied", "Notice of Commencement Required", null) || appHasCondition("Record", "Document Received", "Notice of Commencement Required", null))) {
        showMessage = true; // Set flag before commenting
        comment("* Notice of Commencement required before scheduling.<br>");
        return true; // Validation failed
    }
    return false; // Validation passed
}

/**
 * Checks if there is a balance due on the record.
 * @param {number} balanceDue - The balance due amount.
 * @returns {boolean} - True if validation fails (cancel), false otherwise.
 */
function validateBalanceDue(balanceDue) {
    if (balanceDue > 0) {
        showMessage = true; // Set flag before commenting
        comment("* Balance due ($" + balanceDue + ") prevents scheduling.<br>");
        return true; // Validation failed
    }
    return false; // Validation passed
}

/**
 * Checks if the record status is 'Inspection Phase' for specific record types.
 * @param {string} appTypeString - The application type string.
 * @param {string} capStatus - The current status of the record.
 * @returns {boolean} - True if validation fails (cancel), false otherwise.
 */
function validateRecordStatus(appTypeString, capStatus) {
    var appTypeArray = appTypeString.split("/");
    var isMatchingType = appTypeArray[0] == 'Building' || appTypeArray[0] == 'PublicWorks' || appTypeArray[0] == 'Fire';
    if (isMatchingType && capStatus != 'Inspection Phase') {
        showMessage = true; // Set flag before commenting
        comment('* Record must be issued before scheduling.<br>');
        return true; // Validation failed
    }
    return false; // Validation passed
}

/**
 * Checks for specific "Hold Inspections" conditions based on priority that may prevent scheduling.
 * @param {object} capId - The CapID object.
 * @param {string} inspType - The type of inspection being scheduled.
 * @returns {boolean} - True if validation fails (cancel), false otherwise.
 */
function validateHoldInspectionConditions(capId, inspType) {
    var isFinalInspection = inspType.indexOf("Final") > -1;

    // Configuration for trade-specific holds
    // Maps the Trade Name (from priority description) to its relevant Inspection Group Code(s)
    var tradeHoldConfig = {
        "Structural": ["BLD_FENCE", "BLD_MH", "BLD_STRUCTUR", "BLD_TEMPSTR", "BLD_WDS", "BLDG_DEMO", "BLDG_ROOF"],
        "Electrical": ["BLDG_ELEC"],
        "Mechanical": ["BLDG_MECH"],
        "Plumbing": ["BLDG_PLUMING"],
        "Fire": ["FIRE_GEN"],
        "Zoning": ["ZONING_GEN"],
        "Engineering": ["PW_DRWY"],
        "Utilities": ["UTILITIES_GEN"]
    };

    var inspectionGroup = null;
    showMessage = true;
    
    var capConditions = aa.capCondition.getCapConditions(capId).getOutput();

    for (var i in capConditions) {
        var cond = capConditions[i];
        var condStatus = cond.getConditionStatus();
        var priorityValue = cond.getPriority(); // Get priority value
        var condDesc = cond.getConditionDescription(); // Keep original condition description for context
        var priorityDescription = null; // This will hold the looked-up description

        // Look up the description from the standard choice using the priority value
        if (priorityValue) {
            var bizDomainResult = aa.bizDomain.getBizDomainByValue("CONDITION_PRIORITIES", priorityValue);
            if (bizDomainResult.getSuccess()) {
                var bizDomainModel = bizDomainResult.getOutput();
                if(bizDomainModel){
                  priorityDescription = bizDomainModel.getDescription(); // Get the actual description
                }
            } else {
                logDebug("Failed to lookup CONDITION_PRIORITIES for value: " + priorityValue + ", Error: " + bizDomainResult.getErrorMessage());
            }
        }

        // Check only active conditions
        if (matches(condStatus, "Applied")) { // Add other active statuses if necessary

            // Check based on the looked-up priority *description*
            if (priorityDescription == "Hold Inspections - All") {
                showMessage = true;
                comment("* Scheduling prevented by condition: " + condDesc);
                return true; // Cancel for any inspection
            }
            if (isFinalInspection && priorityDescription == "Hold Inspections - Final") {
                showMessage = true;
                comment("* Scheduling prevented by condition: " + condDesc);
                return true; // Cancel only for final inspections
            }

            // Iterate through configured trades to check for specific holds
            for (var tradeName in tradeHoldConfig) {
                if (!tradeHoldConfig.hasOwnProperty(tradeName)) continue; // Skip inherited properties

                var holdAllString = "Hold Inspections - " + tradeName + " All";
                var holdFinalString = "Hold Inspections - " + tradeName + " Final";
                var holdType = null;

                if (priorityDescription == holdAllString) {
                    holdType = "All";
                } else if (priorityDescription == holdFinalString) {
                    holdType = "Final";
                }

                // If a match for this trade was found
                if (holdType) {
                    var requiredGroupCodes = tradeHoldConfig[tradeName];

                    // Get the current inspection's group (only if needed)
                    if (!inspectionGroup) { // Avoid repeated calls if already fetched
                        inspectionGroup = getInspectionGroup(inspType, capId);
                    }

                    // Check if the inspection group matches the requirement for this trade hold
                    if (requiredGroupCodes.indexOf(inspectionGroup) > -1) {
                        // Apply the hold logic
                        if (holdType === "All") {
                            showMessage = true;
                            comment("* Scheduling prevented by condition: " + condDesc + "<br>");
                            logDebug("Hold applied due to '" + priorityDescription + "' for matching group '" + inspectionGroup + "'");
                            return true; // Cancel any inspection in this group
                        } else if (holdType === "Final" && isFinalInspection) {
                            showMessage = true;
                            comment("* Scheduling prevented by condition: " + condDesc + "<br>");
                            logDebug("Hold applied due to '" + priorityDescription + "' for matching final inspection in group '" + inspectionGroup + "'");
                            return true; // Cancel final inspection in this group
                        }
                    }
                    // Once a match is found and processed for a trade, no need to check others for this condition
                    break;
                }
            }
        }
    }

    return false; // No relevant hold condition found
}

// --- Main Script Execution ---

// Initialization
var cap = aa.cap.getCap(capId).getOutput();
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString();
var capStatus = cap.getCapStatus();


// Reset cancel and showMessage flags (if they are used globally)

showMessage = false; // Assuming showMessage is used to trigger comments display

// Perform Validations
if (validatePrerequisites(appTypeString, inspType, capId)) {
    cancel = true;
}

if (validateChildRecordsClosed(appTypeString, inspType)) {
    // Assuming isAllChildrenClosed exists and needs to be checked only for Building Finals
    cancel = true;
}

if (validateNoticeOfCommencement()) {
    cancel = true;
}

if (validateBalanceDue(balanceDue)) {
    cancel = true;
}

if (validateRecordStatus(appTypeString, capStatus)) {
    cancel = true;
}

if (validateHoldInspectionConditions(capId, inspType)) {
    cancel = true;
}


