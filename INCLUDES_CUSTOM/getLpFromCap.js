function getLpFromCap(itemId) {
    var licProfResult = aa.licenseProfessional.getLicensedProfessionalsByCapID(itemId);
    if (licProfResult.getSuccess()) {
        var licProf = licProfResult.getOutput();
        if (licProf && licProf.length > 0) {
            logDebug("Found licensed professionals: " + licProf.length);
            return licProf[0]; // Return the first licensed professional found
        } else {
            logDebug("No licensed professional found for CAP ID: " + itemId);
        }
    } else {
        logDebug("Error retrieving licensed professionals for CAP ID: " + itemId + ". " + licProfResult.getErrorMessage());
    }
    return null; // Ensure a return value is provided in all cases
}