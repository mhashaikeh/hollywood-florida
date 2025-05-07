try{

    if (!publicUser){
        //Start: Check For LP if Owner is not Builder
        if (AInfo['Owner as Builder'] == "No"){
            var LPModelList = aa.env.getValue("LicProfList");
            if (LPModelList == ""){
                cancel = true;
                showMessage = true;
                comment("You must have 1 Licensed Professional contact type added.");
            }
        }
        //End: Check For LP if Owner is not Builder

        //Start: Parcel Validation 
        if (appMatch("Building/Fence/NA/NA")){
            
            var fenceMaterial = AInfo['Fence Material'];
            var typeOfProperty = AInfo['Type of Property'];
            var locOfFence = AInfo['Location of Fence'];
            var recField = AInfo['Does the fence surround a recreational field or park?'];

            if (matches(fenceMaterial,"Chain Link","PVC")){

                var ParcelValidatedNumber = getParcelNumber(capId);

                var zoneTOC = getGISInfo2ASB("HOLLYWOOD", "TOC", "LANDUSECODE");
                var zoneRAC = getGISInfo2ASB("HOLLYWOOD", "RAC", "LANDUSECODE");
                var zoneHist = getGISInfo2ASB("HOLLYWOOD", "HISTORIC DISTRICT", "DESCRIPTION");

                if (fenceMaterial == "Chain Link"){
                    if (typeOfProperty == "Commercial" && locOfFence == "Front"){
                        if (zoneTOC == "TOC"){
                            showMessage = true;
                            cancel = true;
                            comment("Fence is not permitted in a TOC for the type of property and location listed");
                        }
                    }

                    if (recField == "No"){
                        if (!matches(zoneHist,null,undefined,"")){
                            showMessage = true;
                            cancel = true;
                            comment("Fence is not permitted in Historic District when not surrounding a recreational field or Park");
                        }
                    }
                 
                    if (zoneRAC == "RAC"){
                        showMessage = true;
                        cancel = true;
                        comment("Chain Link Fence is not permitted in a RAC");
                    }
                }

                if (fenceMaterial == "PVC" && locOfFence == "Front"){
                    if (!matches(zoneHist,null,undefined,"")){
                        showMessage = true;
                        cancel = true;
                        comment("PVC Fence is not permitted in in front when within Historic District");
                    }
                }
            }
        }
        if (appMatch("Building/Roofing/NA/NA")){
            var ParcelValidatedNumber = getParcelNumber(capId);
            var zoneHist = getGISInfo2ASB("HOLLYWOOD", "HISTORIC DISTRICT", "DESCRIPTION");
            if (!matches(zoneHist,null,undefined,"")){
                if(matches(AInfo["Existing Roof Type"],"Metal Roof","Concrete or Clay Tile")){
                    if(AInfo["Roof System"] == "Asphalt Shingles" || AInfo["Shingle"] == "Yes"){
                        showMessage = true;
                        cancel = true;
                        comment("Can not Downgrade roof in historic District");
                    }
                }
            }
        }
        if (appMatch("Building/Commercial/Demolition/NA")){
            if (AInfo['Scope of Demolition'] == "Complete Building Demolition"){
                var ParcelValidatedNumber = capModel.getParcelModel().getParcelNo();
                var zoneHist = getGISInfo2ASB("HOLLYWOOD", "HISTORIC DISTRICT", "DESCRIPTION");
                if (!matches(zoneHist,null,undefined,"")){
                    showMessage = true;
                    cancel = true;
                    comment("Complete Building Demolition within a Historical District must be submitted via BCLA.  For additional assistance please contact the Building Division at 954-921-3335.");
                }
            }
        }
        //Start: Verify Folio Numbers match between sub and master
        if (appTypeArray[1] != "Amendment"){
            if (!matches(AInfo["Master Building Permit Number"],null,undefined,"")){
                pCapId = getApplication(AInfo["Master Building Permit Number"]);
                var capFolio = String(aa.env.getValue("ParcelValidatedNumber"));
                var pCapFolio = String(getParcelNumber(pCapId));
                if (capFolio != pCapFolio){
                    showMessage = true;
                    cancel = true;
                    comment("Folio number mismatch: The Folio number on the parent record does not match the one provided for this record.");
                }
            }
        }
    }
} catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ASB:BUILDING/FENCE/NA/NA", err + debug + err.stack);
}
