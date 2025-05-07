/*------------------------------------------------------------------------------------------------------/
| Program       : POST_ENFORCEMENT_EXTENSION_GRANTED
| Event         : POST SCRIPT
| Usage         : Apply correct Exetnsion Granted Fee based upon times granted
| Created by    : JSHEAR 4/4/2025
| Last Edited   : 
/------------------------------------------------------------------------------------------------------*/

try {

    if (wfTask == "Hearing" && wfStatus == "Extension Granted") {

        var feeCode1 = "CODE01"; 
        var feeCode2 = "CODE02"; 
        var feeCode3 = "CODE03"; 
        var hasCode01 = false;
        var hasCode02 = false;

        var feeResult = aa.fee.getFeeItems(capId, null, null);
        if (feeResult.getSuccess()) {
            var feeList = feeResult.getOutput();
            for (var i in feeList) {
                var feeCode = feeList[i].getFeeCod();
                var feeStatus = feeList[i].feeitemStatus; 
                if (feeStatus != "VOIDED" || feeStatus != "CREDITED") { 
                    if (feeCode == feeCode1) {
                        hasCode01 = true;
                    } else if (feeCode == feeCode2) {
                        hasCode02 = true;
                    }
                }
            }
        } else {
            logDebug("Error retrieving fee list: " + feeResult.getErrorMessage());
        }
        
        var feeCode = "";  
        if (!hasCode01) {
            feeCode = feeCode1;
        } else if (hasCode01 && !hasCode02) {
            feeCode = feeCode2;
        } else if (hasCode02) {
            feeCode = feeCode3;
        }
        
        // Add the fee to the record
        if (feeCode != "") {
            addFee(feeCode, "CODE_COMPLIANCE", "FINAL", 1, "Y");
        }
    }
} catch (err) {
    var emailAddress = "jshear@mytechsinc.com";
    aa.sendMail("no-reply@accela.com", emailAddress, "", "POST_ENFORCEMENT_EXTENSION_GRANTED", err + debug + err.stack);
    logDebug("Error occurred: " + err);
}