function checkMechBldValueAndApplyCond(){
    var jobValue = parseFloat(AInfo['Estimated Cost (Job Value)']);
    var revValue = parseFloat(AInfo['Reviewer Valuation']); 
    if (!matches(revValue,null,undefined,"")){ 
        var parcelInfo =  ["*"];
        var parcelArrayValues = getGISInfo2multiAttribute("HOLLYWOOD", "Parcels", parcelInfo);

        // Ensure we have the parcel value
        if (parcelArrayValues && parcelArrayValues.get("JUST_BUILDING_VALUE")) {
            var bldValue = parseFloat(parcelArrayValues.get("JUST_BUILDING_VALUE"));
            logDebug("bldValue: " + bldValue);
            
            // Determine the greater value between jobValue and revValue
            var greaterValue = (jobValue > revValue) ? jobValue : revValue;
            
            // Calculate 30% of bldValue
            var thirtyPercentOfBldValue = bldValue * 0.3;
            logDebug ("greaterValue: " + greaterValue + " thirtyPercentOfBldValue: " + thirtyPercentOfBldValue)
            
            // Compare the greater value with 30% of bldValue
            if (Number(greaterValue) > Number(thirtyPercentOfBldValue)) {
                if (!appHasCondition("Permit", "Applied", "EPL Display Card Required", null)) {
                    addStdCondition("Permit", "EPL Display Card Required");
                }
            }
        }
    }
}