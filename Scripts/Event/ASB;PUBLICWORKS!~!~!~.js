try{
    if (!publicUser){        
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
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ASB:PUBLICWORKS/*/*/*", err + debug + err.stack);
}