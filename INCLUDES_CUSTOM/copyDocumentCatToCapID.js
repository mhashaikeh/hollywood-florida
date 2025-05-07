function copyDocumentCatToCapID(fromCapID, toCapID, docCat) {
    logDebug("Copying the '" + docCat + "' document if it exists");
    var opDocArray = aa.document.getDocumentListByEntity(fromCapID.toString(), "CAP").getOutput();
    if (opDocArray) {
        var vDocArray = opDocArray.toArray();
        for (var vCounter in vDocArray) {
            var vDoc = vDocArray[vCounter];
            if (vDoc.getDocCategory() == docCat) {
                aa.document.createDocumentAssociation(vDoc, toCapID.toString(), "CAP");
                logDebug("Document '" + vDoc.getDocCategory() + "' copied to the new record.");
            }
        }
    } else {
        logDebug("No documents found to copy from the source record.");
    }
}
