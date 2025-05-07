/*----------------------------------------------------------------------------------------------------------------------/
| Program:    BATCH_PRE_APP_MEETING_NOTES_AND_NOTIFICATIONS
| Trigger:    Batch Engine
| Client:     City of Hollywood
| Date:       02/28/2025
| Version:    v1.0
|
| Notes:      Automates the management of pre-application meeting records for the City of Hollywood.
|             Retrieves records with scheduled meetings (today or in 4 days) from the Accela database using SQL.
|             For records with meetings today, it processes workflow tasks by closing active "review" tasks, aggregating
|             their comments. 
|             For records with meetings in 4 days, it sends reminder emails to applicants with meeting details and a record URL. 
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
   var todayFormatted = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");

   for(var rec in recordList){
      var altId = recordList[rec].altId ? recordList[rec].altId.trim() : null;
      var meetingDate = recordList[rec].meetingDate;
      logDebug("Record ID: " + altId + ", Meeting Date: " + meetingDate + br);
      
      if (!altId) {
         logDebug("Invalid or empty altId, skipping record" + br);
         continue;
      }

      var capIdResult = aa.cap.getCapID(altId);
      if (!capIdResult.getSuccess() || !capIdResult.getOutput()) {
         logDebug("Failed to get capId for altId: " + altId + ", Error: " + capIdResult.getErrorMessage() + br);
         continue;
      }
      var capId = capIdResult.getOutput();
      var cap = aa.cap.getCap(capId).getOutput();
      if (!cap) {
         logDebug("Failed to get cap for altId: " + altId + br);
         continue;
      }
      
      if (!meetingDate) {
         logDebug("No meeting date found for record " + altId + br);
         continue;
      }

      // Process tasks for records with today's meeting date
      if (meetingDate == todayFormatted) {
         processTasksForTodayMeetings(capId, altId);
         continue; // Skip notification logic for today's meetings
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
         logDebug("Applicant: " + applicantName + ", Email: " + applicantEmail + br);
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
         addParameter(emailParams, "$$appTypeAlias$$", cap.getCapType().getAlias());
         addParameter(emailParams, "$$ContactName$$", applicantName);
         addParameter(emailParams, "$$meetingDate$$", meetingDate);
         
         sendNotification_("Accela@HollywoodFl.org", applicantEmail, "", "SS_PERMIT_STATUS", emailParams, null, capId);
         logDebug("Sending reminder email to " + applicantEmail + " for record " + altId + br);
      } else {
         logDebug("No valid applicant email or name found for " + altId + br);
      }
   }
   
   if (applicantNames.length > 0) {
      var nameList = applicantNames.join(", ");
      logDebug("Preparing to send applicant list to jshear@mytechs: " + nameList + br);
      
      emailParams = aa.util.newHashtable();
      var bureauName = lookup("Reporting Information Standards", "Bureau Name") || "Default Bureau";
      var deptName = "Planning Division";
      getDepartmentParams4Notification(emailParams, deptName);
      addParameter(emailParams, "$$BureauName$$", bureauName);
      addParameter(emailParams, "$$applicantNames$$", nameList);
      
      sendNotification_("Accela@HollywoodFl.org", "jshear@mytechs", "", "SS_PERMIT_STATUS", emailParams, null, null);
   } else {
      logDebug("No applicants found to send to jshear@mytechs" + br);
   }
}

/*======================================================/
  Process tasks for today's meetings
/======================================================*/
function processTasksForTodayMeetings(capId, recordId) {
   try {
      aa.print("Processing tasks for record " + recordId + " with today's meeting date" + br);
      
      // Get workflow tasks
      var workflowResult = aa.workflow.getTasks(capId);
      if (!workflowResult.getSuccess()) {
         aa.print("Error retrieving tasks for " + recordId + ": " + workflowResult.getErrorMessage() + br);
         return;
      }
      
      var tasks = workflowResult.getOutput();
      var reviewTaskFound = false;
      var commentsToAdd = "";
      
      // Loop through tasks to find and close active "review" tasks
      for (var j in tasks) {
         var task = tasks[j];
         var taskName = task.getTaskDescription().toLowerCase();
         var taskStatus = task.getActiveFlag();
         
         if (taskName.indexOf("review") != -1 && taskStatus == "Y") {
            reviewTaskFound = true;
            aa.print("Found active review task: " + task.getTaskDescription() + br);
            
            // Close the task
            task.setDisposition("Complete w/o Comments");
            task.setDispositionNote("No Response Received");
            var editResult = aa.workflow.editTask(task);
            if (editResult.getSuccess()) {
               aa.print("Closed task: " + task.getTaskDescription() + " with comment 'No Response Received'" + br);
            } else {
               aa.print("Error closing task " + task.getTaskDescription() + ": " + editResult.getErrorMessage() + br);
            }
         }
      }
      
      // If a review task was closed, activate the "Meeting" task and Aggregate comments from all "review" tasks
      if (reviewTaskFound) {
         for (var k in tasks) {
            var task = tasks[k];
            var taskName = task.getTaskDescription();
            if (taskName.toLowerCase().indexOf("review") != -1) {
               var taskComment = task.getDispositionComment() || "None provided";
               aa.print("Review task: " + taskName + ", Comment: " + taskComment + br);
               commentsToAdd += taskName + " Comment:\n" + taskComment + "\n\n";
            }
         }

         // Add aggregated comments to record if any
         if (commentsToAdd) {
            createCapComment(commentsToAdd, capId);
            aa.print("Added comments to record " + recordId + ": " + commentsToAdd + br);
         } 

         activateTask("Meeting");

      } else {
         aa.print("No active review tasks found for record " + recordId + br);
      }
      
   } catch (err) {
      aa.print("Error processing tasks for " + recordId + ": " + err.message + br);
   }
}

/*======================================================/
  SQL function to retrieve records and meeting dates
/======================================================*/
function runSqlSelect_(){ 
   var sqlDs = []; 
   
   var sql =   "SELECT B1P.B1_ALT_ID, BVD.ATTRIBUTE_VALUE AS MEETING_DATE " + 
               "FROM B1PERMIT B1P " +
               "JOIN BAPPSPECTABLE_VALUE BVS " +
               "ON BVS.SERV_PROV_CODE = B1P.SERV_PROV_CODE " +
               "AND BVS.B1_PER_ID1 = B1P.B1_PER_ID1 " +
               "AND BVS.B1_PER_ID2 = B1P.B1_PER_ID2 " +
               "AND BVS.B1_PER_ID3 = B1P.B1_PER_ID3 " +
               "AND BVS.TABLE_NAME = 'MEETING INFORMATION' " +
               "AND BVS.COLUMN_NAME = 'Meeting Status' " +
               "AND BVS.ATTRIBUTE_VALUE = 'Scheduled' " +
               "JOIN BAPPSPECTABLE_VALUE BVD " +
               "ON BVS.SERV_PROV_CODE = BVD.SERV_PROV_CODE " +
               "AND BVS.B1_PER_ID1 = BVD.B1_PER_ID1 " +
               "AND BVS.B1_PER_ID2 = BVD.B1_PER_ID2 " +
               "AND BVS.B1_PER_ID3 = BVD.B1_PER_ID3 " +
               "AND BVS.GROUP_NAME = BVD.GROUP_NAME " +
               "AND BVS.TABLE_NAME = BVD.TABLE_NAME " +
               "AND BVS.ROW_INDEX = BVD.ROW_INDEX " +
               "AND BVD.COLUMN_NAME = 'Meeting Date' " +
               "WHERE BVS.SERV_PROV_CODE = '$$servprovcode$$' " +
               "AND B1P.B1_PER_GROUP = 'Planning' " +
               "AND B1P.B1_PER_TYPE = 'Pre-App Consult' " +
               "AND B1P.B1_PER_SUB_TYPE = 'NA' " +
               "AND B1P.B1_PER_CATEGORY = 'NA' " +
               "AND (CAST(BVD.ATTRIBUTE_VALUE AS DATE) = CAST(GETDATE() AS DATE) OR " +
               "CAST(BVD.ATTRIBUTE_VALUE AS DATE) = CAST(DATEADD(day, 4, GETDATE()) AS DATE))";
   
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

function activateTask(wfstr) {

    // this version doesn't clobber the due date.
    var useProcess = false;
    var processName = "";
    if (arguments.length == 2) {
        processName = arguments[1]; // subprocess
        useProcess = true;
    }

    var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
    if (workflowResult.getSuccess())
        var wfObj = workflowResult.getOutput();
    else {
        logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
        return false;
    }

    for (i in wfObj) {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
            var stepnumber = fTask.getStepNumber();
            var processID = fTask.getProcessID();
            var dDate = fTask.getDueDate();
            //logDebug("dDate is " + dDate);

            if (useProcess) {
                aa.workflow.adjustTask(capId, stepnumber, processID, "Y", "N", null, dDate)
            } else {
                aa.workflow.adjustTask(capId, stepnumber, "Y", "N", null, dDate)
            }
            logMessage("Activating Workflow Task: " + wfstr);
            logDebug("Activating Workflow Task: " + wfstr);
        }
    }
}