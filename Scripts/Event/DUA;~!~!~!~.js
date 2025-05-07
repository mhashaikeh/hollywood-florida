try {

    var docArray = documentModelArray.toArray();
    for (each in docArray) {
        var aDoc = docArray[each];
        docCats = aDoc.getDocCategory();
        if (docCats == "Notice of Commencement"){
            editCapConditionStatus_Rev("Record","Notice of Commencement Required","Document Received","Applied","Notice");
        }
    }

} catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "DUA;~!~!~!~", err + debug + err.stack);
}

try{
    
    if(documentUploadedFrom == "ACA"){
        var cap = aa.cap.getCap(capId).getOutput();
        var capStatus = cap.getCapStatus();
        appTypeResult = cap.getCapType();
        appTypeString = String(appTypeResult);

        // List of allowed record types
        var allowedTypes = [
            "Building/Amendment/NA/NA",
            "PublicWorks/Amendment/Engineering/NA",
            "Fire/Amendment/NA/NA",
            "PublicWorks/Amendment/Utilities/NA"
        ];

        // Check if the record type is allowed and status is "Additional Info Required"
        if (allowedTypes.indexOf(appTypeString) > -1 && capStatus == "Additional Info Required") {
            
            // Update task if active
            if (isTaskActive("Modification Review")) updateTask("Modification Review", "Additional Info Received", "", "");
            updateAppStatus("Pending", "");
            unassignTask("Modification Review");
        }
    }

} catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "DUA;~!~!~!~", err + debug + err.stack);
}