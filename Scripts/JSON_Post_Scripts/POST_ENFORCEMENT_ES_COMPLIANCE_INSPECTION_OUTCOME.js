/*------------------------------------------------------------------------------------------------------/
| Program       : POST_ENFORCEMENT_ES_COMPLIANCE_INSPECTION_OUTCOME
| Event         : POST SCRIPT
| Usage         : Script performs tasks based upon Outcome result of associated checklist 
| Created by    : JSHEAR 4/4/2025
| Last Edited   : 
/------------------------------------------------------------------------------------------------------*/

try {
	// Initialize variables
    var cubicYardsDebris = parseFloat(getCheckListCustomFieldValue("Total Cubic Yards - DR", "ES DEBRIS REMOVAL DETAILS", capId, inspId)) || 0;
    var cubicYardsYard = parseFloat(getCheckListCustomFieldValue("Total Cubic Yards - YW", "ES YARD WASTE DETAILS", capId, inspId)) || 0;
    var hoursSpent = parseFloat(getCheckListCustomFieldValue("Hours Spent", "ES SERVICE DETAILS", capId, inspId)) || 0;

    // Initialize table rows
    var rows = [];
    var totalAmount = 0;

    // Add Yard Waste Removal row if applicable
    if (cubicYardsYard > 0) {
        var yardRow = {};
        yardRow["Fee Description"] = "Yard Waste Removal";
        yardRow["Multiplier"] = "50";
        yardRow["Quantity"] = String(cubicYardsYard);
        yardRow["Amount"] = String(cubicYardsYard * 50);
        totalAmount += cubicYardsYard * 50;
        rows.push(yardRow);
    }

    // Add Debris Removal row if applicable
    if (cubicYardsDebris > 0) {
        var debrisRow = {};
        debrisRow["Fee Description"] = "Debris Removal";
        debrisRow["Multiplier"] = "50";
        debrisRow["Quantity"] = String(cubicYardsDebris);
        debrisRow["Amount"] = String(cubicYardsDebris * 50);
        totalAmount += cubicYardsDebris * 50;
        rows.push(debrisRow);
    }

    // Add Labor row if applicable
    if (hoursSpent > 0) {
        var laborRow = {};
        laborRow["Fee Description"] = "Labor";
        laborRow["Multiplier"] = "60";
        laborRow["Quantity"] = String(hoursSpent);
        laborRow["Amount"] = String(hoursSpent * 60);
        totalAmount += hoursSpent * 60;
        rows.push(laborRow);
    }

    // Add Administrative Charge row
    var adminRow = {};
    adminRow["Fee Description"] = "Administrative Charge";
    adminRow["Multiplier"] = "200";
    adminRow["Quantity"] = "1";
    adminRow["Amount"] = "200";
    totalAmount += 200;
    rows.push(adminRow);

    // Update COURT COSTS table
    var tableName = "COURT COSTS";
    if (rows.length > 0) {
        addASITable(tableName, rows, capId);
        logDebug("COURT COSTS table updated with " + rows.length + " rows.");
    } 

    // Update total fees in the Fee tab as "Administrative Cost Fee"
    if (totalAmount > 0) {
        updateFee("CODE06","CODE_COMPLIANCE","FINAL",totalAmount,"N","Y");
    }

    // Set workflow task "Follow-Up Inspection" to "ES Work Order Complete"
    closeTask("Follow-Up Investigation", "ES Work Order Complete", "Set by script", "Updated via Inspection Result");
    editTaskDueDate("Collections",dateAdd(null,20));



} catch (err) {
    var emailAddress = "jshear@mytechsinc.com";
    aa.sendMail("no-reply@accela.com", emailAddress, "", "POST_ENFORCEMENT_ES_COMPLIANCE_INSPECTION_OUTCOME", err + debug + err.stack);
    logDebug("Error occurred: " + err);
}