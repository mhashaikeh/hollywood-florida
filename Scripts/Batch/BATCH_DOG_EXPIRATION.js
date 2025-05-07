/*----------------------------------------------------------------------------------------------------------------------/
| Program:    BATCH_DOG_EXPIRATION
| Trigger:    Batch Engine
| Client:     City of Hollywood
| Date:       02/28/2025
| Version:    v1.0
|
| Notes:      03/01/2025 - Checks expirations at 30, 10, 1 days; sets "About to Expire" at 30 days
---------------------------------------------------------------------------------------------------------------------*/

/*=======================================================/
    Including all Accela Internal Library
/=======================================================*/
eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,true));
eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,true));
var SCRIPT_VERSION = 3;
/*======================================================*/

/*=======================================================/
    Variables needed to log parameters below in eventLog
/=======================================================*/
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
var batchJobResult = aa.batchJob.getJobID();
var batchJobID = 0;
var eventType = "";
var startDt = sysDate;
var batchDescription = "";
var br = "<br>";
/*======================================================*/

/*======================================================/
  Setting up current user id in case system doesn't provide info. 
/======================================================*/
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser(currentUserID).getOutput();
/*======================================================*/

if (batchJobResult.getSuccess()){
  batchJobID = batchJobResult.getOutput();
  aa.print("Batch Job " + batchJobName + " Job ID is " + batchJobID + br);
}
else
  aa.print("Batch job ID not found " + batchJobResult.getErrorMessage() + br);

aa.print("Start of Job" + br);
//starting main process...
try{
    mainProcess();
}
catch(e){
    aa.print("Error in main process: " + e.message + br);
}

aa.print("End of Job" + br);

/*=====================================================/
    Entry point - main function
/=====================================================*/
function mainProcess(){
  var emailParams = aa.util.newHashtable();
  var recordList = runSqlSelect_();   
  
  for(var rec in recordList){           
    aa.print("Record ID: " + recordList[rec] + br);
    var capId = aa.cap.getCapID(recordList[rec]).getOutput();         
    var cap = aa.cap.getCap(capId).getOutput();
    
    // Check if this record is expiring soon or expired yesterday
    var b1ExpResult = aa.expiration.getLicensesByCapID(capId);
    var diffDays = null;
    if (b1ExpResult.getSuccess()) {
      var b1Exp = b1ExpResult.getOutput();
      var b1ExpDate = b1Exp.getB1Expiration().getExpDate();
      aa.print("Raw expiration date for " + recordList[rec] + ": " + (b1ExpDate ? b1ExpDate.toString() : "null") + br);
      if (b1ExpDate) {
        var expStr = dateFormatted(b1ExpDate.getMonth() + 1, b1ExpDate.getDate(), b1ExpDate.getYear() + 1900, "MM/DD/YYYY");
        aa.print("Formatted expStr: " + expStr + br);
        diffDays = getDateDiff_Local(expStr); // Signed difference (-1, 1, 10, 30)
        aa.print("DiffDays for " + recordList[rec] + ": " + diffDays + br);
      } else {
        aa.print("No valid expiration date for " + recordList[rec] + br);
      }
    } else {
      aa.print("Failed to retrieve expiration for " + recordList[rec] + ": " + b1ExpResult.getErrorMessage() + br);
    }

    // Handle records expired yesterday (-1 day)
    if (diffDays == -1) {
      // Update application status to Expired
      updateAppStatus("Expired", "Updated via Batch Renewal Script - Expired Yesterday", capId); 
      aa.print("Status updated to Expired for " + recordList[rec] + br);
      
      // Update workflow task to Expired
      localUpdateTask("Permit Status", "Expired", "Updated via Batch Renewal Script - Expired Yesterday", "", capId);

      var cTypes = getContactTypes_(capId);
      var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
      var acaUrl = acaSite ? acaSite.replace("/Admin/login.aspx", "") : "";
      var buildRecURL = acaUrl + getACAUrl(capId);
      var bureauName = lookup("Reporting Information Standards", "Bureau Name") || "Default Bureau";
      var deptName = "Code Compliance";

      // Populate email parameters for "Expired" notification
      emailParams = aa.util.newHashtable();
      getDepartmentParams4Notification(emailParams, deptName);
      addParameter(emailParams, "$$BureauName$$", bureauName);
      addParameter(emailParams, "$$altID$$", capId.getCustomID());
      addParameter(emailParams, "$$url4ACA$$", acaUrl);
      addParameter(emailParams, "$$acaRecordUrl$$", buildRecURL);
      addParameter(emailParams, "$$recordAlias$$", cap.getCapType().getAlias());
      
      var contacts = aa.people.getCapContactByCapID(capId).getOutput();
      var contactName = contacts.length > 0 ? (contacts[0].getFirstName() || "") + " " + (contacts[0].getLastName() || "") : "Unknown";
      addParameter(emailParams, "$$ContactName$$", contactName.trim());
      addParameter(emailParams, "$$expDays$$", "Expired Yesterday");

      for(var c in cTypes){            
        aa.print("Contact: " + cTypes[c] + " email: " + getContactEmail(cTypes[c], capId) + br);  
        sendNotification_("", getContactEmail(cTypes[c], capId), "", "ENF_PERMIT_EXPIRED", emailParams, null, capId);          
      }        
    }
    // Handle records expiring soon (30, 10, 1 days)
    else if (diffDays == 30 || diffDays == 10 || diffDays == 1) {
      if (diffDays == 30) {
        // Update application status
        updateAppStatus("About to Expire", "Updated via Batch Renewal Script", capId); 
        aa.print("Status updated to About to Expire for " + recordList[rec] + br);
        
        // Update expiration status
        if (b1ExpResult.getSuccess()) {
          var b1Exp = b1ExpResult.getOutput();
          b1Exp.setExpStatus("About to Expire");
          aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
        }
        
        // Update workflow task if it exists
        localUpdateTask("Permit Status", "About to Expire", "Updated via Batch Renewal Script", "", capId);
      }

      var cTypes = getContactTypes_(capId);
      var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
      var acaUrl = acaSite ? acaSite.replace("/Admin/login.aspx", "") : "";
      var buildRecURL = acaUrl + getACAUrl(capId);
      var bureauName = lookup("Reporting Information Standards", "Bureau Name") || "Default Bureau";
      var deptName = "Code Compliance";

      // Populate email parameters for "About to Expire" notification
      emailParams = aa.util.newHashtable();
      getDepartmentParams4Notification(emailParams, deptName);
      addParameter(emailParams, "$$BureauName$$", bureauName);
      addParameter(emailParams, "$$altID$$", capId.getCustomID());
      addParameter(emailParams, "$$url4ACA$$", acaUrl);
      addParameter(emailParams, "$$acaRecordUrl$$", buildRecURL);
      addParameter(emailParams, "$$recordAlias$$", cap.getCapType().getAlias());
      
      var contacts = aa.people.getCapContactByCapID(capId).getOutput();
      var contactName = contacts.length > 0 ? (contacts[0].getFirstName() || "") + " " + (contacts[0].getLastName() || "") : "Unknown";
      addParameter(emailParams, "$$ContactName$$", contactName.trim());
      addParameter(emailParams, "$$expDays$$", diffDays);

      // Select notification template based on diffDays
      var notificationTemplate;
      if (diffDays == 30) {
        notificationTemplate = "ENF_PERMIT_ABOUT_TO_EXPIRE_30";
      } else if (diffDays == 10) {
        notificationTemplate = "ENF_PERMIT_ABOUT_TO_EXPIRE_10";
      } else if (diffDays == 1) {
        notificationTemplate = "ENF_PERMIT_ABOUT_TO_EXPIRE";
      }

      for(var c in cTypes){            
        aa.print("Contact: " + cTypes[c] + " email: " + getContactEmail(cTypes[c], capId) + br);  
        sendNotification_("", getContactEmail(cTypes[c], capId), "", notificationTemplate, emailParams, null, capId);          
      }        
    }
  }
}

/*======================================================/
  Helper functions - Do not edit unless specified
/======================================================*/
function getScriptText(vScriptName, servProvCode, useProductScripts) {
  if (!servProvCode) servProvCode = aa.getServiceProviderCode();
  vScriptName = vScriptName.toUpperCase();
  var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
  try {
    if (useProductScripts) {
      var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    } else {
      var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
    }
    return emseScript.getScriptText() + "";
  } catch (err) {
    return "";
  }
}

function getContactEmail(contactType, capId){ 
  var capContactResult = aa.people.getCapContactByCapID(capId);
  if (capContactResult.getSuccess()) {
    var Contacts = capContactResult.getOutput();
    for (var yy in Contacts) {
      if (contactType.equals(Contacts[yy].getCapContactModel().getPeople().getContactType())) {
        if (Contacts[yy].getEmail() != null) {
          return Contacts[yy].getEmail();
        }
      }
    }
  } else {
    aa.print("Couldn't find valid email for " + contactType + ": " + capContactResult.getErrorMessage() + br);
  }
  return null;
}

function getContactTypes_(capId) {
  try {
    var ctArray = [];
    var capContactResult = aa.people.getCapContactByCapID(capId);
    if (capContactResult.getSuccess()) {
      var capContactArray = capContactResult.getOutput();
      for (var yy in capContactArray) {
        ctArray.push(capContactArray[yy].getPeople().contactType);
      }
    }
    return ctArray;     
  } catch (err) {
    aa.print("Error pulling contact types: " + err.message + br);
    return [];
  }
} 

function sendNotification_(emailFrom, emailTo, emailCC, templateName, params, reportFile, capId) {
  var itemCap = capId;
  if (arguments.length == 7) itemCap = arguments[6];
  var id1 = itemCap.ID1;
  var id2 = itemCap.ID2;
  var id3 = itemCap.ID3;
  
  var capIDScriptModel = aa.cap.createCapIDScriptModel(id1, id2, id3);

  var result = aa.document.sendEmailAndSaveAsDocument(emailFrom, emailTo, emailCC, templateName, params, capIDScriptModel, reportFile);
  if (result.getSuccess()) {
    aa.print("Sent email successfully!" + br);
    return true;
  } else {
    aa.print("Failed to send mail: " + result.getErrorType() + br);
    return false;
  }
}

function runSqlSelect_(){ 
  var sqlDs = []; 
  
  var sql =   "SELECT b.B1_ALT_ID, b.B1_APPL_STATUS, e.EXPIRATION_DATE " + 
              "FROM B1PERMIT b " +
              "JOIN B1_EXPIRATION e ON " +
              "b.B1_PER_ID1 = e.B1_PER_ID1 AND " +
              "b.B1_PER_ID2 = e.B1_PER_ID2 AND " +
              "b.B1_PER_ID3 = e.B1_PER_ID3 " +
              "WHERE " +
              "b.SERV_PROV_CODE = '$$servprovcode$$' AND " +
              "(CAST(e.EXPIRATION_DATE AS DATE) = CAST(DATEADD(day, 30, GetDate()) AS DATE) OR " +
              "CAST(e.EXPIRATION_DATE AS DATE) = CAST(DATEADD(day, 10, GetDate()) AS DATE) OR " +
              "CAST(e.EXPIRATION_DATE AS DATE) = CAST(DATEADD(day, 1, GetDate()) AS DATE) OR " +
              "CAST(e.EXPIRATION_DATE AS DATE) = CAST(DATEADD(day, -1, GetDate()) AS DATE)) AND " +
              "b.B1_PER_GROUP = 'Enforcement' AND " +
              "b.B1_PER_TYPE = 'Permit' AND " +
              "b.B1_PER_SUB_TYPE = 'Dog' AND " +
              "b.B1_PER_CATEGORY = 'NA' AND " +
              "b.B1_APPL_STATUS != 'Expired' AND " +
              "b.B1_APPL_STATUS NOT LIKE '%Closed%'";
  
  sql = sql.replace("$$servprovcode$$", "HOLLYWOOD");
    
  var result = aa.db.select(sql,[]);         
  if (result.getSuccess()) {
    var data = result.getOutput();
    aa.print("Count: " + data.size() + br); 
    for (var d = 0; d < data.size(); d++) { 
      sqlDs.push(data.get(d).get("B1_ALT_ID"));
    }
  } else {
    aa.print("Error: " + result.getErrorMessage() + br);
  }

  return sqlDs;
}

function getDateDiff_Local(DatetoComp) {
  var date1 = new Date(DatetoComp);
  var sysDate = aa.date.getCurrentDate();
  var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");
  var date2 = new Date(sysDateMMDDYYYY);
  var diffDays = Math.ceil((date1 - date2) / (1000 * 60 * 60 * 24)); // Signed difference without Math.abs()
  return diffDays;
}

function getDepartmentParams4Notification(eParamsHash, deptName) {
  if (deptName == null) {
    return eParamsHash;
  }
  var rptInfoStdArray = getStandardChoiceArray("DEPARTMENT_INFORMATION");
  var foundDept = false;

  var valDesc = null;
  var defaultDeptValDesc = null;
  for (s in rptInfoStdArray) {
    if (rptInfoStdArray[s]["active"] == "A" && String(rptInfoStdArray[s]["value"]).toUpperCase() == String(deptName).toUpperCase()) {
      valDesc = rptInfoStdArray[s]["valueDesc"];
      if (isEmptyOrNull(valDesc)) {
        return eParamsHash;
      }
      valDesc = String(valDesc).split("|");
      foundDept = true;
      break;
    }
    if (rptInfoStdArray[s]["active"] == "A" && String(rptInfoStdArray[s]["value"]).toUpperCase() == "DEFAULT") {
      defaultDeptValDesc = rptInfoStdArray[s]["valueDesc"]; 
    }
  }

  if (!foundDept) {
    if (isEmptyOrNull(defaultDeptValDesc)) {
      return eParamsHash;
    } else {
      defaultDeptValDesc = String(defaultDeptValDesc).split("|");
      valDesc = defaultDeptValDesc;
    }   
  }

  if (!isEmptyOrNull(valDesc)) {
    for (e in valDesc) {
      var parameterName = "";
      var tmpParam = valDesc[e].split(":");
      if (tmpParam[0].indexOf("$$") < 0)
        parameterName = "$$" + tmpParam[0].replace(/\s+/g, '') + "$$";
      else
        parameterName = tmpParam[0];

      addParameter(eParamsHash, parameterName, tmpParam[1]);
    }
  }

  return eParamsHash;
}

function getStandardChoiceArray(stdChoice) {
  var stdArray = [];
  var bizDomScriptResult = aa.bizDomain.getBizDomain(stdChoice);
  if (bizDomScriptResult.getSuccess()) {
    var bizDomScriptArray = bizDomScriptResult.getOutput().toArray();
    for (var i in bizDomScriptArray) {
      var stdItem = {};
      stdItem["value"] = bizDomScriptArray[i].getBizdomainValue();
      stdItem["valueDesc"] = bizDomScriptArray[i].getDescription();
      stdItem["active"] = bizDomScriptArray[i].getAuditStatus();
      stdArray.push(stdItem);
    }
  }
  return stdArray;
}

function isEmptyOrNull(value) {
  return (value == null || value == "" || typeof value == "undefined");
}

function localUpdateTask (wfstr, wfstat, wfcomment, wfnote, itemCap){
  var useProcess = false;
  var processName = "";

  var wfObj;
  var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
  if (workflowResult.getSuccess()) {
          wfObj = workflowResult.getOutput();
  } else {
          logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
          return false;
  }
  if (!wfstat) {
          wfstat = "NA";
  }
  for (var i in wfObj) {
      var fTask = wfObj[i];
      if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
          var dispositionDate = aa.date.getCurrentDate();
          var stepnumber = fTask.getStepNumber();
          var processID = fTask.getProcessID();
          var t;
          if (useProcess) {
                  t = aa.workflow.handleDisposition(itemCap, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
          } else {
                  t = aa.workflow.handleDisposition(itemCap, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
          }
          if (t.getSuccess()) {
                  logMessage("Updating Workflow Task " + wfstr + " with status " + wfstat);
                  logDebug("Updating Workflow JJ Task " + wfstr + " with status " + wfstat);
          } else {
                  logDebug("failed");
          }
      }
  }
}
