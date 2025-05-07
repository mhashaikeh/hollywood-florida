/*------------------------------------------------------------------------------------------------------/
| Program        : POST_DDOG_ISSUANCE.js
| Event          : STDBASE - Post Script
| Usage          : Update Renewal Expiration Date
| Created by     : JSHEAR 2/27/2025
| Modified       : 
/------------------------------------------------------------------------------------------------------*/

if (wfStatus == "Issued"){
    vPermitObj = new licenseObject(null, capId);
    
    // Get current date
    var currentDate = new Date();
    
    // Set Issued Date custom field to current date
    editAppSpecific("Issued Date", dateAdd(null, 0, "MM/dd/yyyy"));
    
    // Determine expiration date (9/30 of current or next year)
    var currentYear = currentDate.getFullYear();
    var expDate = new Date(currentYear, 8, 30); // Month is 0-based, so 8 = September
    
    // If current date is past 9/30, use next year
    if (currentDate > expDate) {
        expDate.setFullYear(currentYear + 1);
    }
    
    
    vPermitObj.setExpiration(dateAdd(expDate, 0));
    vPermitObj.setStatus("Active");
}
