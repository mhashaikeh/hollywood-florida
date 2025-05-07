/*------------------------------------------------------------------------------------------------------/
| Program        : POST_INSPECTION_FAILED_FEE.js
| Event          : STDBASE - Post Script
| Usage          : Update Renewal Expiration Date
| Created by     : JSHEAR 5/12/2024
/------------------------------------------------------------------------------------------------------*/

//Start: Apply Failed Fee
if (inspResult == "Failed - Fee"){
    var failedFee = "";
    failedFee = addFee('BLD16', 'BUILDING', 'FINAL', 1, 'Y');
    editFeeComment(failedFee,inspType);
}
//End: Apply Failed Fee