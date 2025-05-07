/*------------------------------------------------------------------------------------------------------/
| Program        : POST_PUBLICWORKS_INSPECTION_RESULT.js
| Event          : STDBASE - Post Script
| Usage          : Update Renewal Expiration Date
| Created by     : JSHEAR 5/12/2024
/------------------------------------------------------------------------------------------------------*/

//Start All Insp but Finals - Everytime Inspection is Passed Extend Application Expiration Date 180 days

var finalInspections = [
    { type: "Final Drainage Inspection", record: "Onsite Drainage" },
    { type: "Final Utilities Inspection", record: "Station" },
    { type: "Engineering Final Inspection", record: "Site Improvement" },
    { type: "Engineering Final Inspection", record: "Earthwork Clearing Grubbing" },
    { type: "Engineering Final Inspection", record: "Right of Way" },

];

// Check if the inspection is not a final inspection
var isNotFinalInspection = true;
for (var i = 0; i < finalInspections.length; i++) {
    var final = finalInspections[i];
    if (inspType == final.type && appTypeArray[2] == final.record) {
        isNotFinalInspection = false;
        break;
    }
}

if (isNotFinalInspection) {
    vPermitObj = new licenseObject(null, capId);
    currentDate = new Date();
    var newExpDate = addDays(currentDate, 180);
    vPermitObj.setExpiration(dateAdd(newExpDate,0));
}
//End All Insp but Finals - Everytime Inspection is Passed Extend Application Expiration Date 180 days