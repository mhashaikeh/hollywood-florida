try {

    var docArray = documentModelArray.toArray();
    for (each in docArray) {
        var aDoc = docArray[each];
        docCats = aDoc.getDocCategory();
        if (matches(docCats,"Test and Balance Report","Certified Welder Certificate","EPL Display Card","Uplift Report","Proof of Subterranean Termite Treatment","Concrete Compaction","Special Inspector Final Letter")){
            editCapConditionStatus_Rev("Permit",docCats + " Required","Document Received","Applied","Notice");
        }
    }

} catch (err) {
    var emailAddress = "jshear@mytechsinc.com"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "DUA;BUILDING!~!~!~", err + debug + err.stack);
}


var loadScript = function (scriptName) {
    scriptName = scriptName.toUpperCase();
    var emse = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var script = emse.getScriptByPK(aa.getServiceProviderCode(), scriptName, "ADMIN");
    return script.getScriptText() + "";
}




var BuildingDocumentUpload = function () {

    eval(loadScript("ADHOCHANDLER"));

    function getActivePrintSets(printSetTypesStandardChoice) {
        var activePrintSets = [];
        for (var i in printSetTypesStandardChoice) {
            var printSetType = printSetTypesStandardChoice[i];
            if (printSetType["active"] == "A") {
                logDebug("printSetType " + printSetType["value"]);
                activePrintSets.push(printSetType["value"] + "");
            }
        }
        return activePrintSets;
    }



    var currentUserID = aa.env.getValue("CurrentUserID")+"";
    //get stadard choice values of DPR_PRINTSET_TYPES
    var printSetTypesStandardChoice = getStandardChoiceArray("DPR_PRINTSET_TYPES");

    var activePrintSets = [];
    activePrintSets = getActivePrintSets(printSetTypesStandardChoice);

   showDebug = true;
    logDebug("currentUserID" + currentUserID);
   if (currentUserID.indexOf("PUBLICUSER") > -1 || currentUserID.indexOf("DPR") > -1  || currentUserID.indexOf("THERNANDEZ") > -1) {
        var isAllApprovedDocType = true;
        for (each in docArray) {
            var aDoc = docArray[each];
            docCats = aDoc.getDocCategory() + "";
            logDebug("docCats " + docCats);
            if (activePrintSets.indexOf(docCats) == -1) {
                logDebug("docCats " + docCats + " is not in activePrintSets");
                isAllApprovedDocType = false;
            }
        }
                
       var wfObj = aa.workflow.getTasks(capId).getOutput();

       var afterIssuanceTask = false;
       //get a list of active tasks including inactive new document received
       for (var i in wfObj) {

           fTask = wfObj[i];
           var description = fTask.getTaskDescription() +"";
            logDebug("description " + description);
           if ((description.equals("Permit Issuance")
               || description.equals("Inspection"))
               && fTask.getActiveFlag().equals("Y")
               ) {
                   afterIssuanceTask = true;
             }
       }
       logDebug("afterIssuanceTask " + afterIssuanceTask);
       if(afterIssuanceTask && !isAllApprovedDocType){
        adHocHanlder.addAddHocTask(capId, "New Document Received - Building", "", "");
       }
   }
}


try {
    
    BuildingDocumentUpload();
} catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "DUA;~!~!~!~", err + debug + err.stack);
}
