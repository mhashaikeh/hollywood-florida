/*-------------------------------------------------------------------------------------------------------------/
| Program		: getGISInfo2multiAttribute.js
| Usage			: Returns an array of attributes from a layer in GIS with proximity parameters 
| Created by	: JSCHULER
| Created at	: 6/13/2023
| Parameters : 
|	svc: Text - GIS service name, usually found on the map
|	layer: Text - GIS layer name, found in GIS map layers list
|	attributenameArray: Array GIS field names value to be returned
|   Example: getGISInfo2multiAttribute("SANDIEGO", "Community Plan", ["AgreemntID", "StartDate", "EndDate"]);
/--------------------------------------------------------------------------------------------------------------*/

function getGISInfo2multiAttribute(svc, layer, attributenameArray){
	try	{
		var numDistance = -5;
		var distanceType = "feet";

		var bufferTargetResult = aa.gis.getGISType(svc, layer); // get the buffer target
		var buf;
		if(bufferTargetResult.getSuccess())	{
			buf = bufferTargetResult.getOutput();

			for(var atta in attributenameArray)	{
				buf.addAttributeName(attributenameArray[atta]);
			}
		} else {
			logDebug("<br><font color=red>**ERROR: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage() + "</font><br>");
			return false;
		}

		var gisObjResult = aa.gis.getCapGISObjects(capId); 
		var fGisObj;
		if(gisObjResult.getSuccess()) {
			fGisObj = gisObjResult.getOutput();
			if(!fGisObj || !fGisObj[0] || fGisObj.length == 0) {
				return false;
			}
		} else {
			logDebug("<br><font color=red>**ERROR: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage() + "</font><br>");
			return false;
		}

		var gisattr = aa.util.newHashMap();
		var bufchk = aa.gis.getBufferByRadius(fGisObj[0], numDistance, distanceType, buf);

		if(bufchk.getSuccess())	{
			var proxArr = bufchk.getOutput();
			var gisObjArray = proxArr[0].getGISObjects();
				
			if(gisObjArray && gisObjArray[0] != undefined && gisObjArray[0] != null) {
				var attrnames = gisObjArray[0].getAttributeNames();
				var attrvalues = gisObjArray[0].attributeValues;

				if(attrnames && attrvalues && attrnames.length > 0 && attrvalues.length > 0 && attrnames.length == attrvalues.length) {
					for(var att in attrnames) {
						gisattr.put(attrnames[att], attrvalues[att]);
					}
				}
				return gisattr;
			} else {
				logDebug("<br><font color=red>**WARNING: Retrieving Buffer Check Results.  Missing template field on service</font><br>");
				return false;
			}
		} else {
			showMessage = true;
			logMessage("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage());
			return false;
		}
	} catch(err) {
		logDebug("<br><font color=red>A JavaScript Error occurred: function getGISInfo2multiAttribute: " + err.message + "</font><br>");
		logDebug(err.stack);
		handleError(err, "getGISInfo2custom");
	}
	return false;
}
/*------------------------------------------------------------------------------------------------------*/