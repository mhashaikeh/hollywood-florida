function getGISInfo2ASB(svc, layer, attributename) // optional: numDistance, distanceType
{
    try {
        var numDistance = 0
        if (arguments.length >= 4) numDistance = arguments[3]; // use numDistance in arg list
        var distanceType = "feet";
        if (arguments.length == 5) distanceType = arguments[4]; // use distanceType in arg list
        var retString;

        var bufferTargetResult = aa.gis.getGISType(svc, layer); // get the buffer target
        if (bufferTargetResult.getSuccess()) {
            var buf = bufferTargetResult.getOutput();
            buf.addAttributeName(attributename);
        }
        else { logDebug("**ERROR: Getting GIS Type for Buffer Target.  Reason is: " + bufferTargetResult.getErrorType() + ":" + bufferTargetResult.getErrorMessage()); return false }

        var gisObjResult = aa.gis.getParcelGISObjects(ParcelValidatedNumber); // get gis objects on the parcel number
        if (gisObjResult.getSuccess())
            var fGisObj = gisObjResult.getOutput();
        else { logDebug("**ERROR: Getting GIS objects for Parcel.  Reason is: " + gisObjResult.getErrorType() + ":" + gisObjResult.getErrorMessage()); return false }

        for (a1 in fGisObj) // for each GIS object on the Parcel.  We'll only send the last value
        {
            var bufchk = aa.gis.getBufferByRadius(fGisObj[a1], numDistance, distanceType, buf);

            if (bufchk.getSuccess())
                var proxArr = bufchk.getOutput();
            else { showMessage = true; logMessage("**WARNING: Retrieving Buffer Check Results.  Reason is: " + bufchk.getErrorType() + ":" + bufchk.getErrorMessage()); return false }

            for (a2 in proxArr) {
                var proxObj = proxArr[a2].getGISObjects();  // if there are GIS Objects here, we're done
                for (z1 in proxObj) {
                    var v = proxObj[z1].getAttributeValues()
                    retString = v[0];
                }
            }
        }

        return retString;
    }
    catch (err) {
        logDebug("A JavaScript Error occurred: function getGISInfo2ASB: " + err.message);
        logDebug(err.stack);
    }
}