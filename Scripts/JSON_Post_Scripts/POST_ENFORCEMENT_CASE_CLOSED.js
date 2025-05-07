/*------------------------------------------------------------------------------------------------------/
| Program		: POST_ENFORCEMENT_CASE_CLOSED
| Event		    : POST SCRIPT
| Usage		    : When case is closed remove the parcel condition
|                Enforcement/Case/~/~
|
| Created by	: JSHEAR 4/7/2025
/------------------------------------------------------------------------------------------------------*/

try {

    var primaryAddress = aa.address.getPrimaryAddressByCapID(capId, "Y");

    if (primaryAddress.getSuccess()) {
        var refAddress = primaryAddress.getOutput();
        var refID = refAddress.getRefAddressId();
        // logDebug("Primary Address is " + refAddress);
        logDebug("Ref Address ID is " + refID);
    }

    if (refID) {
        var refAddrConds = aa.addressCondition.getAddressConditions(refID);
        refAddrConds = refAddrConds.getOutput().length;
        logDebug("Condition Count is: " + refAddrConds);
        //logDebug("Condition Count is: " + parcelCondtionCount);

        //If condition exists on parcel remove it
        if (refAddrConds > 0) {
            var compNumber = getAppSpecific("Complaint Number");
            if (!matches(compNumber,null,undefined,"")){
                var pCapId = getApplication(compNumber);
                var outCome = getInitialInspOutcomeFieldValue(pCapId);
            }else{
                var outCome = getInitialInspOutcomeFieldValue(capId);
            }
            removeAddressCondition(String(outCome));
        } else {
            logDebug("No condition on this Address " + refID);
        }
    }

} catch (err) {
    var emailAddress = "spatterson@accela.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "POST_ENFORCEMENT_CASE_CLOSED", err + debug + err.stack);
}