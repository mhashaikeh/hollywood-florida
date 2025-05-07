function getStandardChoiceArray(stdChoice) {	
	var cntItems = 0;
	var stdChoiceArray = new Array();
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
					var stdChoiceArrayItem = new Array();
					stdChoiceArrayItem["value"] = bizBomScriptItem.getBizdomainValue();
					stdChoiceArrayItem["valueDesc"] = bizBomScriptItem.getDescription();
					stdChoiceArrayItem["active"] = bizBomScriptItem.getAuditStatus();
					stdChoiceArray.push(stdChoiceArrayItem);
				}
			}
			else
			{
				logDebug("getStdChoiceArray: WARNING stdChoice "+stdChoice +" does not have items or items disabled.");
			}
		} else {
			logDebug("getStdChoiceArray: WARNING stdChoice "+stdChoice +" is not found"  );
		}
	}
	else
	{
		logDebug("**ERROR: getting standard choice " + stdChoice + " :" + bizDomScriptResult.getErrorMessage());
	}
	return stdChoiceArray;
}