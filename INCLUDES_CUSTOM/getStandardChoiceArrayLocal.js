function getStandardChoiceArrayLocal(stdChoice) {
    var cntItems = 0;
    var stdChoiceArray = [];
    var bizDomScriptResult = aa.bizDomain.getBizDomain(stdChoice);
    if (bizDomScriptResult.getSuccess()) {
        var bizDomScriptObj = bizDomScriptResult.getOutput();
        if (bizDomScriptObj != null) {
            cntItems = bizDomScriptObj.size();
            logDebug("getStdChoiceArray: " + stdChoice + " size = " + cntItems);
            if (cntItems > 0) {
                var bizDomScriptItr = bizDomScriptObj.iterator();
                while (bizDomScriptItr.hasNext()) {
                    var bizBomScriptItem = bizDomScriptItr.next();
                    var stdChoiceArrayItem = {
                        "value": bizBomScriptItem.getBizdomainValue() || "",
                        "valueDesc": bizBomScriptItem.getDescription() || "",
                        "active": bizBomScriptItem.getAuditStatus() || "Unknown"
                    };
                    stdChoiceArray.push(stdChoiceArrayItem);
                }
            } else {
                logDebug("getStdChoiceArray: WARNING stdChoice " + stdChoice + " don't have items or items disabled.");
            }
        } else {
            logDebug("getStdChoiceArray: WARNING stdChoice " + stdChoice + " is not found");
        }
    } else {
        logDebug("**ERROR: getting standard choice " + stdChoice + " :" + bizDomScriptResult.getErrorMessage());
    }
    return stdChoiceArray;
}