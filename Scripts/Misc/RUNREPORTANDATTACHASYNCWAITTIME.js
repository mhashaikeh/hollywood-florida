/*------------------------------------------------------------------------------------------------------/
| Program : RUNREPORTANDATTACHASYNCWAITTIME.js
| Event   : RUNREPORTANDATTACHASYNCWAITTIME
|
| Usage   : run report and attach.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/

// ********************************************************************************************************************************
//  Env Paramters Below
// ********************************************************************************************************************************
var servProvCode = aa.env.getValue("ServProvCode");         // Service Provider Code
var capIDString = aa.env.getValue("CustomCapId");           // Custom CAP ID
var capId = aa.env.getValue("CapID");
var reportName = aa.env.getValue("ReportName");             // Report Name
var reportParameters = aa.env.getValue("ReportParameters"); // Report Paramters, it should be HashTable
var docGroup = aa.env.getValue("docGroup");
var docType = aa.env.getValue("docType");
var waitTime = aa.env.getValue("WaitTime");


var currentUserID = "ADMIN";
var publicUser = null;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var showDebug = true;   

var vScriptName = aa.env.getValue("ScriptCode");
var vEventName = aa.env.getValue("EventName");

var message = "";                       // Message String
var debug = "";                         // Debug String
var br = "<BR>";                        // Break Tag
var emailText = "";

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));

override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr); emailText+= dstr + \"<br>\"; } }";
eval(override);

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

try{
        var contEmail = false;
        var contFound=false;
        var altID = capId.getCustomID();

        report = aa.reportManager.getReportInfoModelByName(reportName);
        report = report.getOutput();
        cap = aa.cap.getCap(capId).getOutput();
        appTypeResult = cap.getCapType();
        appTypeString = appTypeResult.toString(); 
        appTypeArray = appTypeString.split("/");        
        report.setModule(appTypeArray[0]); 
        report.setCapId(capId); 
        report.getReportInfoModel().getEDMSEntityIdModel().setAltId(altID); 
        report.setReportParameters(reportParameters);
    
        var permit = aa.reportManager.hasPermission(reportName,currentUserID);
        if(permit.getOutput().booleanValue()) { 
            var reportResult = aa.reportManager.getReportResult(report); 
            if(reportResult){ 
                reportResult = reportResult.getOutput(); 
                var reportFile = aa.reportManager.storeReportToDisk(reportResult); 
                reportFile = reportFile.getOutput();
            }
            var documentModel = aa.document.newDocumentModel().getOutput();
            var documentContentModel = aa.document.newDocumentContentModel().getOutput();
            var fileStream = aa.io.FileInputStream(reportFile);
            documentContentModel.setDocInputStream(fileStream);
            documentModel.setDocumentContent(documentContentModel);
            documentModel.setServiceProviderCode(aa.getServiceProviderCode());
            
            documentModel.setCapID(capId);
            documentModel.setEntityID(capId);
            documentModel.setModuleName(appTypeArray[0]); //Module
            documentModel.setSourceName("ADS"); // EDMS

            documentModel.setDocGroup(docGroup); //Document Group
            documentModel.setDocCategory(reportName); //Category
            documentModel.setFileName(reportResult.getName());
            documentModel.setDocType(docType + "/pdf");
            documentModel.setEntityType("CAP");
            var docResult = aa.document.createDocument(documentModel);
            if (docResult.getSuccess()) {
                var createdDocModel = docResult.getOutput();
                logDebug("document created: " + createdDocModel);
            }else{
                logDebug("Failed to generate doc: " + docResult.getErrorMessage());
            }
            logDebug("Report has been run for " + altID);
        }else{
            logDebug("No permission to report: "+ reportName + " for " + systemUserObj);
        }


} catch (err) {
    logDebug("A JavaScript Error occurred: RUNREPORTANDSENDASYNCWAITTIME " + err.message);
    logDebug(err.stack);
}

