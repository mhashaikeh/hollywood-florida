try {
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
  
}	catch (err) {
var emailAddress = "jshear@mytechsinc.com"; //email to send report
aa.sendMail("no-reply@accela.com", emailAddress, "", "CTRCA:Enforcement/Permit/Dog/NA", err + debug + err.stack);
}

