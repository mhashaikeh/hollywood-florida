try{
    
    //Apply Processing Fee based upon Work Invloved
    var plumbingWork = AInfo["Plumbing Work Involved"];
    var electricalWork = AInfo["Electrical Work Involved"];
    var mechanicalWork = AInfo["Mechanical Work Involved"];
    var drivewayConstruction = AInfo["Driveway Construction Needed"];


    // Electrical fee check
    if (electricalWork == "Yes") {
        updateFee("BLD06", "BUILDING", "FINAL", 1, "Y");
    }

    // Plumbing fee check
    if (plumbingWork == "Yes") {
        updateFee("BLD05", "BUILDING", "FINAL", 1, "Y");
    }

    // Mechanical fee check
    if (mechanicalWork == "Yes") {
        updateFee("BLD03", "BUILDING", "FINAL", 1, "Y");
    }

    //Driveway Fee check
    if (drivewayConstruction == "Yes"){
        updateFee("ENG01", "ENGINEERING", "FINAL", 1, "Y");
    }

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ASA:Building/Commercial/Accessory/NA", err + debug + err.stack);
}
