try{
    //Apply Post Issuance Doc Condition
    if (!appHasCondition("Permit", "Applied", "Special Inspector Final Letter Required", null)) {
        addStdCondition("Permit", "Special Inspector Final Letter Required");
    }
} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "CTRCA:Building/Antenna/NA/NA", err + debug + err.stack);
}