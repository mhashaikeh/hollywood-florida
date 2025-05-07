/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_NON_DBPR_EXPIRATIONS.js   
| Trigger: Batch
|
| Frequency: Daily
|
/------------------------------------------------------------------------------------------------------*/

var emailText = "";
var debugText = "";
var debug = "";
var showDebug = 3;
var showMessage = false;
var message = "";
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
} else {
    logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}

aa.includeScript("INCLUDES_BATCH");

// begin main process

var envsArr = loadEnvVars(true);
var runJob = startJob();

if (runJob) {
    var capId;
    try {
        var currentUserID = "ADMIN"; 
        var systemUserObj = null; 

        if (currentUserID != null) {
            systemUserObj = aa.person.getUser(currentUserID).getOutput(); 
        }

        // Load Occ Codes
        var validOccCodes = loadValidOccCodes();
        logDebug("Occ Codes Loaded: " + validOccCodes);

        // Pull dates
        var run_date = envsArr["RUN_DATE"] || getPreviousDay(new Date(sysDate.getEpochMilliseconds()));
        var expiredDate = run_date;

        var aboutToExpireDate = formatDateWithLeadingZeros(dateAdd(run_date, 30));

        logDebug("Dates set: " + run_date + ", " + expiredDate + ", " + aboutToExpireDate);

        // Process about to expire licenses
        processLicenses("aboutToExpire", aboutToExpireDate, validOccCodes);

        // Process expired licenses
        processLicenses("expired", expiredDate, validOccCodes);

    } catch (err) {
        logDebug("ERROR: " + err.message + " at " + err.stack);
        handleError(err, "DBPR Batch");
    }
}

aa.print(debug);

endJob();

// Function to load valid Occupation Codes
function loadValidOccCodes() {
    var validOccCodes = {};
    var ti = aa.bizDomain.getBizDomain("OCC_CODE_CLASS_CODE_TRANSLATION").getOutput();
    for (var i = 0; i < ti.size(); i++) {
        var sco = ti.get(i);
        if (sco.getAuditStatus() == "A") {
            var licType = String(sco.getDispDescription());
            validOccCodes[licType] = String(sco.getBizdomainValue());
        }
    }
    return validOccCodes;
}

// General function to process licenses (both about to expire and expired)
function processLicenses(type, date, validOccCodes) {
    var licenseFields = [
        "Workers Compensation Expiration Date", 
        "State Registration Expiration Date", 
        "Insurance Expiration Date", 
        "State License Expiration Date", 
        "County License Expiration Date"
    ];

    var licenses = [];
    for (var i = 0; i < licenseFields.length; i++) {
        var fieldName = licenseFields[i];
        var result = getExpiredLicenses(fieldName, date, validOccCodes);
        licenses = licenses.concat(result);
    }

    logDebug(licenses.length + " " + type + " licenses found.");

    for (var el in licenses) {
        capId = licenses[el].getCapID();
        processLicenseExpiration(capId, type, date);
    }
}

// Function to retrieve expired licenses based on field name
function getExpiredLicenses(fieldName, date, validOccCodes) {
    var expiredList = [];
    var result = aa.cap.getCapIDsByAppSpecificInfoField(fieldName, date);
    if (result.getSuccess()) {
        var caps = result.getOutput();
        for (var l in caps) {
            if (!isValid(caps[l].getCapID(), validOccCodes)) {
                expiredList.push(caps[l]);
            }
        }
    }
    return expiredList;
}

// Function to handle license expiration (for both "about to expire" and "expired")
function processLicenseExpiration(capId, type, expDate) {
    var icap = aa.cap.getCap(capId).getOutput();
    var iappTypeResult = icap.getCapType();
    var iappTypeArray = iappTypeResult.toString().split("/");

    logDebug("Processing " + icap.getCapID().getCustomID());

    if (icap.getCapStatus() == "Closed") {
        logDebug("Skipped Closed");
        return;
    }

    if (iappTypeArray[3] != "License") {
        logDebug("Skipped Non-License");
        return;
    }

    var b1Exp = aa.expiration.getLicensesByCapID(capId).getOutput();
    if (b1Exp != null) {
        b1Exp.setExpDate(aa.date.parseDate(expDate));
        b1Exp.setExpStatus(type === "aboutToExpire" ? "About to Expire" : "Expired");
        aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
    }

    updateAppStatus(type == "aboutToExpire" ? "About to Expire" : "Expired", "Set by DBPR Interface");
    localUpdateTask("License Status", type == "aboutToExpire" ? "About to Expire" : "Expired", "Updated DBPR process", "DBPR", capId);

    var priContact = getContactObj(capId, "Qualifying Individual");
    sendLicenseNotification(capId, priContact, type == "aboutToExpire" ? "SS_LICENSE_ABOUT_TO_EXPIRE" : "SS_LICENSE_EXPIRED", expDate);
}

// Function to send notifications for license expiration
function sendLicenseNotification(capId, contact, template, expDate) {
    if (contact) {
        var params = aa.util.newHashtable();
        getDepartmentParams4Notification(params, "Licensing Department");
        var cap = aa.cap.getCap(capId).getOutput();
        addParameter(params, "$$altID$$", cap.getCapID().getCustomID());
        addParameter(params, "$$recordAlias$$", cap.getCapType().getAlias());
        addParameter(params, "$$ContactName$$", contact.capContact.firstName + " " + contact.capContact.lastName);
        addParameter(params, "$$ExpirationDate$$", expDate);
        var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
        var acaUrl = acaSite.replace("/Admin/login.aspx", "");
        addParameter(params, "$$acaRecordUrl$$", acaUrl);
        sendNotification("Accela@HollywoodFl.org", contact.capContact.getEmail(), "", template, params, null, capId);
    }
}

// Utility function to format date with leading zeros
function formatDateWithLeadingZeros(dateString) {
    var dateParts = dateString.split('/');
    return addLeadingZero(parseInt(dateParts[0])) + '/' + addLeadingZero(parseInt(dateParts[1])) + '/' + dateParts[2];
}

function getPreviousDay(date) {
    const previousDay = new Date(date.getTime());
    previousDay.setDate(date.getDate() - 1);
    return dateFormatted(previousDay.getMonth() + 1, previousDay.getDate(), previousDay.getFullYear(), "MM/DD/YYYY");
}

function isValid(icapId, validOccCodes) {
    var licCat = getAppSpecific("License Category", icapId);
    return validOccCodes[licCat];
}

//INCLUDES BATCH

function logDebug(dstr) {
        if (showDebug) {
                aa.print(dstr)
                emailText += dstr + "<br>";
                aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
                aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(), "", dstr, batchJobID);
        }
}

function loadEnvVars(logFlag) {
    var newArr = [];
    var params = aa.env.getParamValues();
    var keys = params.keys();
    var key = null;
    while (keys.hasMoreElements()) {
        key = keys.nextElement();
        var keyValue = aa.env.getValue(key);
        newArr[key] = keyValue;
        if (logFlag) {
            logDebug("Loaded parameter " + key + " = " + keyValue);
        }
    }
    return newArr;
}

// Utility function to add leading zero
function addLeadingZero(num) {
    return num < 10 ? '0' + num : num;
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

function localUpdateTask (wfstr, wfstat, wfcomment, wfnote, itemCap) 
{
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
