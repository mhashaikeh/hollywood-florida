function addParcelDistrictGIS(service, layer, attribute, parcelNum) {

    if (isEmpty(getGISInfo(service, layer, attribute, -1, "feet")) == false) {
        var inspectionDistrict = getGISInfo(service, layer, attribute, -1, "feet");
        logDebug("GIS Returned District: " + inspectionDistrict);
        if (!matches(inspectionDistrict, null, "", "undefined")) {
            logDebug("Adding Inspection District " + inspectionDistrict + " to parcel " + parcelNum);
            addParcelDistrict(parcelNum, inspectionDistrict);
        }else{
            logDebug("No district found for parcel " + parcelNum + " in layer " + layer);
        }
    }
}