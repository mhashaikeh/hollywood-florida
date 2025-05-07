/*------------------------------------------------------------------------------------------------------/
| Program        : POST_BUILDING_INSPECTION_RESULT.js
| Event          : STDBASE - Post Script
| Usage          : Update Renewal Expiration Date
| Created by     : JSHEAR 5/12/2024
/------------------------------------------------------------------------------------------------------*/

//Start All Insp but Finals - Everytime Inspection is Passed Extend Application Expiration Date 180 days
if (inspType.indexOf("Final") == -1) {
    vPermitObj = new licenseObject(null, capId);
    currentDate = new Date();
    var newExpDate = addDays(currentDate, 180);
    vPermitObj.setExpiration(dateAdd(newExpDate,0));
}
//End All Insp but Finals - Everytime Inspection is Passed Extend Application Expiration Date 180 days