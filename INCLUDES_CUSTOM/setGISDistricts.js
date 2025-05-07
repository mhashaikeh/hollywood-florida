function setGISDistricts(capId, disciplineValue, usePrimary) {
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
                addParcelDistrictGIS("HOLLYWOOD", disciplineValue, "zoneName", parcelNum);
            }
        }
    }
    catch (err) {
        logDebug("An error occurred setting parcel district for auto assign of inspections: " + err.message);
        logDebug(err.stack);
    }
}