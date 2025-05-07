/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_ADMIN_CITATION_LEIN_HEARING
| Client:  AACO
|
| Version 1.0 - Base Version. 
|
|  
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var errLog = "";
var debugText = "";
var showDebug = false;	
var showMessage = false;
var message = "";
var br = "<br>";

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID()
batchJobName = "" + aa.env.getValue("BatchJobName");
wfObjArray = null;
debug = "";

eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

override = "function logDebug(dstr){ if(showDebug) { aa.print(dstr); emailText+= dstr + \"<br>\"; } }";
eval(override);

function getScriptText(vScriptName){
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(),vScriptName,"ADMIN");
	return emseScript.getScriptText() + "";
}

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

showDebug = true;
batchJobID = 0;
if (batchJobResult.getSuccess())
  {
  batchJobID = batchJobResult.getOutput();
  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
  }
else
  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());

var emailAddress = "jshear@mytechsinc.com";
var sysFromEmail = "Accela@HollywoodFl.org";
var useAppSpecificGroupName = false;
var startDate = new Date();
var startTime = startDate.getTime(); // Start timer
var currentUserID = "ADMIN";
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var AInfo = new Array();


/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

try {
	mainProcess();
	if (emailAddress.length) {
		aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Results", emailText);
		if(errLog != "") {
			aa.sendMail(sysFromEmail, emailAddress, "", batchJobName + " Errors", errLog);
		}
	}
} catch (err) {
	logDebug("ERROR: BATCH_ADMIN_CITATION_LEIN_HEARING: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try{
	
	var capCount  =0;
	var recArray = new Array();


	
  var recordList = runSqlSelect_();		
    
	for(var rec in recordList){	

		capId = aa.cap.getCapID(recordList[rec]).getOutput();
		var altId = capId.getCustomID();
		logDebug("Processing Record: " + altId);
		closeTask("Case Intake", "Administrative Citation Lien Hearing", "Updated via Batch", "");
	}
	
} catch (err) {
	logDebug("ERROR: BATCH_ADMIN_CITATION_LEIN_HEARING: " + err.message + " In " + batchJobName + " Line " + err.lineNumber);
	logDebug("Stack: " + err.stack);
}}

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/

function runSqlSelect_(){	
	var sqlDs = [];	
	
var sql = "SELECT BP.B1_ALT_ID, BP.B1_PER_GROUP, BP.B1_PER_TYPE, BP.B1_PER_SUB_TYPE, " +
          "GP.SD_PRO_DES, GP.SD_APP_DES, GP.B1_FILE_DD, GP.REC_STATUS, GP.ASGN_FNAME, GP.ASGN_LNAME " +
          "FROM B1PERMIT BP " +
          "JOIN GPROCESS GP " +
          "ON BP.SERV_PROV_CODE = GP.SERV_PROV_CODE " +
          "AND BP.B1_PER_ID1 = GP.B1_PER_ID1 " +
          "AND BP.B1_PER_ID2 = GP.B1_PER_ID2 " +
          "AND BP.B1_PER_ID3 = GP.B1_PER_ID3 " +
          "WHERE BP.SERV_PROV_CODE = 'HOLLYWOOD' " +
          "AND BP.B1_PER_GROUP = 'Enforcement' " +
          "AND BP.B1_PER_TYPE = 'Case' " + 
          "AND GP.SD_PRO_DES = 'Case Intake' " +
          "AND GP.SD_APP_DES = 'Citation Pending Payment' " +
          "AND CAST(GP.B1_FILE_DD AS DATE) <= CAST(GETDATE() AS DATE) " +
          "AND GP.SD_CHK_LV1 = 'Y' ";
    
	var result = aa.db.select(sql,[]);   	     
	if (result.getSuccess()) {
		var data = result.getOutput();
		aa.print("Count: " + data.size() + br); 
		for (var d = 0; d < data.size(); d++)
		{	
			sqlDs.push(data.get(d).get("B1_ALT_ID"));
            //aa.print(data.get(d).get("B1_ALT_ID"));
		}
	}
	else
		aa.print("Error: " + result.getErrorMessage() + br);

	return sqlDs;
}

function updateAppStatus(stat,cmt) // optional cap id
{
	var itemCap = capId;
	if (arguments.length == 3) 
		itemCap = arguments[2]; // use cap ID specified in args

	var updateStatusResult = aa.cap.updateAppStatus(itemCap, "APPLICATION", stat, sysDate, cmt, systemUserObj);
	if (updateStatusResult.getSuccess())
		logDebug("Updated application status to " + stat + " successfully.");
	else
		logDebug("**ERROR: application status update to " + stat + " was unsuccessful.  The reason is "  + updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
}

function closeTask(wfstr, wfstat, wfcomment, wfnote) {
    // optional process name

    if(typeof wfstr == "undefined" || wfstr == null){
        logDebug("'closeTask' requires 'wfstr' parameter.");
        return false;
    }
    if(typeof wfstat == "undefined" || wfstat == null){
        logDebug("'closeTask' requires 'wfstat' parameter.");
        return false;
    }
	if (typeof capId === typeof undefined || capId == null) {
		logDebug("'closeTask' requires global 'capId' be defined.");
		return false;
	}
    var l_systemUserObj;
    if(typeof systemUserObj == "undefined"){
        l_systemUserObj = systemUserObj;
    } else {
        // try to set
        if(typeof currentUserID != "undefined"){
            l_systemUserObj = aa.person.getUser(currentUserID).getOutput();
        } else {
            l_systemUserObj = aa.person.getUser(aa.env.getValue("currentUserID")).getOutput();
        }
    }

	var useProcess = false;
	var processName = "";
	if (arguments.length == 5) {
		processName = arguments[4]; // subprocess
		useProcess = true;
	}

	var workflowResult = aa.workflow.getTaskItems(capId, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess()){
		var wfObj = workflowResult.getOutput();
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

			if (useProcess) {
				aa.workflow.handleDisposition(capId, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, l_systemUserObj, "Y");
			} else {
				aa.workflow.handleDisposition(capId, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, l_systemUserObj, "Y");
			}
			logMessage("Closing Workflow Task: " + wfstr + " with status " + wfstat);
			logDebug("Closing Workflow Task: " + wfstr + " with status " + wfstat);
		}
	}
}
