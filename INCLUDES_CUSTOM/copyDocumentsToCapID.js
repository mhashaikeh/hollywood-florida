function copyDocumentsToCapID(fromCapID, toCapID) {
    logDebug("Copying the documents");
    var opDocArray = aa.document.getDocumentListByEntity(fromCapID.toString(), "CAP").getOutput();
    var vDocArray = opDocArray.toArray();
    for (var vCounter in vDocArray) {
        var vDoc = vDocArray[vCounter];
        aa.document.createDocumentAssociation(vDoc, toCapID.toString(), "CAP");
    }
}