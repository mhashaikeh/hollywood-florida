/*------------------------------------------------------------------------------------------------------/
| Program       : POST_ENFORCEMENT_COURT_COST_VALIDATION
| Event         : POST SCRIPT
| Usage         : Verify table entries are in place before workflow processing
| Created by    : JSHEAR 4/4/2025
| Last Edited   : 
/------------------------------------------------------------------------------------------------------*/

try{

    var courtCostsTable = loadASITable("COURT COSTS");
    var requiredFees = ["Field Inspections", "First-Class Mail", "Certified Mail", "Posting Service", "Case Processing"];
    var foundFees = [];
    var validationErrors = [];
    
    if (courtCostsTable && courtCostsTable.length > 0) {
        for (var rowIndex in courtCostsTable) {
            var thisRow = courtCostsTable[rowIndex];
            var feeDesc = thisRow["Fee Description"] ? String(thisRow["Fee Description"].fieldValue) : "";
            var multiplier = thisRow["Multiplier"] ? String(thisRow["Multiplier"].fieldValue) : "";
            var quantity = thisRow["Quantity"] ? String(thisRow["Quantity"].fieldValue) : "";
            var amount = thisRow["Amount"] ? String(thisRow["Amount"].fieldValue) : "";

			if (requiredFees.indexOf(feeDesc) != -1) {
				foundFees.push(feeDesc);
                     
	            // Validate Multiplier Quantity and Amount
	            if (!multiplier || multiplier == "") {
	                validationErrors.push("Need value for Multiplier field in " + feeDesc + " row.");
	            }
				if (!quantity || quantity == "") {
	                validationErrors.push("Need value for Quantity field in " + feeDesc + " row.");
	            }
	            if (!amount || amount == "") {
	                validationErrors.push("Need value for Amount field in " + feeDesc + " row.");
	            }
	        }
        }
        
        // Check for missing required Fee Descriptions
        for (var i in requiredFees) {
            var reqFee = requiredFees[i];
            if (foundFees.indexOf(reqFee) == -1) {
                validationErrors.push("Missing required Fee Description: " + reqFee);
            }
        }
        
        // Log validation results
        if (validationErrors.length > 0) {
            var errorMessage = "Error: COURT COSTS table validation failed:\n- " + validationErrors.join("\n- ");
            cancel = true; 
            showMessage = true;
            comment(errorMessage);
        } 
    } 

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "POST_ENFORCEMENT_COURT_COST_VALIDATION", err + debug + err.stack);
}
