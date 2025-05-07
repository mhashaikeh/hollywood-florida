
try {
    if (!publicUser) {
        // Get parent record using Violation Number
        var parentAltId = AInfo["Violation Number"];
        var parentCapId = getApplication(parentAltId);
        addParent(parentAltId);
        
        if (parentCapId) {
            // Load the Mailed Letter Tracking table from parent
            var mailedLetterTable = loadASITable("LETTERS", parentCapId);
            
            if (mailedLetterTable && mailedLetterTable.length > 0) {
                var lastDateSent = null;
                var lastTrackingNumber = null;
                var lastTrackingStatus = null;
                
                // Loop through table rows to find the last 'Dangerous Dog Packet'
                for (var x in mailedLetterTable) {
                    var row = mailedLetterTable[x];
                    if (row["Letter Type"] && row["Letter Type"].toString().toUpperCase() == "DANGEROUS DOG PACKET") {
                        lastDateSent = row["Date Sent"] ? row["Date Sent"].toString() : "";
                        lastTrackingNumber = row["Certified Mail Tracking Number"] ? row["Certified Mail Tracking Number"].toString() : "";
                        lastTrackingStatus = row["Certified Mail Tracking Status"] ? row["Certified Mail Tracking Status"].toString() : "";
                    }
                }
                
                // Update the child record
                if (lastDateSent != null) {
                    editAppSpecific("Dangerous Dog Notice Sent", lastDateSent, capId);
                    editAppSpecific("Certified Mail Tracking Number", lastTrackingNumber, capId);
                    editAppSpecific("Certified Mail Tracking Status", lastTrackingStatus, capId);
                    logDebug("Successfully copied last Dangerous Dog Packet info to child record");
                } else {
                    logDebug("No 'Dangerous Dog Packet' entries found in Mailed Letter Tracking table");
                }
            } else {
                logDebug("Could not retrieve Mailed Letter Tracking table from parent or table is empty");
            }
        } else {
            logDebug("Error: No parent record found for License Number: " + parentAltId);
        }
        
        var breed = AInfo["Breed"] || "";
        var dogName = AInfo["Dog's Name"] || "";
        if (breed || dogName) {
            editAppName(breed + (breed && dogName ? ", " : "") + dogName);
        }
    }

    // Apply Fee
    var currentDate = new Date();
    var currentMonth = currentDate.getMonth(); // 0-11 (January is 0)
    var currentDay = currentDate.getDate();
    
    // Define date boundaries (month is 0-based)
    var aprilFirst = new Date(currentDate.getFullYear(), 3, 1);  // April 1st
    var octoberFirst = new Date(currentDate.getFullYear(), 9, 1); // October 1st
    
    // Default fee code
    var feeCode = "TRSRY01";
    
    // Check if current date is between April 1st and October 1st
    if (currentDate >= aprilFirst && currentDate < octoberFirst) {
        feeCode = "TRSRY02";
    }
    
	var hasFee = feeExists(feeCode);
	if(!hasFee) {
    	addFee(feeCode, "TREASURY", "FINAL", 1, "Y");
    }
        
}	catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ASA:Enforcement/Permit/Dog/NA", err + debug + err.stack);
}
