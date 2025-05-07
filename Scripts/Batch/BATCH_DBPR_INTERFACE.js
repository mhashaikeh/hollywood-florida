/*
 * JSHEAR 5/18/2024
 * Batch DBPR interface pulls state information for appropriate types
 * 
 */

/*------------------------------------------------------------------------------------------------------/
| Program: BATCH_DBPR_INTERFACE.js   
| Trigger: Batch

|
| Frequency: Daily
|
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
}
else {
    logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}

aa.includeScript("INCLUDES_BATCH");

var fullElectriciansFileUrl = "https://www2.myfloridalicense.com/sto/file_download/extracts/lic08el.csv";
var fullConstructionFileUrl = "https://www2.myfloridalicense.com/sto/file_download/extracts//CONSTRUCTIONLICENSE_1.csv";
var CONFIG = "CSV_CONFIG";

// begin main process


envsArr = loadEnvVars(true);
runJob = startJob();

if (runJob) {
        var capId;
        try {
                var currentUserID = "ADMIN"; //aa.env.getValue("CurrentUserID"); // Current User
                var systemUserObj = null; // Current User Object

                if (currentUserID != null) {
                        systemUserObj = aa.person.getUser(currentUserID).getOutput(); // Current User Object
                }

                //Serialize State Data
                var dbpr = {};
                var elecCsvContent = getCSVFile(fullElectriciansFileUrl);
                var concCsvContent = getCSVFile(fullConstructionFileUrl);
                serializeDBPRData(dbpr, concCsvContent, elecCsvContent);
                logDebug("DBPR Data Loaded: " + dbpr);

                //Load Occ Codes
                var validOccCodes = {};
                var ti = aa.bizDomain.getBizDomain("OCC_CODE_CLASS_CODE_TRANSLATION").getOutput();
                for (var i = 0; i < ti.size(); i++) {
                        var sco = ti.get(i);
                        if (sco.getAuditStatus() == "A") {
                                var licType = String(sco.getDispDescription());
                                validOccCodes[licType] = String(sco.getBizdomainValue());
                        }
                }
                logDebug("Occ Codes Loaded: " + validOccCodes);


                issuedLicenses();


        } catch (err) {
                logDebug("ERROR: " + err.message);
                handleError(err, "DBPR Batch");
        }
}

aa.print(debug);

endJob();

function issuedLicenses () {
    //Issued Lics
    logDebug("Issued Licenses-");
    var trackCapTypeModel = aa.cap.getCapTypeModel().getOutput();
    trackCapTypeModel.setGroup("Licenses");
    trackCapTypeModel.setType("Contractor");
    trackCapTypeModel.setSubType("State");
    trackCapTypeModel.setCategory("License");

    var trackCapModel = aa.cap.getCapModel().getOutput();
    trackCapModel.setCapType(trackCapTypeModel);
    //trackCapModel.setFileDate(aa.util.parseDate(issuedDate));

    var capIDListOutput = aa.cap.getCapIDListByCapModel(trackCapModel);
    if (capIDListOutput.getSuccess()) {
        capIDListOutput = capIDListOutput.getOutput();
        logDebug(capIDListOutput.length + " Found");

        for (var isl in capIDListOutput) {
            capId = aa.cap.getCapID(capIDListOutput[isl].getCapID().getID1(), capIDListOutput[isl].getCapID().getID2(), capIDListOutput[isl].getCapID().getID3());
            if (capId.getSuccess()) {
                capId = capId.getOutput();
                var icap = aa.cap.getCap(capId).getOutput();
                var iappTypeResult = icap.getCapType();
                var iappTypeString = iappTypeResult.toString();
                var iappTypeArray = iappTypeString.split("/");
                logDebug("On " + capId.getCustomID());

                if (!isValid(capId, validOccCodes)) {
                        logDebug("Skipped not valid OccCode");
                        continue;
                }

                if (icap.getCapStatus() == "Closed") {
                        logDebug("Skipped Closed");
                        continue;
                }

                var licfld = iappTypeArray[2] == "State" ? "State License Number" : "State Registration Number";
                var expfld = iappTypeArray[2] == "State" ? "State License Expiration Date" : "State Registration Expiration Date ";

                var licNum = getAppSpecific(licfld, capId).toUpperCase();
                var licType = getAppSpecific("License Category", capId);

                var stateData = dbpr[licNum];
                if (stateData) {
                    logDebug("Got State Data");
                    var stts = getStateStatus(stateData["Status"]);
                    var rlp = new licenseProfObject(licNum, licType, capId);
                    if (rlp.refLicModel) {
                            logDebug("syncingLP");
                            syncWStateFile(capId, rlp, dbpr);
                            rlp.copyToRecord(capId, true);
                            rlp.updateRecord();
                            var changeRenewStatus = setRenewalStatus(capId, rlp.refLicModel,stts[0]);
                            logDebug("Record Updated");
                    } else {
                            createRefLP(capId, dbpr);
                            if (createRefLP){
                                    var priContact = getContactObj(capId,"Qualifying Individual");
                                    var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
                                    var acaUrl = acaSite.replace("/Admin/login.aspx", "")
                                    if(priContact){
                                            var contactEmail = ""+priContact.capContact.getEmail();
                                            var params = aa.util.newHashtable();
                                            getDepartmentParams4Notification(params, "Licensing Department");
                                            cap = aa.cap.getCap(capId).getOutput();
                                            addParameter(params, "$$altID$$", cap.getCapID().getCustomID());
                                            addParameter(params, "$$recordAlias$$", cap.getCapType().getAlias());
                                            addParameter(params, "$$ContactName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
                                            addParameter(params, "$$acaRecordUrl$$", acaUrl);
                                            sendNotification("Accela@HollywoodFl.org",contactEmail,"","SS_LICENSE_ISSUED_REPORT",params,null,capId);
                                    }
                            }
                    }
                    if (!changeRenewStatus){
                        if (stts.length == 2) {
                            var currentStatus = icap.getCapStatus();
                            if (currentStatus != stts[1]) {
                                updateAppStatus(stts[1], "Set by DBPR Interface");
                            }

                            if (getTaskStatus("License Status", capId) != stts[1]) {
                                updateTask("License Status", stts[1], "Updated DBPR process", "");
                            }
                        }
                        var b1Exp = aa.expiration.getLicensesByCapID(capId);
                        if (b1Exp.getSuccess()) {
                                var b1Exp = b1Exp.getOutput();
                                if (b1Exp != null && b1Exp != undefined) {
                                    logDebug("setting Exp Status");
                                    var stateExpDate = aa.date.parseDate(stateData["License Expiration Date"]);
                                    if (b1Exp.getExpDate() != stateExpDate) {
                                        b1Exp.setExpDate(stateExpDate);
                                    }
                                    var newExpStatus = stts[0] == "A" ? "Active" : "Inactive";
                                    if (b1Exp.getExpStatus() != newExpStatus) {
                                        b1Exp.setExpStatus(newExpStatus);
                                    }
                                    aa.expiration.editB1Expiration(b1Exp.getB1Expiration());
                                }
                        }
                    }
                } else {
                    var currentStatus = icap.getCapStatus();
                    if (currentStatus != "Disabled"){
                        logDebug("No state data");
                        updateAppStatus("Disabled", "Set by DBPR Interface - No State Data");
                        var rlp = new licenseProfObject(licNum, licType, capId);
                        if (rlp.refLicModel) {
                                rlp.disable();
                                rlp.updateRecord();
                                logDebug("Setting LP to Disabled");
                        }
                                //Send Disabled Notification
                        var priContact = getContactObj(capId, "Qualifying Individual");
                        var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
                        var acaUrl = acaSite.replace("/Admin/login.aspx", "");

                        if (priContact) {
                            var contactEmail = "" + priContact.capContact.getEmail();
                            var params = aa.util.newHashtable();
                            getDepartmentParams4Notification(params, "Licensing Department");
                            cap = aa.cap.getCap(capId).getOutput();
                            addParameter(params, "$$altID$$", cap.getCapID().getCustomID());
                            addParameter(params, "$$recordAlias$$", cap.getCapType().getAlias());
                            addParameter(params, "$$ContactName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
                            addParameter(params, "$$acaRecordUrl$$", acaUrl);
                            sendNotification("Accela@HollywoodFl.org", contactEmail, "", "SS_LICENSE_DISABLED", params, null, capId);
                        }
                    }
                }
            }
        }
    }
}

function setRenewalStatus (inCapId, rlpm, lpStatus) {
    var expResult = aa.expiration.getLicensesByCapID(inCapId);
    var licNum = getAppSpecific("State License Number", inCapId);
    var returnValue = false;
    if (lpStatus == "A"){
        if (expResult.getSuccess()) {
                expResult = expResult.getOutput();
                var b1Exp = expResult.getB1Expiration();
                var thisCap;
                var cap = aa.cap.getCap(inCapId).getOutput();
                logDebug("capId: " + cap.getCapID().getCustomID());
                var currentCapStatus = cap.getCapStatus();
                logDebug("currentCapStatus: " + currentCapStatus);
                if (b1Exp == null) {
                        b1Exp = new com.accela.aa.license.expiration.B1ExpirationModel();
                        thisCap = aa.cap.getCap(inCapId).getOutput();
                        expBusiness = new com.accela.aa.license.expiration.ExpirationBusiness();
                        b1Exp = expBusiness.createB1ExpirationModel(inCapId, thisCap.getCapType(), "ADMIN");
                }
                if (b1Exp == null) {
                        logDebug("This record type " + thisCap.getCapType().toString() + " does not have an Expiration Code configured.");
                } else {
                        var earlyestDate = [];

                        var wceDt = getAppSpecific("Workers Compensation Expiration Date", inCapId);
                        var workCompExpDate;
                        if (wceDt) {
                                workCompExpDate = convertDate(wceDt);
                                earlyestDate.push(workCompExpDate);
                                var workCompExpDateFormat = (workCompExpDate.getMonth() + 1) + "/" + workCompExpDate.getDate() + "/" + workCompExpDate.getFullYear();
                        }

                        var ieDt = getAppSpecific("Insurance Expiration Date", inCapId);
                        var insExpDate;
                        if (ieDt) {
                                insExpDate = convertDate(ieDt);
                                earlyestDate.push(insExpDate);
                                var insExpDateFormat = (insExpDate.getMonth() + 1) + "/" + insExpDate.getDate() + "/" + insExpDate.getFullYear();
                        }

                        var slicDt = getAppSpecific("State License Expiration Date", inCapId);
                        
                        var stLicExpDate;
                        if (slicDt) {
                                stLicExpDate = convertDate(slicDt);
                                earlyestDate.push(stLicExpDate);
                                var stLicExpDateFormat = (stLicExpDate.getMonth() + 1) + "/" + stLicExpDate.getDate() + "/" + stLicExpDate.getFullYear();
                        }

                        if (earlyestDate.length > 0) {
                                earlyestDate = earlyestDate.sort(function (a, b) {return a - b;})[0];
                                var earliestDtFormat = (earlyestDate.getMonth() + 1) + "/" + earlyestDate.getDate() + "/" + earlyestDate.getFullYear();
                                logDebug("earliestDtFormat: " + earliestDtFormat);
                                var d = new Date();
                                d.setDate(d.getDate() + 30);
                                var today = new Date();
                                // is earliest date in the next 60 days
                                if (d >= earlyestDate && earlyestDate > today) {
                                    if (currentCapStatus != "About to Expire"){
                                        logDebug("Will attempt update of B1Expiration");
                                        b1Exp.setExpStatus("About to Expire");
                                        
                                        localUpdateAppStatus("About to Expire", "Updated DBPR process", inCapId);
                                        localUpdateTask("License Status", "About to Expire", "Updated DBPR process", "DBPR", inCapId);
                                        logDebug("<br> Status updated to \"About To Expire\"");
                                        var priContact = getContactObj(capId,"Qualifying Individual");
                                        var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
                                        var acaUrl = acaSite.replace("/Admin/login.aspx", "")
                                        if(priContact){
                                                var contactEmail = ""+priContact.capContact.getEmail();
                                                var params = aa.util.newHashtable();
                                                getDepartmentParams4Notification(params, "Licensing Department");
                                                addParameter(params, "$$altID$$", cap.getCapID().getCustomID());
                                                addParameter(params, "$$recordAlias$$", cap.getCapType().getAlias());
                                                addParameter(params, "$$ContactName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
                                                addParameter(params, "$$acaRecordUrl$$", acaUrl);
                                                addParameter(params, "$$ExpirationDate$$", earliestDtFormat);
                                                addParameter(params, "$$licenseExpirationDate$$", stLicExpDateFormat);
                                                addParameter(params, "$$wcExpirationDate$$", workCompExpDateFormat);
                                                addParameter(params, "$$glExpirationDate$$", insExpDateFormat);
                                                sendNotification("Accela@HollywoodFl.org",contactEmail,"","SS_LICENSE_ABOUT_TO_EXPIRE",params,null,capId);
                                        } 
                                    } 
                                    returnValue = true;   
                                } 
                                else if (today >= earlyestDate) {
                                    logDebug("currentStatus: " + currentCapStatus + " " + typeof(currentCapStatus));
                                    if (!licHasCondition("Status","Applied","Contractor - must update credentials",licNum)){
                                        addLicenseCondition_Rev("Status", "Contractor - must update credentials", licNum);
                                    }
                                    if (currentCapStatus != "Expired"){
                                        logDebug("within");
                                        // if the earliest date has passed
                                        logDebug("Will attempt update of B1Expiration");
                                        
                                        b1Exp.setExpStatus("About to Expire");
                                        
                                        localUpdateAppStatus("Expired", "Updated DBPR process", inCapId);
                                        localUpdateTask("License Status", "Expired", "Updated DBPR process", "DBPR", inCapId);
                                        logDebug("<br> Status updated to \"Expired\"");
                                        var priContact = getContactObj(capId,"Qualifying Individual");
                                        var acaSite = lookup("ACA_CONFIGS", "ACA_SITE");
                                        var acaUrl = acaSite.replace("/Admin/login.aspx", "")
                                        if(priContact){
                                                var contactEmail = ""+priContact.capContact.getEmail();
                                                var params = aa.util.newHashtable();
                                                getDepartmentParams4Notification(params, "Licensing Department");
                                                addParameter(params, "$$altID$$", cap.getCapID().getCustomID());
                                                addParameter(params, "$$recordAlias$$", cap.getCapType().getAlias());
                                                addParameter(params, "$$ContactName$$", priContact.capContact.firstName + " " + priContact.capContact.lastName);
                                                addParameter(params, "$$acaRecordUrl$$", acaUrl);
                                                addParameter(params, "$$ExpirationDate$$", earliestDtFormat);
                                                addParameter(params, "$$licenseExpirationDate$$", stLicExpDateFormat);
                                                addParameter(params, "$$wcExpirationDate$$", workCompExpDateFormat);
                                                addParameter(params, "$$glExpirationDate$$", insExpDateFormat);
                                                sendNotification("Accela@HollywoodFl.org",contactEmail,"","SS_LICENSE_EXPIRED",params,null,capId);
                                        }    

                                        
                                        rlpm.setAuditStatus("I");
                                    }
                                    returnValue = true;
                                }
                                else {
                                        // All dates more than 60 days away; Don't update the status (we may need to -reactivate the License here, since it should no longer be 'About to Expire' or 'Expired')
                                        //b1Exp.setExpStatus("Active");
                                        //localUpdateAppStatus("Active", "Updated DBPR process", inCapId);
                                        //localUpdateTask("License Status", "Active", "Updated DBPR process", "DBPR", "", inCapId);
                                        if (licHasCondition("Status","Applied","Contractor - must update credentials",licNum)){
                                            removeLicConditionStatus("Status","Contractor - must update credentials","Applied",licNum);
                                        }
                                        logDebug("<br> Status was not updated due to date outside range");
                                        rlpm.setAuditStatus("A");
                                        returnValue = false;
                                }

                                var sdt = aa.util.parseDate("" + (earlyestDate.getMonth() + 1) + "/" + earlyestDate.getDate() + "/" + earlyestDate.getFullYear());
                                b1Exp.setExpDate(sdt);
                                var updated = aa.expiration.editB1Expiration(b1Exp);
                                
                                if (updated.getSuccess()) {
                                        logDebug("Expiration and renewal updated");
                                } else {
                                        logDebug("Expiration and renewal NOT updated.  " + updated.getErrorMessage());
                                }

                        }

                        var tResult = aa.licenseScript.editRefLicenseProf(rlpm);
                        if (tResult.getSuccess()) {
                                logDebug("Lp Status Updated");
                        } else {
                                logDebug("Lp Status not updated, " + tResult.getErrorMessage());
                        }
                }
        } else {
                logDebug(expResult.getErrorMessage());
        }
    }
    return returnValue; 
}

function localUpdateAppStatus (stat, cmt, inCapId) {
        var updateStatusResult = aa.cap.updateAppStatus(inCapId, "APPLICATION", stat, aa.date.getCurrentDate(), cmt, aa.person.getUser("ADMIN").getOutput());
        if (updateStatusResult.getSuccess()) {
                logDebug("Updated application status to " + stat + " successfully.");
        } else {
                logDebug("**ERROR: application status update to " + stat + " was unsuccessful.  The reason is " + updateStatusResult.getErrorType() + ":" + updateStatusResult.getErrorMessage());
        }
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

function getCSVFile(fileURL) {
        var resultsArr = [];
        try {
                if (!fileURL || fileURL == null || fileURL == "") {
                        // Short Circuit if we have no URL
                        logDebug("Parameter 'fileURL' is missing. Process halted.");
                        return false;
                }

                var headers = aa.util.newHashMap();
                headers.put("User-Agent", "AccelaAutomation");

                var httpsRslt = aa.httpClient.get(fileURL, headers);
                if (httpsRslt.getSuccess()) {
                        httpsRslt = httpsRslt.getOutput();
                        var bytes = httpsRslt.getBytes();
                        var outputString = new java.lang.String(bytes);

                        var rows = outputString.split("\r\n");
                        if (rows.length > 1) {
                                for (var r in rows) {
                                        resultsArr.push(rows[r]);
                                }
                        }
                }

                return resultsArr;
        } catch (err) {
                logDebug("Error retrieving file using URL : " + fileURL + " ... ERROR: " + err.message);
                return false;
        }
}

function serializeDBPRData (dbpr, con, elec) {

        var splitData = function (ara) {
                var ln = ara.split("\",\"");
                for (var l in ln) {
                        var ti = String(ln[l]);
                        if (ti.indexOf('"') != -1) {
                                ti = ti.replace('"', "");
                        }
                }

                return ln;
        };

        var addToObject = function (ary, obj) {
                var lic = String(ary[20]).replace('"', "");
                var nameArray = String(ary[2]).split(", ");
                obj[lic] = {
                        "State License": ary[20].replace('"', "") || "",
                        "License Type": ary[1] + ary[4] || "",
                        "Business Name": ary[3] || "",
                        "License Expiration Date": ary[17],
                        "Status": ary[13] + ary[14] || "",
                        "License State": "FL",
                        "First Name": nameArray[1] ? nameArray[1].trim() : "",
                        "Last Name": nameArray[0] ? nameArray[0].trim() : "",
                        "Address Line 1": ary[5] || "",
                        "City": ary[8] || "",
                        "State": ary[9] || "",
                        "Zip Code": ary[10] || "",
                        "Birth Date": ary[15] || ""
                };
        };

        for (var a in con) {
                var iCon = splitData(con[a]);
                addToObject(iCon, dbpr);
        }

        for (var e in elec) {
                var iCon = splitData(elec[e]);
                addToObject(iCon, dbpr);
        }
}

function getStateStatus (stts) {
        var value = [];
        var result = lookup("DBPR_STATUS_DECISION", stts);
        if (result) {
                value = result.split(",");
        } else {
                logDebug("**WARN: can't find status skipping per specification: " + result.getErrorMessage());
        }
        return value;
}

function getPreviousDay (date) {
        const previousDay = new Date(date.getTime());
        previousDay.setDate(date.getDate() - 1);
        return dateFormatted(previousDay.getMonth() + 1, previousDay.getDate(), previousDay.getFullYear(), "MM/DD/YYYY");
}

function isValid (icapId, tstSt) {
        var licCat = getAppSpecific("License Category", icapId);

        return tstSt[licCat];
}

function syncWStateFile (iCapId, rlp, dbpr) {
        var tcap = aa.cap.getCap(iCapId).getOutput();
        var tappTypeResult = tcap.getCapType();
        var tappTypeString = tappTypeResult.toString();
        var tappTypeArray = tappTypeString.split("/");

        var licfld = tappTypeArray[2] == "State" ? "State License Number" : "State Registration Number";
        var expfld = tappTypeArray[2] == "State" ? "State License Expiration Date" : "State Registration Expiration Date ";

        var stateData = dbpr[rlp.refLicModel.getStateLicense()];
        if (stateData) {
                logDebug("Found State Data");
                var stateStts = getStateStatus(stateData["Status"]);
                if (stateStts.length == 2) {
                        if (stateStts[0] == "A") {
                                rlp.enable();
                        } else if (stateStts[0] == "I") {
                                rlp.disable();
                        }

                        // State Data
                        rlp.refLicModel.setAuditDate(sysDate);
                        rlp.refLicModel.setAuditID(currentUserID);
                        rlp.refLicModel.setStateLicense(stateData["State License"]);
                        rlp.refLicModel.setBusinessName(stateData["Business Name"]);
                        rlp.refLicModel.setLicenseExpirationDate(aa.date.parseDate(stateData["License Expiration Date"]));
                        rlp.refLicModel.setBusinessName2(stateStts[1]);
                        rlp.refLicModel.setLicState(stateData["License State"]);
                        rlp.refLicModel.setContactFirstName(stateData["First Name"]);
                        rlp.refLicModel.setContactLastName(stateData["Last Name"]);
                        rlp.refLicModel.setAddress1(stateData["Address Line 1"]);
                        rlp.refLicModel.setZip(stateData["Zip Code"]);

                        // State Data to capId
                        editAppSpecific(licfld, rlp.refLicModel.getStateLicense(), iCapId);
                        editAppSpecific(expfld, stateData["License Expiration Date"], iCapId);

                        // Insurance Company
                        var insCompany = getAppSpecific("Insurance Policy Number", iCapId);
                        rlp.refLicModel.setInsuranceCo(insCompany);

                        // Insurance Expiration Date
                        var insExpDate = getAppSpecific("Insurance Expiration Date", iCapId);
                        rlp.refLicModel.setInsuranceExpDate(aa.date.parseDate(insExpDate));

                        // Worker's Comp Policy #
                        var workCompPolicyNumber = getAppSpecific("Workers Compensation Number", iCapId);
                        rlp.refLicModel.setWcPolicyNo(workCompPolicyNumber);

                        // Worker's Comp Expiration Date
                        var workCompExpDate = getAppSpecific("Workers Compensation Expiration Date", iCapId);
                        rlp.refLicModel.setWcExpDate(aa.date.parseDate(workCompExpDate));

                        // Email
                        var aplcnt = getContactObj(iCapId, "Qualifying Individual");
                        if (aplcnt) {
                                rlp.refLicModel.setEMailAddress(aplcnt.people.getEmail());
                        }

                        rlp.updateRecord();
                        logDebug("Record Updated");
                } else {
                        logDebug("Disabled Invalid Status");
                        rlp.disable();
                        rlp.updateRecord();
                }
        } else {
                logDebug("Disabled No State Data");
                rlp.disable();
                rlp.updateRecord();
        }
}

function createRefLP (iCapId, dbpr) {
        logDebug("within1");
        var tcap = aa.cap.getCap(iCapId).getOutput();
        var tappTypeResult = tcap.getCapType();
        var tappTypeString = tappTypeResult.toString();
        var tappTypeArray = tappTypeString.split("/");

        var licfld = tappTypeArray[2] == "State" ? "State License Number" : "State Registration Number";
        var licExp = tappTypeArray[2] == "State" ? "State License Expiration Date" : "County License Expiration Date";
        var compExempt = getAppSpecific("Workers Compensation Exempt", iCapId) == "Yes" ? "Y" : "N";
        var licNum = getAppSpecific(licfld, iCapId);
        var licType = getAppSpecific("License Category", iCapId);
        var stateData = dbpr[licNum];
        if (stateData) {
                logDebug("Found State Data");
                var vNewLic = aa.licenseScript.createLicenseScriptModel();
                var stateStts = getStateStatus(stateData["Status"]);
                if (stateStts.length == 2) {
                        if (stateStts[0] == "A") {
                                vNewLic.setAuditStatus("A");
                        } else if (stateStts[0] == "I") {
                                vNewLic.setAuditStatus("I");
                        }
                }

                vNewLic.setAgencyCode(aa.getServiceProviderCode());
                vNewLic.setAuditDate(sysDate);
                vNewLic.setAuditID(currentUserID);
                vNewLic.setLicenseType(getAppSpecific("License Category", iCapId));
                vNewLic.setLicState(stateData["License State"]);
                vNewLic.setStateLicense(stateData["State License"]);
                vNewLic.setContactLastName(stateData["Last Name"]);
                vNewLic.setContactFirstName(stateData["First Name"]);
                vNewLic.setBusinessName2(stateStts[1]);
                vNewLic.setLicenseExpirationDate(aa.date.parseDate(stateData["License Expiration Date"]));
                vNewLic.setBusinessName(stateData["Business Name"]);
                vNewLic.setAddress1(stateData["Address Line 1"]);
                vNewLic.setZip(stateData["Zip Code"]);
                vNewLic.setBusinessLicExpDate(aa.date.parseDate(getAppSpecific(licExp, iCapId)));
                vNewLic.setInsuranceCo(getAppSpecific("Insurance Provider", iCapId));
                vNewLic.setPolicy(getAppSpecific("Insurance Policy Number", iCapId));
                vNewLic.setInsuranceExpDate(aa.date.parseDate(getAppSpecific("Insurance Expiration Date", iCapId)));
                vNewLic.setWcPolicyNo(getAppSpecific("Workers Compensation Number", iCapId));
                vNewLic.setWcExpDate(aa.date.parseDate(getAppSpecific("Workers Compensation Expiration Date", iCapId)));
                vNewLic.setContLicBusName(getAppSpecific("Workers Compensation Provider", iCapId));
                vNewLic.setWcExempt(compExempt);

                var aplcnt = getContactObj(iCapId, "Qualifying Individual");
                if (aplcnt) {
                        vNewLic.setEMailAddress(aplcnt.people.getEmail());
                }

                aa.licenseScript.createRefLicenseProf(vNewLic);
                var tmpLicObj = licenseProfObject(licNum, licType);
                if (tmpLicObj.valid) {
                        logDebug("Valid Done");
                        tmpLicObj.copyToRecord(iCapId, true);
                        return true;
                } else {
                        logDebug("Invalid Done");
                        return false;
                }
        }else{
                logDebug("No State Data Won't Create LP");
                return false;
        }
}

//INCLUDES BATCH

function logDebug(dstr) {
        if (showDebug) {
                aa.print(dstr)
                emailText += dstr + "<br>";
                aa.debug(aa.getServiceProviderCode() + " : " + aa.env.getValue("CurrentUserID"), dstr);
                //aa.eventLog.createEventLog("DEBUG", "Batch Process", batchJobName, aa.date.getCurrentDate(), aa.date.getCurrentDate(), "", dstr, batchJobID);
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

function getTaskStatus(taskName, itemCap) {
    var wfResult = aa.workflow.getTasks(itemCap);
    if (wfResult.getSuccess()) {
        var wfObj = wfResult.getOutput();
        for (var i in wfObj) {
            var fTask = wfObj[i];
            if (fTask.getTaskDescription().toUpperCase() == taskName.toUpperCase()) {
                return fTask.getDisposition();
            }
        }
    }
    return "";
}

function addLicenseCondition_Rev(cType, cDesc, licNum){
    // Optional 6th argument is license number, otherwise add to all CAEs on CAP
    var rfp = getRefLicenseProf(licNum);
    licSeq = rfp.getLicSeqNbr();

    if (licSeq){
        standardConditions = aa.capCondition.getStandardConditions(cType, cDesc).getOutput();
        for (i = 0; i < standardConditions.length; i++){
            if (standardConditions[i].getConditionType().toUpperCase() == cType.toUpperCase() && standardConditions[i].getConditionDesc().toUpperCase() == cDesc.toUpperCase()){ //EMSE Dom function does like search, needed for exact match
                standardCondition = standardConditions[i];
                var addCAEResult = aa.caeCondition.addCAECondition(licSeq, standardCondition.getConditionType(), standardCondition.getConditionDesc(), standardCondition.getConditionComment(), null, null, standardCondition.getImpactCode(), "Applied", sysDate, null, sysDate, sysDate, systemUserObj, systemUserObj, null, standardCondition.getDisplayConditionNotice(), standardCondition.getIncludeInConditionName(), standardCondition.getIncludeInShortDescription(), standardCondition.getInheritable(), standardCondition.getLongDescripton(), standardCondition.getPublicDisplayMessage(), standardCondition.getResolutionAction(), standardCondition.getConditionGroup(), standardCondition.getDisplayNoticeOnACA(), standardCondition.getDisplayNoticeOnACAFee())

                if (addCAEResult.getSuccess()){
                    logDebug("Successfully added licensed professional (" + licSeq + ") condition (Applied) " + cDesc);
                }else{
                    logDebug( "**ERROR: adding licensed professional (" + licSeq + ") condition (Applied): " + addCAEResult.getErrorMessage());
                }
            }
        }
    }else{
        logDebug("No reference link to license : " + refLicArr[refLic].getLicenseNbr());
    }  
}

function licHasCondition(pType,pStatus,pDesc,licNum){
    var rfp = getRefLicenseProf(licNum);
    licSeq = rfp.getLicSeqNbr();
    var conditionResult = aa.caeCondition.getCAEConditions(licSeq);
    if(conditionResult.getSuccess()){
        var conditions = conditionResult.getOutput();
        for(cond in conditions){
            if (pType.toUpperCase().equals(conditions[cond].getConditionType().toUpperCase()) && pStatus.toUpperCase().equals(conditions[cond].getConditionStatus().toUpperCase()) && pDesc.toUpperCase().equals(conditions[cond].getConditionDescription().toUpperCase())){
                return true; //matching condition found
            }
        }
        return false;
    }else{
        logDebug("**ERROR: getting LP conditions: " + conditionResult.getErrorMessage());
        return false;
    }
}

function removeLicConditionStatus(pType,pDesc,pStatus,licNum) {
    var rfp = getRefLicenseProf(licNum);
    licSeq = rfp.getLicSeqNbr();
    var conditionRemoved = false;
    var conditionResult = aa.caeCondition.getCAEConditions(licSeq);
    if(conditionResult.getSuccess()){
        var conditions = conditionResult.getOutput();
        for(cond in conditions){
            if (pType.toUpperCase().equals(conditions[cond].getConditionType().toUpperCase()) && pDesc.toUpperCase().equals(conditions[cond].getConditionDescription().toUpperCase()) && pStatus.toUpperCase().equals(conditions[cond].getConditionStatus().toUpperCase())){
                var rmLicCondResult = aa.caeCondition.removeCAECondition(conditions[cond].getConditionNumber(),licSeq);

                if (rmLicCondResult.getSuccess()){
                    conditionRemoved = true; // condition has been found and updated
                }           
            }
        }
    }

    if (conditionRemoved) {
        logDebug("Successfully removed condition from Lic : " + licNum + ". Condition Description:" + pDesc);
    } else {
        logDebug("ERROR: no matching condition found");
    }   
}