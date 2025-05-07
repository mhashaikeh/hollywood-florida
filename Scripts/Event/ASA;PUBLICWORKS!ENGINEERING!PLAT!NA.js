try{
    //Apply Processing Fee based upon Request Type
    var requestType = AInfo["Request Type"];

    if (requestType == "New Plat"){
        updateFee("ENG21", "ENGINEERING", "FINAL", 1, "Y");
        updateFee("ENG05", "ENGINEERING", "FINAL", 1, "Y");
        //updateFee("PZ48", "PLANNING_ZONING", "FINAL", 1, "Y");
    }else{
        updateFee("ENG20", "ENGINEERING", "FINAL", 1, "Y");
        updateFee("ENG05", "ENGINEERING", "FINAL", 1, "Y");
        //if(requestType == "Plat Amendment" || requestType == "Lot Line/Subdivision"){
            //updateFee("PZ48", "PLANNING_ZONING", "FINAL", 1, "Y");
       // }
    }

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ASA:PublicWorks/Engineering/Plat/NA", err + debug + err.stack);
}
