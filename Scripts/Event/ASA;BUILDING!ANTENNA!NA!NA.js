try{
    
    //Apply Processing Fee based Power Source
    var powerSource = AInfo["Power source of generator"];

    //Structural, Zoning and Electrical fee check
    updateFee("PZ48", "PLANNING_ZONING", "FINAL", 1, "Y");
    updateFee("BLD04", "BUILDING", "FINAL", 1, "Y");
    updateFee("BLD06", "BUILDING", "FINAL", 1, "Y");


    // Plumbing fee check
    if (powerSource == "Gas") {
        updateFee("BLD05", "BUILDING", "FINAL", 1, "Y");
    }

   if (!publicUser){
       //Apply Post Issuance Doc Condition
        if (!appHasCondition("Permit", "Applied", "Special Inspector Final Letter Required", null)) {
            addStdCondition("Permit", "Special Inspector Final Letter Required");
        }
   }


} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ASA:Building/Commercial/Accessory/NA", err + debug + err.stack);
}
