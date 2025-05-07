function setGISDistricts2(capId, disciplineValue, usePrimary) {
    try {
        var capParcelResult = aa.parcel.getParcelandAttribute(capId, null);
        var Parcels = capParcelResult.getOutput().toArray();
        for (var p in Parcels) {
            if (usePrimary) {
                var isPrimary = false;
                if (Parcels[p].getPrimaryParcelFlag() == "Y") isPrimary = true;
            } else {
                var isPrimary = true;
            }
            if (isPrimary) {
                var parcelNum = Parcels[p].getParcelNumber();
                var codeFields =  ["*"];
                var codeDistricts = getGISInfo2multiAttribute("HOLLYWOOD", "Code Districts", codeFields);
                if (codeDistricts) {
                    var inspectionDistrict = (codeDistricts.get("ZoneName"));
                    if(!matches(inspectionDistrict,null,undefined,"")){
                        addParcelDistrict(parcelNum, inspectionDistrict);
                    }else{
                        logDebug("Inspection District not Found");
                    }
                }
            }
        }
    }
    catch (err) {
        logDebug("An error occurred setting parcel district for auto assign of inspections: " + err.message);
        logDebug(err.stack);
    }
}