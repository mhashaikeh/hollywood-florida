/*----------------------------------------------------------------------------------------------------------------------/
| Program:      BATCH_RPT_FIRE_DAILY_INSPECTION.js
| Trigger:      Batch: Daily Fire Inspection Report
| Client:       Hollywood, FL
| Date:         12/10/2024
| Version:      Base Version 1.0
| Description:  
| The Daily Inspection Schedule - Fire Report will be generated daily and emailed to specified agency contacts.
---------------------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_RPT_FIRE_DAILY_INSPECTION.js   
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

overRide =
  "function logDebug(dstr) { aa.print(dstr); } function logMessage(dstr) { aa.print(dstr); }";
eval(overRide);

function getMasterScriptText(vScriptName) {
  vScriptName = vScriptName.toUpperCase();
  var emseBiz = aa.proxyInvoker
    .newInstance("com.accela.aa.emse.emse.EMSEBusiness")
    .getOutput();
  var emseScript = emseBiz.getMasterScript(
    aa.getServiceProviderCode(),
    vScriptName
  );
  return emseScript.getScriptText() + "";
}

if (batchJobResult.getSuccess()) {
  batchJobID = batchJobResult.getOutput();
  logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
} else {
  logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}

var runDate = new Date();
var startDate = new Date();
var startTime = startDate.getTime();
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var currentUserID = "ADMIN";

var emailTemplate = getParam("emailTemplate"); // email Template
var sysFromEmail = getParam("sysFromEmail");
var reportName = getParam("reportName");
var emailSTD = "INTERNAL_EMAIL_LIST";
var toEmailString = lookup(emailSTD, "FIRE_INSPECTION_REPORT");
if (!isBlank(toEmailString)) {
  if (toEmailString.lastIndexOf(";") == toEmailString.length - 1) {
    toEmailString = toEmailString.slice(0, -1);
  }
  toEmailString = String(toEmailString).split(";").join(",");
}
var today = aa.util.formatDate(new Date(), "MM/dd");

/*------------------------------------------------------------------------------------------------------/
| <===========Begin=Paremeters=========>
|
/------------------------------------------------------------------------------------------------------*/


/*------------------------------------------------------------------------------------------------------/
| <===========End=Paremeters=========>
|
/------------------------------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("Start of Job");
try {
  mainProcess();
} catch (err) {
  aa.print("ERROR: " + err.message);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
function mainProcess() {
  try {
      var reportResult = aa.reportManager.getReportInfoModelByName(reportName);
      if (reportResult.getSuccess()) {
        var rFiles = [];
        var report = reportResult.getOutput();
        report.setModule("Building");
        //var rParams = aa.util.newHashMap();
        //report.setReportParameters(rParams);
        var reportResult = aa.reportManager.getReportResult(report);
        if (reportResult) {
          reportOutput = reportResult.getOutput();
          var reportFile = aa.reportManager.storeReportToDisk(reportOutput);
          rFile = reportFile.getOutput();
          rFiles.push(rFile);

          var params = aa.util.newHashtable();
          var result = aa.document.sendEmailByTemplateName(
            sysFromEmail,
            toEmailString,
            "",
            emailTemplate,
            params,
            rFiles
          );
        } else {
          logDebug(
            "System failed get report: " +
              reportResult.getErrorType() +
              ":" +
              reportResult.getErrorMessage()
          );
        }
      } else {
        logDebug(
          "**WARNING** couldn't load report " +
            reportName +
            " " +
            reportResult.getErrorMessage()
        );
      }
  } catch (err) {
    logDebug("Error on BATCH_RPT_FIRE_DAILY_INSPECTION.Err: " + err);
    logDebug("Stack Trace: " + err.stack);
  }
}
//___________________________________________________________________________________________________________
function elapsed(stTime) {
  var thisDate = new Date();
  var thisTime = thisDate.getTime();
  return (thisTime - stTime) / 1000;
}

function getParam(pParamName) {
  var ret = "" + aa.env.getValue(pParamName);
  logDebug("Parameter : " + pParamName + " = " + ret);
  return ret;
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
      } else {
        logDebug(
          "getStdChoiceArray: WARNING stdChoice " +
            stdChoice +
            " does not have items or items disabled."
        );
      }
    } else {
      logDebug(
        "getStdChoiceArray: WARNING stdChoice " + stdChoice + " is not found"
      );
    }
  } else {
    logDebug(
      "**ERROR: getting standard choice " +
        stdChoice +
        " :" +
        bizDomScriptResult.getErrorMessage()
    );
  }
  return stdChoiceArray;
}
