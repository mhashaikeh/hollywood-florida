//Start AltId Modification
try{

	if (!publicUser){

	  vLicenseID = getParent();
		vIDArray = String(vLicenseID).split("-");
		vLicenseID = aa.cap.getCapID(vIDArray[0], vIDArray[1], vIDArray[2]).getOutput();

	    if (vLicenseID != null) {
	        vLicenseAltId = vLicenseID.getCustomID();
	        cIds = getChildren("Fire/Amendment/Plans Change/NA", vLicenseID);

	        var amendNbr = "001"; // Default to "001" if no children are found
	        
			if (!matches(cIds, null, "", undefined)) {
				cIds = cIds.filter(function(childCap) {
					var childCapIdStr = String(childCap); // Convert the object to string
					return childCapIdStr.indexOf("EST") == -1;
				});
				cIdLen = Number(cIds.length);
				amendNbr = padWithZeroes((cIdLen + 1), 3); // Ensure three digits
			}
	        
	        var newAltId = vLicenseAltId + "-C" + amendNbr;
	        var resAltId = aa.cap.updateCapAltID(capId, newAltId);
	        
	        if (resAltId.getSuccess() == true) {
	            logDebug("Alt ID set to " + newAltId);
	        } else {
	            logDebug("Error updating Alt ID: " + resAltId.getErrorMessage());
	        }
	    }
	}
	
} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ASA:Fire/Amendment/NA/NA", err + debug + err.stack);
}
//End AltId Modification