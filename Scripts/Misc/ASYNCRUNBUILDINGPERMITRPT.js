/*------------------------------------------------------------------------------------------------------/
| Program : ASYNCRUNBUILDINGPERMITRPT.js
| Event   : ASYNCRUNBUILDINGPERMITRPT
|
| Usage   : Run Building Permit Report and Inspection Reference Log Report and send async.
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


var currentUserID = "ADMIN";
var publicUser = null;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var showDebug = true;	

var vScriptName = aa.env.getValue("ScriptCode");
var vEventName = aa.env.getValue("EventName");

var message = "";						// Message String
var debug = "";							// Debug String
var br = "<BR>";						// Break Tag
var emailText = "";

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr); emailText+= dstr + \"<br>\"; } }";
eval(override);

function getMasterScriptText(vScriptName) {
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
	return emseScript.getScriptText() + "";
}
try{
		var capId = aa.env.getValue("CapID");
        var reportToCategoryMap = {
        "Building Permit Report": "Permit",
        "Inspection Reference Log Report": "Inspection Result Ticket"
        };

        emailTemplateName = "SS_PERMIT_ISSUANCE";  // to be changed to the correct email templated
        var contEmail = false;
        var contFound=false;
        var reportArray = ['Building Permit Report','Inspection Reference Log Report'];    // change to the correct report
        var altID = capId.getCustomID();

        rFiles = new Array();

        for (ii in reportArray){
            
            reportName = reportArray[ii];
            report = aa.reportManager.getReportInfoModelByName(reportName);
            report = report.getOutput();
            cap = aa.cap.getCap(capId).getOutput();
            appTypeResult = cap.getCapType();
            appTypeString = appTypeResult.toString(); 
            appTypeArray = appTypeString.split("/");        
            report.setModule(appTypeArray[0]); 
            report.setCapId(capId); 
            report.getReportInfoModel().getEDMSEntityIdModel().setAltId(altID); 
            var parameters = aa.util.newHashMap();
            parameters.put("RecordID", altID);
            report.setReportParameters(parameters);
        
            var permit = aa.reportManager.hasPermission(reportName,currentUserID);
            if(permit.getOutput().booleanValue()) 
            { 
                var reportResult = aa.reportManager.getReportResult(report); 
                if(reportResult) 
                { 
                    reportResult = reportResult.getOutput(); 
                    var reportFile = aa.reportManager.storeReportToDisk(reportResult); 
                    reportFile = reportFile.getOutput();
                    if (reportFile) 
                    {
                        rFiles.push(reportFile);
                    }
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

                    documentModel.setDocGroup("BLD"); //Document Group
                    documentModel.setDocCategory(reportToCategoryMap[reportName] || "Default"); //Category
                    documentModel.setFileName(reportResult.getName());
                    documentModel.setDocType("application/pdf");
                    documentModel.setEntityType("CAP");
                    var docResult = aa.document.createDocument(documentModel);
                    if (docResult.getSuccess()) {
                        var createdDocModel = docResult.getOutput();
                        logDebug("document created: " + createdDocModel);
                    } else {
                        logDebug("Failed to generate doc: " + docResult.getErrorMessage());
                    }
                logDebug("Report has been run for " + altID);
            }else{
                logDebug("No permission to report: "+ reportName + " for " + systemUserObj);
            }
        }

        contArr = getContactArray();
        for (x in contArr)
        {
            if (!matches(contArr[x]["contactType"], null)) 
            {
                contEmail = contArr[x]["email"];
                if(contEmail)
                {
                    var emailParameters = aa.util.newHashtable();
                    getRecordParams4Notification(emailParameters);
                    var deptName;
                    if (appTypeArray[0] == "Fire") {
                        deptName = "Fire Prevention";
                    } else if (appTypeArray[0] == "PublicWorks") {
                        deptName = "Engineering Division";
                    } else {
                        deptName = appTypeArray[0] + " Division";
                    }
                    getDepartmentParams4Notification(emailParameters, deptName);
                    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
                    var acaUrl = acaSite.replace("/Admin/login.aspx", "");
                    buildRecURL = acaUrl + getACAUrl(itemCapId);
                    buildPayURL = buildRecURL.replace("1000", "1009");
                    var bureauName = lookup("Reporting Information Standards", "Bureau Name");
                    addParameter(emailParameters, "$$BureauName$$", bureauName);
                    addParameter(emailParameters, "$$acaRecordUrl$$", buildRecURL);
                    addParameter(emailParameters, "$$url4ACA$$", acaUrl);
                    addParameter(emailParameters, "$$altID$$", altID);
                    addParameter(emailParameters, "$$recordAlias$$", cap.getCapType().getAlias());
                    addParameter(emailParameters, "$$AgencyName$$", "Hollywood");
                    addParameter(emailParameters, "$$ContactName$$", contArr[x]["firstName"] + " " + contArr[x]["lastName"]);
                    sendNotification("Accela@HollywoodFl.org", contEmail, "", emailTemplateName, emailParameters, rFiles);
                    logDebug("Email Successfully sent to " + contEmail);



                }else
                {
                    logDebug("No email address found for " + contArr[x]["firstName"] +" " + contArr[x]["lastName"] +" ' email not sent");
                }
            }
        }
} catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "ASYNCRUNBUILDINGPERMITRPT", err + debug + err.stack);
}

