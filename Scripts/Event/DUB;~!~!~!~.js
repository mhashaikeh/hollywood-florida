/*Removed as per EPH Request
//check if document should be uploadable

	var documentModels = documentModelArray.toArray();
	var err = 0;

	var documentModel = null;
	var fileName = null;
	var fileNameExtensionDtls = null;
	var extension = null;
	
	for (i = 0; i < documentModels.length; i++) {
		documentModel = documentModels[i];
		fileName = documentModel.getFileName();
		fileName = String(fileName);
		
		if (fileName.indexOf('.') > -1){
			fileNameExtensionDtls = fileName.substring(fileName.lastIndexOf(".")+1);
			extension = fileNameExtensionDtls.toLowerCase();
			var extAllowed =  lookup("AA_EDMS_ALLOWED_FILE_TYPES","ALLOWED_FILE_TYPES");
			extArray = String(extAllowed).split(",");
			if(extArray.indexOf(extension) < 0){
				cancel = true;		
				showMessage = true;
				comment("We accept the following file types for upload: " + extArray.join('; ') + ".");	
			}
		}else{
			cancel = true;		
			showMessage = true;
			comment("In order to upload file extension must be displayed");
		}
	}
	
	function lookup(stdChoice, stdValue) {
		var strControl = null;          // RS 8/25/2015 Modified to return NULL if value is not found.
		var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice, stdValue);

		if (bizDomScriptResult.getSuccess()) {
			var bizDomScriptObj = bizDomScriptResult.getOutput();
			strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
			logDebug("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
		}
		else {
			logDebug("lookup(" + stdChoice + "," + stdValue + ") does not exist");
		}
		return strControl;
	}	
		
*/

