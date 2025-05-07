try{
    logDebug("parentLic: " + parentCapId);

	var recordASIGroup = aa.appSpecificInfo.getByCapID(parentCapId);
	if (recordASIGroup.getSuccess()){
		var recordASIGroupArray = recordASIGroup.getOutput();
		
		for (i in recordASIGroupArray) {
			var group = recordASIGroupArray[i];
			var recordField = String(group.getCheckboxDesc());
			if (recordField){
				if (!matches(group.getChecklistComment(),null,undefined,"")){
					if (recordField.indexOf("Date") == -1){
						var newFieldValue = group.getChecklistComment();
						editAppSpecific(recordField,newFieldValue,capId);
						logDebug(recordField + "edited to: " + newFieldValue);
					}
				}
			}
		}
	}
} catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "POST_LICENSES_COPY_RECORD_DATA", err + debug + err.stack);
}