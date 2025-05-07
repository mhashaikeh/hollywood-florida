
try {
    //Apply Renewal Fee
	var hasFee = feeExists("TRSRY01");
	if(!hasFee) {
    	addFee("TRSRY01", "TREASURY", "FINAL", 1, "Y");
    }
        
}	catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ASA:Enforcement/Permit/Dog/Renewal", err + debug + err.stack);
}
