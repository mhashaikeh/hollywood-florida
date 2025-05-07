/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_PERMIT_APPLICATION_EXPIRATION.js   
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
var asiSubgroupName = getParam("asiSubgroupName");
var asiField = getParam("asiField");
var daySpan = getParam("daySpan");
var lookAheadDays = getParam("lookAheadDays");
var startDate = new Date();
var timeExpired = false;
var startTime = startDate.getTime();
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var currentUserID = "ADMIN"
var procCount = 0;
var skipAppStatus = getParam("skipAppStatus").split(","); //   Skip records with one of these application statuses
var skipAppStatusCont = getParam("skipAppStatusCont").split(",");
var skipAppStatusArray = skipAppStatus.concat(skipAppStatusCont);
var skipRecordAlias = getParam("skipRecordAlias").split(","); //   Skip records with defined record alias
var emailAddress = getParam("emailAddress"); // email to send report
var sendEmailToContactTypes = getParam("sendEmailToContactTypes"); // ALL,PRIMARY, or comma separated values
var emailTemplate = getParam("emailTemplate"); // email Template
var sendEmailNotifications = getParam("sendEmailNotifications");
var sysFromEmail = getParam("sysFromEmail");
var newAppStatus = getParam("newAppStatus"); //   update the CAP to this status


var fromDate = dateAdd(null,parseInt(lookAheadDays));
var toDate = dateAdd(fromDate,parseInt(daySpan));
fromJSDate = new Date(fromDate);
toJSDate = new Date(toDate);
var dFromDate = aa.date.parseDate(fromDate);
var dToDate = aa.date.parseDate(toDate);
logDebug("fromDate: " + fromDate + "  toDate: " + toDate)

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
    
    try {
        var capCount = 0;
        var capFilterStatus = 0;
        var expResult = aa.cap.getCapIDsByAppSpecificInfoDateRange(asiSubgroupName, asiField, dFromDate, dToDate);

        if(expResult.getSuccess()) {
            capIdArray = expResult.getOutput();
            logDebug("Processing " + capIdArray.length + " permit records");
        } else {
            logDebug("ERROR: Getting Expirations, reason is: " + expResult.getErrorType() + ":" + expResult.getErrorMessage());
            return false;
        }

        for (i in capIdArray) {
            if (elapsed() > maxSeconds) { // only continue if time hasn't expired
                logDebug("WARNING","A script timeout has caused partial completion of this process.  Please re-run.  " + elapsed() + " seconds elapsed, " + maxSeconds + " allowed.") ;
                timeExpired = true;
                break;
            }

            capId = capIdArray[i].getCapID(); // CapIDModel Object
            if (!capId) {
                logDebug("Could not get Cap ID");
                continue;
            }
            capIDString = capId.getCustomID();
            altId = capId.getCustomID(); // Alternate Cap ID string
            logDebug("Processing " + altId);

            if (!capId) {
                logDebug("Could not get Cap ID");
                continue;
            }

            cap = aa.cap.getCap(capId).getOutput();
            capStatus = cap.getCapStatus();
            appTypeAlias = cap.getCapType().getAlias();
            appTypeResult = cap.getCapType();
            appTypeString = appTypeResult.toString();
            logDebug(appTypeString);
            appTypeArray = appTypeString.split("/");

             // Filter by CAP Status
             if (exists(appTypeAlias,skipRecordAlias)) {
                capFilterStatus++;
                logDebug(altId + ": skipping due to record Type " + capStatus)
                continue;
            }

            // Filter by CAP Alias
             if (exists(capStatus,skipAppStatusArray)) {
                capFilterStatus++;
                logDebug(altId + ": skipping due to record status of " + capStatus)
                continue;
            }

            capCount++;

            if (matches(getAppSpecific("Permit Issued Date"),null,undefined,"")){
                if (appTypeArray[0] != "Licenses") {
                    if (newAppStatus.length > 0) {
                        updateAppStatus(newAppStatus, "", capId);
                    }
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
                                    addParameter(eParams, "$$defExpDate$$", getAppSpecific(asiField, capId));
                                    
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
            }
        }
    logDebug("Total number of Permits Processed: " + capCount + br);
    }
    catch (err) {
        logDebug("Error on BATCH_PERMITS_EXPIRED.Err: " + err);
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
