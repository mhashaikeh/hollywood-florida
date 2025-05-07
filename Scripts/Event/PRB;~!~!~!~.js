try {
    // MAS SF#01486146 - Stopped
    //Start: Verify that Master Permit is Issued before Issuing Sub-Permit
    /*if (!publicUser){
        if (appTypeArray[1] != "Amendment"){
            if (matches(capStatus,"Ready to Issue","Awaiting Payment")){
                if (AInfo['Is this application being submitted as a sub-permit to a master building permit'] == "Yes"){    
                    var pCapId = getParent();
                    if(pCapId){
                        var permitIssued = isTaskActiveByCapID("Inspection", pCapId);
                        if (!permitIssued){
                            showMessage = true;
                            cancel = true;
                            comment("The Master Permit must be in an issued status");
                        }
                    }
                }
            }
        }
    } */
    //End: Verify that Master Permit is Issued before Issuing Sub-Permit

} catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "PRB;~!~!~!~", err + debug + err.stack);
}