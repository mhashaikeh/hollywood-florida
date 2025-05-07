try{
    
    //Apply Processing Fee based upon Work Invloved
    var plumbingWork = AInfo["Plumbing Work Involved"];
    var electricalWork = AInfo["Electrical Work Involved"];
    var mechanicalWork = AInfo["Mechanical Work Involved"];
    var equipNeeded = AInfo['Will there be any electrical, lighting, heating, or cooking equipment in the structure?'];


    // Electrical fee check
    if (electricalWork == "Yes" || equipNeeded == "Yes") {
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

    if (!publicUser){
        //Edit App Name to include Structure Type
        editAppName(AInfo["Structure Type"]);
    }

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ASA:Building/Temporary Structure/NA/NA", err + debug + err.stack);
}
