try {

    var docArray = documentModelArray.toArray();
    for (each in docArray) {
        var aDoc = docArray[each];
        docCats = aDoc.getDocCategory();
        if (docCats == "Broward County Surface Water Management License"){
            editCapConditionStatus_Rev("Permit","Broward County Surface Water Management License Required","Document Received","Applied","Notice");
        }
        if (docCats == "As-Built"){
            editCapConditionStatus_Rev("Permit","As-Builts Required","Document Received","Applied","Notice");
        }
        if (docCats == "Test Results"){
            editCapConditionStatus_Rev("Permit","Test Results Required","Document Received","Applied","Notice");
        }
        if (docCats == "Outside Agency/Broward County Clearances"){
            editCapConditionStatus_Rev("Permit","Outside Agency/Broward County Clearances Required","Document Received","Applied","Notice");
        }
        if (docCats == "Start-Up Report"){
            editCapConditionStatus_Rev("Permit","Start-Up Report Required","Document Received","Applied","Notice");
        }
        if (docCats == "Operations and Maintenance Manual"){
            editCapConditionStatus_Rev("Permit","Operations and Maintenance Manual and Agreement Required","Document Received","Applied","Notice");
        }
        if (docCats == "Maintenance Agreement"){
            editCapConditionStatus_Rev("Permit","Maintenance Agreement Required","Document Received","Applied","Notice");
        }
        if (docCats == "Conveyance Documentation"){
            editCapConditionStatus_Rev("Permit","Conveyance Documentation Required","Document Received","Applied","Notice");
        }
        if (docCats == "Pre-Construction Checklist"){
            editCapConditionStatus_Rev("Record","Pre-Construction Meeting","Document Received","Applied","Notice");
        }
        if (docCats == "Request for New Meter Application - Signed"){
            updateAppStatus("Document Received", "Updated via script");
        }
    }

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "DUA;PUBLICWORKS!~!~!~", err + debug + err.stack);
}