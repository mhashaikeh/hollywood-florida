//Start: Apply Historic Condition to record
if (!publicUser) {
    if (appMatch("PublicWorks/Engineering/Driveway/NA")) {
        //Case 01481009 - start
        /*drivewayTable = loadASITable("DRIVEWAY DETAILS");
        if (drivewayTable && drivewayTable.length > 0) {
            for (var rowIndex in drivewayTable) {
                thisRow = drivewayTable[rowIndex];
                if (thisRow["Shape"].fieldValue == "Circular" && thisRow["Type of Work"].fieldValue != "New Driveway Construction") {
                    if (!appHasCondition("Record", "Applied", "Historic", null)) {
                        addStdCondition("Record", "Historic");
                    }
                }
                if (!matches(AInfo["Historic District Description"], null, undefined, "")) {
                    if (thisRow["Open Space Percentage"].fieldValue < 40) {
                        if (!appHasCondition("Record", "Applied", "Historic", null)) {
                            addStdCondition("Record", "Historic");
                        }
                    }
                }
            }
        }*/
        if (!matches(AInfo["Historic District Description"], null, undefined, "")) {
            if (!appHasCondition("Record", "Applied", "Historic", null)) {
                addStdCondition("Record", "Historic");
            }          
        }
         //Case 01481009 - end
        //Start: Apply Property Fees 
        if (AInfo["Type of Property"] == "Multi-Family") {
            updateFee('ENG02', 'ENGINEERING', 'FINAL', 1, 'N');
        }

        if (AInfo["Type of Property"] == "Single Family") {
            updateFee('ENG01', 'ENGINEERING', 'FINAL', 1, 'N');
        }
        //End: Apply Property Fees  
    }
    //End: Apply Historic Condition to record

    // Start Apply NOC Condition
    //MAS SF#01476344
    if (appMatch("PublicWorks/Utilities/Onsite Drainage/NA") || appMatch("PublicWorks/Engineering/Earthwork Clearing Grubbing/NA") || appMatch("PublicWorks/Engineering/Paving/NA")  || appMatch("PublicWorks/Utilities/Station/NA") || appMatch("PublicWorks/Engineering/Site Improvement/NA") || appMatch("PublicWorks/Engineering/Driveway/NA")) {
        var parcelInfo = ["*"];
        var parcelArrayValues = getGISInfo2multiAttribute("HOLLYWOOD", "Parcels", parcelInfo);
        if (parcelArrayValues) {
            var censusTract = parseFloat(parcelArrayValues.get("USE_CODE"));
            if (!matches(censusTract, 89, 86, 85, 73)) {
                var estCost = AInfo['Estimated Cost (Job Value)'];
                if (estCost > 5000) {
                    if (!appHasCondition("Record", "Applied", "Notice of Commencement Required", null)) {
                        addStdCondition("Record", "Notice of Commencement Required");
                    }
                }
            }
        }
    }
    //End Apply NOC Condition

    //Start: Apply Sub Permit Conditions and send customer email
    if (appMatch("PublicWorks/Utilities/Station/NA") || appMatch("PublicWorks/Engineering/Earthwork Clearing Grubbing/NA") || appMatch("PublicWorks/Engineering/Site Improvement/NA") || appMatch("PublicWorks/Engineering/Right of Way/NA")){
        var selectedConditions = [];
        if (appMatch("PublicWorks/Utilities/Station/NA")) {
            var stationConditions = {
                "Right of Way Permit Required": "Right of Way Permit Required",
                "Electrical Permit Required": "Electrical Permit Required"
            };

            for (var condition in stationConditions) {
                if (!appHasCondition("Sub-Permits", "Applied", stationConditions[condition], null)) {
                    addStdCondition("Sub-Permits", stationConditions[condition]);
                    selectedConditions.push(stationConditions[condition]);
                }
            }
        }
        
        if (appMatch("PublicWorks/Engineering/Site Improvement/NA") || appMatch("PublicWorks/Engineering/Right of Way/NA")) {
            if (appMatch("PublicWorks/Engineering/Site Improvement/NA")) {
                useAppSpecificGroupName = true;
                var conditionMapping = {
                    "SITE IMPROVEMENT SCOPE.Drainage": "Onsite Drainage Permit Required",
                    "SITE IMPROVEMENT SCOPE.Fire Service": "Fire Main Underground Permit Required",
                    "SITE IMPROVEMENT SCOPE.Private Sidewalk": "Private Sidewalk Permit Required",
                    // "Sanitary Sewer" and "Water" handled separately below
                    "SITE IMPROVEMENT SCOPE.Earthwork Clearing and Grubbing": "Earthwork, Clearing and Grubbing Permit Required",
                    "SITE IMPROVEMENT SCOPE.Paving": "Paving Permit Required",
                    "SITE IMPROVEMENT SCOPE.Pump/Lift Station": "Pump/Lift Station Permit Required",
                    "SITE IMPROVEMENT SCOPE.Tree Removal": "Tree Removal Permit Required"
                };

                // Process standard conditions from the mapping
                for (var fieldName in conditionMapping) {
                    var isChecked = getAppSpecific(fieldName);
                    if (isChecked == "CHECKED") {
                        var conditionName = conditionMapping[fieldName];
                        selectedConditions.push(conditionName);
                        if (!appHasCondition("Sub-Permits", "Applied", conditionName, null)) {
                            addStdCondition("Sub-Permits", conditionName);
                        }
                    }
                }

                // Handle Sanitary Sewer and Water separately
                var waterSewerCondition = "Water and Sewer Line Permit Required";
                var sanitarySewerChecked = getAppSpecific("SITE IMPROVEMENT SCOPE.Sanitary Sewer") == "CHECKED";
                var waterChecked = getAppSpecific("SITE IMPROVEMENT SCOPE.Water") == "CHECKED";
                var waterSewerPermitNeeded = sanitarySewerChecked || waterChecked;

                if (waterSewerPermitNeeded) {
                    selectedConditions.push(waterSewerCondition);
                    if (!appHasCondition("Sub-Permits", "Applied", waterSewerCondition, null)) {
                        addStdCondition("Sub-Permits", waterSewerCondition);
                    }
                }
            } else {
                var conditionMapping = {
                    "Landscaping": "Landscape Permit Required"
                };
                for (var fieldName in conditionMapping) {
                    var isChecked = getAppSpecific(fieldName);
                    if (isChecked == "CHECKED") {
                        var conditionName = conditionMapping[fieldName];
                        selectedConditions.push(conditionName);
                        if (!appHasCondition("Sub-Permits", "Applied", conditionName, null)) {
                            addStdCondition("Sub-Permits", conditionName);
                        }
                    }
                }
            }
            useAppSpecificGroupName = false;
            if (appMatch("PublicWorks/Engineering/Right of Way/NA")) {
                var trafficCondition = "Maintenance of Traffic Permit Required";
                if (!appHasCondition("Sub-Permits", "Applied", trafficCondition, null)) {
                    addStdCondition("Sub-Permits", trafficCondition);
                    selectedConditions.push(trafficCondition);
                }
            }
        }

        if (appMatch("PublicWorks/Engineering/Earthwork Clearing Grubbing/NA")) {
            if (AInfo['Tree Removal'] == "Yes"){
                if (!appHasCondition("Sub-Permits", "Applied", "Tree Removal Permit Required", null)) {
                    addStdCondition("Sub-Permits", "Tree Removal Permit Required");
                    selectedConditions.push("Tree Removal Permit Required");
                }
            }
        }
        
        if (selectedConditions.length > 0) {
            var conditionType = selectedConditions.join(", "); // Separate by commas
            var priContact = getContactObj(capId, "Applicant");
            if (priContact) {
                var eParams = aa.util.newHashtable();
                addParameter(eParams, "$$altId$$", capId.getCustomID());
                addParameter(eParams, "$$contactFirstName$$", priContact.capContact.firstName);
                addParameter(eParams, "$$contactLastName$$", priContact.capContact.lastName);
                addParameter(eParams, "$$conditionName$$", conditionType); // Add the concatenated conditions
                var rFiles = [];
                var priEmail = "" + priContact.capContact.getEmail();
                sendNotification("Accela@HollywoodFl.org", priEmail, "", "SS_SUB_PERMIT_REQUIRED", eParams, rFiles, capId);
            }
        }
    }
    //End: Apply Sub Permit Conditions and send customer email

    //Start: Apply Pre-Condition Checklist Condition
    if (appMatch("PublicWorks/Engineering/Right of Way/NA")){
        if (AInfo['Critical Location'] == "Yes"){
            if (!appHasCondition("Record", "Applied", "Pre-Construction Meeting", null)) {
                addStdCondition("Record", "Pre-Construction Meeting");
            }
        }
    }
    //End: Apply Pre-Condition Checklist Condition

    //Start: Add Inspection District
    //setGISDistricts2(capId, "Code Districts", true);
    setGISDistricts3(capId,true); //Case 01481428
    //End: Add Inspection District

    //Start Apply Parent to Sub-Permit
    if (!matches(AInfo["Master Building Permit Number"], null, "", "undefined")) {
        addParent(AInfo["Master Building Permit Number"]);
    }
    //End Apply Parent to Sub-Permit
}

if (appMatch("PublicWorks/Engineering/Sidewalk Cafe/NA") || appMatch("PublicWorks/Engineering/Sidewalk Cafe/Renewal")){
    updateFee("ENG15", "ENGINEERING", "FINAL", 1, "Y");
}