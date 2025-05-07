try{
    // Start Apply NOC Condition
    var parcelInfo =  ["*"];
    var parcelArrayValues = getGISInfo2multiAttribute("HOLLYWOOD", "Parcels", parcelInfo);
    if (parcelArrayValues){
        var censusTract = parseFloat(parcelArrayValues.get("USE_CODE"));
        if (!matches(censusTract,89,86,85,73)){
            var estCost = AInfo['Estimated Cost (Job Value)'];
            if (estCost > 5000) {
                if (!appHasCondition("Record", "Applied", "Notice of Commencement Required", null)) {
                    addStdCondition("Record", "Notice of Commencement Required");
                }
            }
        }
    }
    //End Apply NOC Condition

    //Start Apply Parent to Sub-Permit
    if(!matches(AInfo["Master Building Permit Number"],null,"", "undefined")){
        addParent(AInfo["Master Building Permit Number"]);
    }
    //End Apply Parent to Sub-Permit

    //Start: Apply License Number Validation
    if (!appHasCondition("Fire Protection", "Applied", "Manual License Number and Expiration Validation Required", null)) {
        addStdCondition("Fire Protection", "Manual License Number and Expiration Validation Required");
    }
    //End: Apply License Number Validation

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "CTRCA;FIRE!PERMIT!~!~", err + debug + err.stack);
}
