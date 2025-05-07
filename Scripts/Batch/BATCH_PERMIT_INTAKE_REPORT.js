/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_PERMIT_INTAKE_REPORT.js   
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
var startDate = new Date();
var startTime = startDate.getTime();
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var currentUserID = "ADMIN"

var emailTemplate = getParam("emailTemplate"); // email Template
var sysFromEmail = getParam("sysFromEmail");
var reportName = getParam("reportName");
var conEmail = getParam("conEmail");
for(var i=1;i<=10;i++){
	var tmpCtr = getParam("conEmail"+i);
	if(tmpCtr && tmpCtr !="")
		conEmail += tmpCtr;
}

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");
try {

	mainProcess();
}
catch (err) {
	aa.print("ERROR: " + err.message)
};


/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function mainProcess() {
    
    try {
		
		var reportResult = aa.reportManager.getReportInfoModelByName(reportName);
		if (!reportResult.getSuccess()){
			logDebug("**WARNING** couldn't load report " + reportName + " " + reportResult.getErrorMessage()); 
		}
		var rFiles = [];
		var report = reportResult.getOutput(); 
		report.setModule("Building"); 
		var reportResult = aa.reportManager.getReportResult(report); 
		if(reportResult) {
			reportOutput = reportResult.getOutput();
			var reportFile=aa.reportManager.storeReportToDisk(reportOutput);
			rFile=reportFile.getOutput();
			rFiles.push(rFile);
			var eParams = aa.util.newHashtable();
			addParameter(eParams, "$$DATE$$",aa.util.formatDate(aa.util.now(),"MM/dd/yyyy"));
			var result = aa.document.sendEmailByTemplateName(sysFromEmail, conEmail, "", emailTemplate, eParams, rFiles);
			if(result.getSuccess()){
				logDebug("Sent Email template " + emailTemplate + " to: " + conEmail);
			}else{
				logDebug("Failed to send mail. - " + result.getErrorType());
			}	

		}else {
			logDebug("System failed get report: " + reportResult.getErrorType() + ":" +reportResult.getErrorMessage());
		}
		
			
    }
    catch (err) {
        logDebug("Error on BATCH_PERMIT_INTAKE_REPORT.Err: " + err);
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
