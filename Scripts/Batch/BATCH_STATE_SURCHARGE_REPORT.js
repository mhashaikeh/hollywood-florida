/*----------------------------------------------------------------------------------------------------------------------/
| Program: 		BATCH_RPT_STATE_SURCHARGE_QUARTERLY_NOTIFICATION.js
| Trigger: 		Batch: Quarterly State Surcharge Report
| Client:  		Hollywood, FL
| Date:			11/25/2024
| Version: 		Base Version 1.0
| Author:  		Stephanie Almodovar - Accela MAS team
| Description:	
| Once every 3 months, the State Surcharge will be generated and emailed to specified agency contacts.
| The report will run the day after a quarter completes and then email out the previous quarter report.
| Ex: A report run on April 1, will generate for Quarter 1, dates January 1 to March 31.
---------------------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_STATE_SURCHARGE_REPORT.js   
| Trigger: Batch

|
| Frequency: Monthly
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
var toEmailString = lookup(emailSTD, "STATE_SURCHARGE_RECIPIENT");
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

function getPreviousQuarterDates() {
  var currentDate = new Date();
  var currentYear = currentDate.getFullYear();
  var currentMonth = currentDate.getMonth();

  var currentQuarter;
  if (currentMonth < 3) {
    currentQuarter = 1;
  } else if (currentMonth < 6) {
    currentQuarter = 2;
  } else if (currentMonth < 9) {
    currentQuarter = 3;
  } else {
    currentQuarter = 4;
  }

  var previousQuarter;
  var reportStartDate;
  var reportEndDate;

  if (currentQuarter === 1) {
    previousQuarter = 4;
    reportStartDate = new Date(currentYear - 1, 9, 1);
    reportEndDate = new Date(currentYear - 1, 11, 31);
  } else if (currentQuarter === 2) {
    previousQuarter = 1;
    reportStartDate = new Date(currentYear, 0, 1);
    reportEndDate = new Date(currentYear, 2, 31);
  } else if (currentQuarter === 3) {
    previousQuarter = 2;
    reportStartDate = new Date(currentYear, 3, 1);
    reportEndDate = new Date(currentYear, 5, 30);
  } else {
    previousQuarter = 3;
    reportStartDate = new Date(currentYear, 6, 1);
    reportEndDate = new Date(currentYear, 8, 30);
  }
  function formattedDate(date) {
    var d = new Date(date || Date.now()),
      month = "" + (d.getMonth() + 1),
      day = "" + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [month, day, year].join("/");
  }

  return {
    reportStartDate: formattedDate(reportStartDate),
    reportEndDate: formattedDate(reportEndDate),
  };
}

var quarterDates = getPreviousQuarterDates();
var reportStartDate = quarterDates.reportStartDate;
var reportEndDate = quarterDates.reportEndDate;
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
    if (
      today == "01/01" ||
      today == "04/01" ||
      today == "07/01" ||
      today == "10/01"
    ) {
      var reportResult = aa.reportManager.getReportInfoModelByName(reportName);
      if (reportResult.getSuccess()) {
        var rFiles = [];
        var report = reportResult.getOutput();
        report.setModule("Building");
        var rParams = aa.util.newHashMap();
        rParams.put("StartDate", reportStartDate);
        rParams.put("EndDate", reportEndDate);
        report.setReportParameters(rParams);
        var reportResult = aa.reportManager.getReportResult(report);
        if (reportResult) {
          reportOutput = reportResult.getOutput();
          var reportFile = aa.reportManager.storeReportToDisk(reportOutput);
          rFile = reportFile.getOutput();
          rFiles.push(rFile);

          var params = aa.util.newHashtable();
          addParameter(params, "$$StartDate$$", reportStartDate);
          addParameter(params, "$$EndDate$$", reportEndDate);
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
    } else
      logDebug(
        "Report will not run unless date is 01/01, 04,01, 07/01, 10,01."
      );
  } catch (err) {
    logDebug("Error on BATCH_STATE_SURCHARGE_REPORT.Err: " + err);
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
