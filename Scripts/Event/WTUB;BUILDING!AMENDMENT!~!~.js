if (wfStatus == "Evaluate New Value"){
    var revValue = getAppSpecific("Reviewer Valuation");
    if (matches(revValue, null, undefined, "")) {  
        showMessage = true;
        cancel = true;
        comment("Reviewer Valuation must be populated");
    }
}
