function setGISDistricts3(capId, usePrimary) {
    try {
		var layerList = ["Code Districts","Electrical Zones","Engineering Zones","Fire Zones","Mechanical Zones","Planning Zones","Plumbing Zones",	"Structural Zones","Utilities Zones"];
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
				for(var m in layerList){
					var parcelNum = Parcels[p].getParcelNumber();
					var codeFields =  ["*"];
					var codeDistricts = getGISInfo2multiAttribute("HOLLYWOOD", layerList[m], codeFields);
					if (codeDistricts) {
                        var inspectionDistrict = (codeDistricts.get("zone_name"));
                        if(layerList[m] == "Code Districts"){
						    inspectionDistrict = (codeDistricts.get("ZoneName"));
                        }
						aa.print("inspectionDistrict: " + inspectionDistrict)
						if(!matches(inspectionDistrict,null,undefined,"")){
							addParcelDistrict(parcelNum, inspectionDistrict);
						}else{
							logDebug("Inspection District not Found");
						}
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