/*------------------------------------------------------------------------------------------------------/
| Program        : POST_PERMIT_ISSUANCE.js
| Event          : STDBASE - Post Script
| Usage          : Update Renewal Expiration Date
| Created by     : JSHEAR 5/12/2024
/------------------------------------------------------------------------------------------------------*/

//Start Set Renewal Exp Date - Set Expiration Date 180 days from Date of Issuance
if (wfStatus == "Issued"){
    vPermitObj = new licenseObject(null, capId);
    if (appMatch("PublicWorks/Engineering/MOT/NA")){
        newExpDate = new Date(AInfo['Approved MOT End Date']);
    }else{
        currentDate = new Date();
        newExpDate = addDays(currentDate, 180);
    }
    vPermitObj.setExpiration(dateAdd(newExpDate,0));
    vPermitObj.setStatus("Active");
}
//End Set Renewal Exp Date - Set Expiration Date 180 days from Date of Issuance