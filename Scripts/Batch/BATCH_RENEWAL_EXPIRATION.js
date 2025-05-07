/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_RENEWAL_EXPIRATION.js   
| Trigger: Batch

|
| Frequency: Daily
|
|
/------------------------------------------------------------------------------------------------------*/
var emailText = "";
var debugText = "";
var showDebug = 3;
var showMessage = false;
var message = "";
var maxSeconds = 10 * 60;
var br = "<br>";
var useAppSpecificGroupName = false;

sysDate = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");

var SCRIPT_VERSION = 3.0;
eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));

overRide = "function logDebug(dstr) { aa.print(dstr); } function logMessage(dstr) { aa.print(dstr); }";
eval(overRide);

function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}

if (batchJobResult.getSuccess()) {
    batchJobID = batchJobResult.getOutput();
    logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
}
else {
    logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}


var runDate = new Date();
var lookAheadDays = getParam("lookAheadDays");
var daySpan = getParam("daySpan");
var appGroup = getParam("recordGroup");
var appTypeType = getParam("recordType");
var appSubtype = getParam("recordSubType");
var appCategory = getParam("recordCategory");
var skipAppStatus = getParam("skipAppStatus").split(","); //   Skip records with one of these application statuses
var skipAppStatusCont = getParam("skipAppStatusCont").split(",");
var skipAppStatusArray = skipAppStatus.concat(skipAppStatusCont);
var sendEmailToContactTypes = getParam("sendEmailToContactTypes"); // ALL,PRIMARY, or comma separated values
var emailTemplate = getParam("emailTemplate"); // email Template
var sendEmailNotifications = getParam("sendEmailNotifications");
var sysFromEmail = getParam("sysFromEmail");
var newAppStatus = getParam("newAppStatus"); //   update the CAP to this status
var newExpStatus = getParam("newExpirationStatus"); //   update to this expiration status
var updWfTask = getParam("workflowTask"); //   update this workflow task
var newWfStatus = getParam("newWorkflowStatus"); //   update the workflow task to this status
var startDate = new Date();
var timeExpired = false;
var startTime = startDate.getTime();
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var currentUserID = "ADMIN"
var procCount = 0;


var fromDate = formattedDate(dateAdd(null, parseInt(lookAheadDays)));
var toDate = formattedDate(dateAdd(fromDate, parseInt(daySpan)));
fromJSDate = new Date(fromDate);
toJSDate = new Date(toDate);
var dFromDate = aa.date.parseDate(fromDate);
var dToDate = aa.date.parseDate(toDate);
logDebug("fromDate: " + fromDate + "  toDate: " + toDate);

appGroup = appGroup == "" ? "*" : appGroup;
appTypeType = appTypeType == "" ? "*" : appTypeType;
appSubtype = appSubtype == "" ? "*" : appSubtype;
appCategory = appCategory == "" ? "*" : appCategory;
var appType = appGroup + "/" + appTypeType + "/" + appSubtype + "/" + appCategory;
var sArray = getParam("expirationStatus").split(",");
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");

if (!timeExpired) {
    try {

        mainProcess();
    }
    catch (err) {
        aa.print("ERROR: " + err.message)
    };
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function mainProcess() {
try{
	var myExp = new Array();
	var capPermApp = 0;
	var capFilterType = 0;
	var capFilterInactive = 0;
	var capFilterError = 0;
	var capFilterStatus = 0;
	var capDeactivated = 0;
	var capCount = 0;
	
	for (i in sArray) {
		var expResult = aa.expiration.getLicensesByDate(sArray[i], fromDate, toDate);
		if (expResult.getSuccess()) {
			tempcapList = expResult.getOutput();
			logDebug("Type count: " + tempcapList.length);
			if (tempcapList.length > 0) {
				myExp = myExp.concat(tempcapList);
			}
		}else{
			logDebug("Error retrieving records: " + expResult.getErrorMessage());
		}
	}
	if (myExp.length > 0) {
		logDebug("Found " + myExp.length + " records to process");
	}else { 
		logDebug("No records found to process.") ;
		return false;
	}
		
	for (thisExp in myExp) // for each b1expiration (effectively, each license app)	
	{
		b1Exp = myExp[thisExp];
		var expDate = b1Exp.getExpDate();
		if (expDate) {
			var b1ExpDate = expDate.getMonth() + "/" + expDate.getDayOfMonth() + "/" + expDate.getYear();
		}
		var b1Status = b1Exp.getExpStatus();
		var renewalCapId = null;
		capId = aa.cap.getCapID(b1Exp.getCapID().getID1(), b1Exp.getCapID().getID2(), b1Exp.getCapID().getID3()).getOutput();
		if (!capId) {
			logDebug("Could not get a Cap ID for " + b1Exp.getCapID().getID1() + "-" + b1Exp.getCapID().getID2() + "-" + b1Exp.getCapID().getID3());
			continue;
		}
		altId = capId.getCustomID();
		logDebug("==========: " + altId + " :==========");
		logDebug("     " +"Renewal Status : " + "Expires on " + b1ExpDate);
		var capResult = aa.cap.getCap(capId);
		if (!capResult.getSuccess()) {
			logDebug("     " +"skipping, Record is deactivated");
			capDeactivated++;
			continue;
		} else {
			var cap = capResult.getOutput();
		}
		var capStatus = cap.getCapStatus();
		appTypeResult = cap.getCapType(); //create CapTypeModel object
		appTypeString = appTypeResult.toString();
		appTypeArray = appTypeString.split("/");
		// Filter by CAP Type
		if (appType.length && (!appMatch(appType) || appTypeArray[0] == "Licenses")) {
			capFilterType++;
			logDebug("     " +"skipping, Application Type does not match")
			continue;
		}
		// Filter by CAP Status
		if (exists(capStatus, skipAppStatusArray)) {
			capFilterStatus++;
			logDebug("     " +"skipping, due to application status of " + capStatus)
			continue;
		}
		// done filtering, so increase the record count to include this record.
		capCount++;
	// Actions start here:
	// update CAP status
		if (newAppStatus.length > 0) {
				updateAppStatus(newAppStatus, "");
		}
	// workflow task status
		if (newWfStatus.length > 0 && updWfTask.length > 0) {		
			updateTask(updWfTask, newWfStatus, "updated via Batch Renewal Script", "");
		}
	// update expiration status	
		if (newExpStatus.length > 0) {
			b1Exp.setExpStatus(newExpStatus);
			aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
			logDebug("Update expiration status: " + newExpStatus);
			if(newExpStatus == "Expired") {
				renewalCapProject = getRenewalCapByParentCapIDForIncomplete(capId);
				if (renewalCapProject != null) {
					var renCapId = renewalCapProject.getCapID();
					var renewalCap = aa.cap.getCap(renCapId).getOutput();
					var capIdStatusClass = getCapIdStatusClass(renCapId);
					if (matches(capIdStatusClass,"INCOMPLETE EST","INCOMPLETE CAP")){
						aa.cap.updateAccessByACA(renCapId,"N");
						renewalCap.getCapModel().setAuditStatus("I");
						aa.cap.editCapByPK(renewalCap.getCapModel());
						logDebug("Set " + renCapId + " with a Status of: " + renewalCap.getCapModel().getAuditStatus());
					}else{
						renewalCapProject.setStatus("Complete");
						renewalCapProject.setRelationShip("R");  // move to related records
						aa.cap.updateProject(renewalCapProject);
					}
				}
			}
		}
	// Send Notification
		if (sendEmailNotifications === "Y" && sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) {
			var conTypeArray = sendEmailToContactTypes.split(",");
			var conArray = getContactArray(capId);
			var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
			var acaUrl = acaSite.replace("/Admin/login.aspx", "");
			buildRecURL = acaUrl + getACAUrl(capId);
			var bureauName = lookup("Reporting Information Standards", "Bureau Name");
			var deptName = (appTypeArray[0] == "PublicWorks") ? "Engineering Division" : appTypeArray[0] + " Division";
			var contactFound = false;

		    conArray.forEach(function(thisContact) {
					if (exists(thisContact.contactType, conTypeArray)) {
						contactFound = true;
						var conEmail = thisContact.email;
					  
						if (conEmail) {
							var eParams = aa.util.newHashtable();
							getDepartmentParams4Notification(eParams, deptName);
							addParameter(eParams, "$$BureauName$$", bureauName);
							addParameter(eParams, "$$altID$$", capId.getCustomID());
							addParameter(eParams, "$$url4ACA$$", acaUrl);
							addParameter(eParams, "$$acaRecordUrl$$", buildRecURL);
							addParameter(eParams, "$$recordAlias$$", cap.getCapType().getAlias());
							addParameter(eParams, "$$ContactName$$", thisContact.firstName + " " + thisContact.lastName);
							addParameter(eParams, "$$expDays$$", String(lookAheadDays));
						    
					    var rFiles = [];
					    sendNotification(sysFromEmail, conEmail, "", emailTemplate, eParams, rFiles, capId);
					    logDebug(altId + ": Sent Email template " + emailTemplate + " to " + thisContact.contactType + " : " + conEmail);
					  }
					}
		    });

	    if (!contactFound) {
	        logDebug("No contact found for notification: " + altId);
	    }
		}
	}
	logDebug("========================================");
	logDebug("Total CAPS qualified date range: " + myExp.length);
	logDebug("Ignored due to application type: " + capFilterType);
	logDebug("Ignored due to CAP Status: " + capFilterStatus);
	logDebug("Ignored due to Deactivated CAP: " + capDeactivated);
	logDebug("Total CAPS processed: " + capCount);
    }
    catch (err) {
        logDebug("Error on BATCH_RENEWAL_EXPIRATION.Err: " + err);
    }
}
//___________________________________________________________________________________________________________ 
function elapsed(stTime) {
    var thisDate = new Date();
    var thisTime = thisDate.getTime();
    return ((thisTime - stTime) / 1000)
}

function getParam(pParamName) {
    var ret = "" + aa.env.getValue(pParamName);
    logDebug("Parameter : " + pParamName + " = " + ret);
    return ret;
}

function formattedDate(date) {
    var d = new Date(date || Date.now()),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [month, day, year].join('/');
}

function isEmptyOrNull(value) {
	return value == null || value === undefined || String(value) == "";
}

function getStandardChoiceArray(stdChoice) {	
	var cntItems = 0;
	var stdChoiceArray = new Array();
	var bizDomScriptResult = aa.bizDomain.getBizDomain(stdChoice);
	if (bizDomScriptResult.getSuccess()) {
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		if (bizDomScriptObj != null) {
			cntItems = bizDomScriptObj.size();
			logDebug("getStdChoiceArray: " + stdChoice + " size = " + cntItems);
			if (cntItems > 0) {
				var bizDomScriptItr = bizDomScriptObj.iterator();
				while (bizDomScriptItr.hasNext()) {
					var bizBomScriptItem = bizDomScriptItr.next();
					var stdChoiceArrayItem = new Array();
					stdChoiceArrayItem["value"] = bizBomScriptItem.getBizdomainValue();
					stdChoiceArrayItem["valueDesc"] = bizBomScriptItem.getDescription();
					stdChoiceArrayItem["active"] = bizBomScriptItem.getAuditStatus();
					stdChoiceArray.push(stdChoiceArrayItem);
				}
			}
			else
			{
				logDebug("getStdChoiceArray: WARNING stdChoice "+stdChoice +" does not have items or items disabled.");
			}
		} else {
			logDebug("getStdChoiceArray: WARNING stdChoice "+stdChoice +" is not found"  );
		}
	}
	else
	{
		logDebug("**ERROR: getting standard choice " + stdChoice + " :" + bizDomScriptResult.getErrorMessage());
	}
	return stdChoiceArray;
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
		}//active and name match
		if (rptInfoStdArray[s]["active"] == "A" && String(rptInfoStdArray[s]["value"]).toUpperCase() == "DEFAULT") {
			defaultDeptValDesc = rptInfoStdArray[s]["valueDesc"];	
		}
	}//all std-choice rows

	if (!foundDept) {
		if (isEmptyOrNull(defaultDeptValDesc))
            {
				return eParamsHash;
			}			
		 else {
		// No department found, use default values
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
		}//for all parameters in each row
	}//has email parameters

	return eParamsHash;
}

function updateTask(wfstr, wfstat, wfcomment, wfnote) // optional process name, cap id
{
	var useProcess = false;
	var processName = "";
	if (arguments.length > 4) {
		if (arguments[4] != "") {
			processName = arguments[4]; // subprocess
			useProcess = true;
		}
	}
	var itemCap = capId;
	if (arguments.length == 6)
		itemCap = arguments[5]; // use cap ID specified in args

	var workflowResult = aa.workflow.getTaskItems(itemCap, wfstr, processName, null, null, null);
	if (workflowResult.getSuccess())
		var wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	if (!wfstat)
		wfstat = "NA";

	for (i in wfObj) {
		var fTask = wfObj[i];
		if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var dispositionDate = aa.date.getCurrentDate();
			var stepnumber = fTask.getStepNumber();
			var processID = fTask.getProcessID();
			if (useProcess)
				aa.workflow.handleDisposition(itemCap, stepnumber, processID, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
			else
				aa.workflow.handleDisposition(itemCap, stepnumber, wfstat, dispositionDate, wfnote, wfcomment, systemUserObj, "U");
			logMessage("Updating Workflow Task " + wfstr + " with status " + wfstat);
			logDebug("Updating Workflow Task " + wfstr + " with status " + wfstat);
		}
	}
}

function getRenewalCapByParentCapIDForIncomplete(parentCapid) {
	if (parentCapid == null || aa.util.instanceOfString(parentCapid)) {
		return null;
	}
	//1. Get parent license for review
	var result = aa.cap.getProjectByMasterID(parentCapid, "Renewal", "Incomplete");
	if (result.getSuccess()) {
		projectScriptModels = result.getOutput();
		if (projectScriptModels == null || projectScriptModels.length == 0) {
			logDebug("ERROR: Failed to get renewal CAP by parent CAPID(" + parentCapid + ") for review");
			return null;
		}
		//2. return parent CAPID.
		projectScriptModel = projectScriptModels[0];
		return projectScriptModel;
	} else {
		logDebug("ERROR: Failed to get renewal CAP by parent CAP(" + parentCapid + ") for review: " + result.getErrorMessage());
		return null;
	}
}