/*----------------------------------------------------------------------------------------------------------------------/
| Program:    BATCH_PRE_APP_MEETING_COURTESY_EMAIL
| Trigger:    Batch Engine
| Client:     City of Hollywood
| Date:       02/28/2025
| Version:    v1.0
|
| Notes:      Sends Courtesy email notifying applicant of pending items, 
|             2 months after Meeting WF task has been marked complete
----------------------------------------------------------------------------------------------------------------------*/

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

// Fallback for logDebug
if (typeof logDebug === "undefined") {
   function logDebug(message) {
      aa.print(message);
   }
}

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
   var applicantNames = []; // Array to store applicant names for jshear@mytechs email
   var recordList = runSqlSelect_();   
   var commentsToAdd = "";
   var tsiToAdd = "";

   for (var r in recordList) {
        var altId = recordList[r].altId;
        var meetingDate = recordList[r].meetingDate;
        var capId = getApplication(altId); // Assumes getCapId is defined in INCLUDES_ACCELA_FUNCTIONS

        if (!capId) {
         aa.print("No valid capId found for " + altId + br);
         continue;
        }

        //Check for Related Records
        var relRecords = hasRelatedRecords();
        if (relRecords){
            continue;
        }

        //Getting Comments param from record comments is not recommended but available if needed
        /*var capCommentScriptModel = aa.cap.createCapCommentScriptModel();
        capCommentScriptModel.setCapIDModel(capId);
        var capCommentModel = capCommentScriptModel.getCapCommentModel();
        var cQuery = aa.cap.getCapComment(capCommentModel);
        cResult = cQuery.getOutput();

        for (var ii in cResult) {
            var commentText = cResult[ii].getText();
            var auditDate = cResult[ii].getAuditDate();
            var year = auditDate.getYear();
            var month = ('0' + auditDate.getMonth()).slice(-2);
            var day = ('0' + auditDate.getDayOfMonth()).slice(-2);
            var commentDate = year + "/" + month + "/" + day; 
            break;
        }*/

        var workflowResult = aa.workflow.getTasks(capId);
        if (!workflowResult.getSuccess()) {
            aa.print("Error retrieving tasks for " + altId + ": " + workflowResult.getErrorMessage() + br);
            return;
        }
      
        var tasks = workflowResult.getOutput();
        for (var k in tasks) {
            var task = tasks[k];
            var taskName = task.getTaskDescription();
            if (taskName.toLowerCase().indexOf("review") != -1) {
               var taskComment = task.getDispositionComment() || "None provided";
               aa.print("Review task: " + taskName + ", Comment: " + taskComment + br);
               commentsToAdd += taskName + " Comment:\n" + taskComment + "," + "\n";
            }
            if (taskName.equals("Meeting")) {
                var stepNbr = task.getStepNumber();
                var processID = task.getProcessID();
                var TSIResult = aa.taskSpecificInfo.getTaskSpecificInfoByTask(capId, processID, stepNbr)
                if (TSIResult.getSuccess()) {
                    var TSI = TSIResult.getOutput();
                    for (a1 in TSI) {
                        var tsiValue = TSI[a1].getChecklistComment();
                        if (tsiValue == "CHECKED"){
                            checkItem = TSI[a1].getCheckboxDesc();
                            tsiToAdd += checkItem + "," + "\n";
                        }                   
                    }
                }
            }
        }

      // Logic for 4-day notifications
      var cTypes = getContactTypes_(capId);
      var applicantEmail = null;
      var applicantName = null;
      
      for(var c in cTypes){
         if (cTypes[c] == "Applicant") {
            applicantEmail = getContactEmail(cTypes[c], capId);
            var contacts = aa.people.getCapContactByCapID(capId).getOutput();
            for (var i in contacts) {
               if (contacts[i].getCapContactModel().getPeople().getContactType() == "Applicant") {
                  applicantName = (contacts[i].getFirstName() || "") + " " + (contacts[i].getLastName() || "");
                  applicantName = applicantName.trim();
                  break;
               }
            }
            break;
         }
      }
      
      if (applicantEmail && applicantName) {
         aa.print("Applicant: " + applicantName + ", Email: " + applicantEmail + br);
         applicantNames.push(applicantName);
         
         var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
         var acaUrl = acaSite ? acaSite.replace("/Admin/login.aspx", "") : "";
         var buildRecURL = acaUrl + getACAUrl(capId);
         var bureauName = lookup("Reporting Information Standards", "Bureau Name") || "Default Bureau";
         var deptName = "Planning Division";
         
         emailParams = aa.util.newHashtable();
         getDepartmentParams4Notification(emailParams, deptName);
         addParameter(emailParams, "$$BureauName$$", bureauName);
         addParameter(emailParams, "$$altID$$", capId.getCustomID());
         addParameter(emailParams, "$$url4ACA$$", acaUrl);
         addParameter(emailParams, "$$acaRecordUrl$$", buildRecURL);
         addParameter(emailParams, "$$appTypeAlias$$", altId);
         addParameter(emailParams, "$$ContactName$$", applicantName);
         addParameter(emailParams, "$$CompletionDate$$", meetingDate);
         addParameter(emailParams, "$$recordComment$$", commentsToAdd);
         addParameter(emailParams, "$$tsi$$", tsiToAdd);
         
         sendNotification_("Accela@HollywoodFl.org", applicantEmail, "", "PAC_MEETING_COMP_REMINDER", emailParams, null, capId);
         aa.print("Sending reminder email to " + applicantEmail + " for record " + altId + br);
      } else {
         aa.print("No valid applicant email or name found for " + altId + br);
      }
   }
}


/*======================================================/
  SQL function to retrieve records and meeting dates
/======================================================*/
function runSqlSelect_(){ 
   var sqlDs = []; 
   
var sql = "SELECT BP.B1_ALT_ID, CONVERT(varchar, GP.G6_STAT_DD, 101) AS MEETING_DATE " +
          "FROM B1PERMIT BP " +
          "JOIN GPROCESS GP " +
          "ON BP.SERV_PROV_CODE = GP.SERV_PROV_CODE " +
          "AND BP.B1_PER_ID1 = GP.B1_PER_ID1 " +
          "AND BP.B1_PER_ID2 = GP.B1_PER_ID2 " +
          "AND BP.B1_PER_ID3 = GP.B1_PER_ID3 " +
          "WHERE BP.SERV_PROV_CODE = '$$servprovcode$$' " +
          "AND BP.B1_PER_GROUP = 'Planning' " +
          "AND BP.B1_PER_TYPE = 'Pre-App Consult' " +
          "AND BP.B1_PER_SUB_TYPE = 'NA' " +
          "AND BP.B1_PER_CATEGORY = 'NA' " +
          "AND BP.B1_APPL_STATUS = 'Closed - Complete' " +
          "AND DATEDIFF(day, GP.G6_STAT_DD, GETDATE()) = 60 " +
          "AND GP.SD_PRO_DES = 'Meeting' " +
          "AND GP.SD_APP_DES = 'Complete' " +
          "AND GP.REC_STATUS = 'A' " + 
          "AND GP.SD_CHK_LV1 = 'N' ";
   
   sql = sql.replace("$$servprovcode$$", "HOLLYWOOD");
     
   var result = aa.db.select(sql,[]);         
   if (result.getSuccess()) {
      var data = result.getOutput();
      aa.print("Count: " + data.size() + br); 
      for (var d = 0; d < data.size(); d++) { 
         var altId = data.get(d).get("B1_ALT_ID");
         var meetingDate = data.get(d).get("MEETING_DATE");
         aa.print("SQL Result: altId=" + altId + ", meetingDate=" + meetingDate + br);
         sqlDs.push({
            altId: altId ? altId.trim() : null,
            meetingDate: meetingDate
         });
      }
   } else {
      aa.print("Error: " + result.getErrorMessage() + br);
   }

   return sqlDs;
}

/*======================================================/
  Existing helper functions (unchanged)
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
   // If no capId provided, send email without CAP association (for summary emails)
   if (!capId) {
      var result = aa.document.sendEmailByTemplateName(emailFrom, emailTo, emailCC, templateName, params, reportFile);
      if (result.getSuccess()) {
         aa.print("Sent email successfully!" + br);
         return true;
      } else {
         aa.print("Failed to send mail: " + result.getErrorType() + br);
         return false;
      }
   }
   
   // For record-specific emails, use CAP association
   var id1 = capId.ID1;
   var id2 = capId.ID2;
   var id3 = capId.ID3;
   
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

function hasRelatedRecords() {
    // Check for parent record
    var getCapResult = aa.cap.getProjectParents(capId, 1);
    if (getCapResult.getSuccess()) {
        var parentArray = getCapResult.getOutput();
        if (parentArray && parentArray.length) {
            logDebug("Found parent record: " + parentArray[0].getCapID().getCustomID());
            return true; // Parent found, return true
        }
    } 

    // Check for child records
    var caps = aa.cap.getChildByMasterID(capId);
    if (caps.getSuccess()) {
        var childArray = caps.getOutput();
        if (childArray && childArray.length) {
            logDebug("Found " + childArray.length + " child record(s) for capId: " + capId.getCustomID());
            return true; // At least one child found, return true
        } 
    } 

    // No parent or child records found
    return false;
}
