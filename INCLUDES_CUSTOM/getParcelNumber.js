function getParcelNumber(itemId) {
    var capParcelResult = aa.parcel.getParcelandAttribute(itemId, null);
    if (capParcelResult.getSuccess()) {
        var Parcels = capParcelResult.getOutput().toArray();
        if (Parcels.length > 0) {
            return Parcels[0].getParcelNumber();
        }
    }
    return false;
}