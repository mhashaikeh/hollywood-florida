try{
    
    //Apply Processing Fee based upon Work Invloved
    var gazeboPlumbingWork = AInfo["Plumbing Work Involved - Gazebo"];
    var gazeboElectricalWork = AInfo["Electrical Work Involved - Gazebo"];
    var shedPlumbingWork = AInfo["Plumbing Work Involved - Shed"];
    var shedElectricalWork = AInfo["Electrical Work Involved - Shed"];
    var shedMechanicalWork = AInfo["Mechanical Work Involved - Shed"];
    var trellisElectricalWork = AInfo["Electrical Work Involved - Trellis"];
    var trellisPlumbingWork = AInfo["Plumbing Work Involved - Trellis"];
    var garagePlumbingWork = AInfo["Plumbing Work Involved - Garage"];
    var garageMechanicalWork = AInfo["Mechanical Work Involved - Garage"];
    var garageElectricalWork = AInfo["Electrical Work Involved - Garage"];


    // Electrical fee check
    if (gazeboElectricalWork == "Yes" || shedElectricalWork == "Yes" || trellisElectricalWork == "Yes" || garageElectricalWork == "Yes") {
        updateFee("BLD06", "BUILDING", "FINAL", 1, "Y");
    }

    // Plumbing fee check
    if (gazeboPlumbingWork == "Yes" || shedPlumbingWork == "Yes" || trellisPlumbingWork == "Yes" || garagePlumbingWork == "Yes") {
        updateFee("BLD05", "BUILDING", "FINAL", 1, "Y");
    }

    // Mechanical fee check
    if (shedMechanicalWork == "Yes" || garageMechanicalWork == "Yes") {
        updateFee("BLD03", "BUILDING", "FINAL", 1, "Y");
    }

    if (!publicUser){
        //Start: Add Docs Needed Prior to Final Inspection Conditions
        var patioMaterial = AInfo['Patio Material'];
        var deckMaterial = AInfo['Deck Material'];
        var deckLocation = AInfo['Deck Located within 1 Foot of Dwelling'];
        var patioLocation = AInfo['Patio Located within 1 Foot of Dwelling'];

        if (patioMaterial  == "Concrete" || deckMaterial == "Concrete"){
            if (!appHasCondition("Permit", "Applied", "Concrete Compaction Required", null)) {
                addStdCondition("Permit", "Concrete Compaction Required");
            }
        }

        if (deckLocation  == "Yes" || patioLocation == "Yes"){
            if (!appHasCondition("Permit", "Applied", "Proof of Subterranean Termite Treatment Required", null)) {
                addStdCondition("Permit", "Proof of Subterranean Termite Treatment Required");
            }
        }
        //End: Add Docs Needed Prior to Final Inspection Conditions
    }

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ASA:Building/Commercial/Accessory/NA", err + debug + err.stack);
}
