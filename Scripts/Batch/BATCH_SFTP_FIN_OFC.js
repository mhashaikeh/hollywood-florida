/*
BATCH_SFTP_FIN_OFC

Uses Accela PS SFTP Service to push daily financial data to FTP site.

~ Revisions ~
jcrussell		2024-08-09		Changes to log report results and STOP sending empty file.

*/



//////// aa.env.setValue("TransactionsDate","06/03/2024"); //// used for testing only

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~ Accela Package Includes ~~~~~~~~~~~~
if(typeof SFTP === "undefined"){
    aa.includeScript('SFTP_ACCELA');
}
const ACCELA_SFTP = new SFTP(false);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~ Initial Definition of Vars and Functions ~~~~~~~~~~~~
// Define logDebug so something will show up on logs.
if (typeof logDebug === 'undefined') {
	function logDebug(inMessage) {
		aa.print(inMessage + "<br/>");
	}
}

// const FTP_CREDS_STD_CHOICE = 'SFTP_MFT_HOLLYWOODFL_ACCELABLDG';
const FTP_CREDS_STD_CHOICE = 'SFTP_OIC_HOLLYWOODFL_TEST';
// const FTP_CREDS_STD_CHOICE = 'SFTP_OIC_HOLLYWOODFL_PROD';
// const FTP_CREDS_STD_CHOICE = 'SFTP_ACCELA_SERVICE_TEST';
const FTP_EXTENDED_DIR = "";
const REPORT_MODULE_SETTING = "Building";
const REPORT_EXECUTION_USER = "ADMIN";
const TRANSACTION_DT_PARM_NAME = "TransactionsDate" // this will be the Batch Parameter Name to use.
// const FILE_NAME_TMPLT = "{{dtRun}}_0000000_0000000_{{idChar}}_{{dtTrans}}_OracleFusion.txt";
const FILE_NAME_TMPLT = "{{idChar}}_{{dtTrans}}_OracleFusion.txt";
const THIS_PROCESS_ID_CHAR = "BL";
const NOW = aa.util.now();
const REPORTNAME = "Reconciliation - Oracle Fusion";

var exportFileName = "";
var haltProcess = false;
var transactionDate = null;

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~ Fetch Parameters ~~~~~~~~~~~~
// Set the Transaction Date for Report
var parmRslt = getParameterTransactionDate();
// logDebug(JSON.stringify(parmRslt));
if (parmRslt.error == null) {
	// Set the variable transactionDate
	if (parmRslt.isParameterSupplied) {
		transactionDate = parmRslt.transactionDate;
	} else {
		// We set the date to Yesterday
		var yesterdayAtThisTime = new java.util.Date(NOW.getTime() - (1000*60*60*24));
		transactionDate = aa.util.formatDate(yesterdayAtThisTime,"MM/dd/yyyy");
	}
} else {
	haltProcess = true;
	logDebug("ERROR fetching parameter : " + parmRslt.error);
}

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~ Perform Process ~~~~~~~~~~~~
if (!haltProcess) {
	// exportFileName = ""+FILE_NAME_TMPLT.replace("{{dtRun}}",aa.util.formatDate(NOW,"MMddyyyy")).replace("{{idChar}}",THIS_PROCESS_ID_CHAR).replace("{{dtTrans}}",(transactionDate.replace("/","")));
	exportFileName = ""+FILE_NAME_TMPLT.replace("{{idChar}}",THIS_PROCESS_ID_CHAR).replace("{{dtTrans}}",(transactionDate.replace("/","")));
	
	/*
	// APPEARS THAT IF THE FILENAME LEADS WITH ZERO (MONTH LESS THAN OCT) THEN REMOVE IT.
	// un-comment below to make that happen!!!!
	if (exportFileName.substring(0,1) == "0") {
		exportFileName = exportFileName.substring(1);
	}
	*/

	var processRslt = performProcess(transactionDate,exportFileName);
} else {
	logDebug("PROCESSING HALTED");
}


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~ PROCESS METHODS ~~~~~~~~~~~~

/**
 * Method to perform the full Batch process
 */
function performProcess (inTransactionDate, inExportFileName) {
	logDebug("WILL perform the process with date " + inTransactionDate + "  and file name : " + inExportFileName) ;

	/* ------------------ FILE FROM REPORT EXECUTION -------------------- */
	// Check that this user may trigger report
	var permit = aa.reportManager.hasPermission(REPORTNAME, REPORT_EXECUTION_USER);
	if (permit.getOutput().booleanValue()) {
		var report = aa.reportManager.getReportInfoModelByName(REPORTNAME);
		report = report.getOutput();
		
		report.setModule(REPORT_MODULE_SETTING);
		var parameters = aa.util.newHashMap();
		//// ~~~~~~~~~~ REPORT PARAMETERS - START ~~~~~~~~~~~~
		parameters.put("TranDate", inTransactionDate);
		//// ~~~~~~~~~~ REPORT PARAMETERS - END ~~~~~~~~~~~~~~

		report.setReportParameters(parameters);
		var reportResult = aa.reportManager.getReportResult(report);
		if (reportResult.getSuccess()) {
			var reportOut = reportResult.getOutput();
			var reportContent = reportOut.getContent();
			try{
				// logDebug(reportOut.getFormat());
				var origContentString = ("" + (new java.lang.String(reportContent)));
				var theseRows = origContentString.split("\n");
				// IF WE KNOW OF ANY ROWS WHICH SHOULD BE ELIMINATED, DO SO NOW!
				// WE WILL ELIMINATE ROW WITH HEADERS THAT LOOK LIKE THIS:
				// ACCTCODE1
				// Textbox6,Textbox259
				theseRows = theseRows.filter(function (el) {
					var badRow01 = el.indexOf("ACCTCODE1") > -1 ;
					var badRow02 = el.indexOf("Textbox6,Textbox259") > -1 ;
					return (!badRow01 && !badRow02);
				});

				// NOW, we must break remaining rows by  comma.
				var finalFullString = "" + theseRows.filter(function (elem,idx) {
					return elem != null && (""+elem).trim() != "";
				}).join("\n").replace(/,/g,"\n");

				// JCRUSSELL - 2024-08-09 - NO NOT SEND EMPTY FILES - BEGIN
				
				//// WE ARE SENDING AN EMPTY LINE IF THERE IS NO DATA.
				//// SFTP WILL NOT SEND COMPLETELY EMPTY CONTENTS. 
				//// IF THEY WANT NO FILE ON THE SERVER IF THERE WAS NO DATA THEN COMMENT THIS OUT.
				// if(finalFullString.trim() == ""){
				// 	finalFullString = "\n";
				// }

				if(finalFullString.trim() != ""){
					//// SFTP UPLOAD ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
					
					// we have learned that the service can return a 'success' result even when there was not.
					// we will try to connect/list and if there is a failure there we will halt

					logDebug("report '"+REPORTNAME+"' using date "+transactionDate+" resulted in the following:");
					finalFullString.split("\n").forEach(function (rowElem) {
						logDebug(rowElem);
					});
	
					var listResultString = ACCELA_SFTP.list(FTP_CREDS_STD_CHOICE,FTP_EXTENDED_DIR);
					try {
	
						var listResult = JSON.parse(listResultString);
						
						// for (var idx in listResult) {
						// 	logDebug(listResult[idx].name);
						// }
						
						// IF THERE WAS NO ERROR PARSING RESULTS WE ARE STILL HERE... WE SHALL CONTINUE
						var result = ACCELA_SFTP.upload(FTP_CREDS_STD_CHOICE,inExportFileName,finalFullString,false,FTP_EXTENDED_DIR);
						logDebug("SFTP Result : " + result); 
					} catch (err) {
						logDebug("THERE WAS AN ISSUE CONNECTING TO FTP SITE : " + listResultString);
						logDebug("Resolve this issue with FTP site and/or credentials used.")
					}
				} else {
					logDebug("There was no data for execution of report '"+REPORTNAME+"' using date "+transactionDate);
				}
				// JCRUSSELL - 2024-08-09 - NO NOT SEND EMPTY FILES - END
				
			} catch (err) {
				logDebug("File operations fail : " + err);
			}
		} else {
			logDebug("ISSUE WITH REPORT : " + reportResult.getErrorMessage());
		}
	} else {
		logDebug("User " + REPORT_EXECUTION_USER + " does not have permission to execute this report.");
	}
}


/**
 * Method will find env var for Transaction Date (parameter supplied to batch) 
 * and will test that it is good. If not, an 'error' property will be populated.
 * @returns object Properties of 'isParameterSupplied','transactionDate','error'
 */
function getParameterTransactionDate () {
	returnObj = {
		isParameterSupplied : null,
		transactionDate : null,
		error : null
	};
	const IN_TRANSACTION_DATE = (""+aa.env.getValue(TRANSACTION_DT_PARM_NAME)).trim();
	if (IN_TRANSACTION_DATE != null && (""+IN_TRANSACTION_DATE).trim() != "") {
		returnObj.isParameterSupplied = true;
		// supplied date should look like :  06/12/2024 MM/dd/yyyy
		try {
			var dtParts = IN_TRANSACTION_DATE.split("/");
			var goodMonth = (parseInt((""+dtParts[0]),10) > 0 && parseInt((""+dtParts[0]),10) <= 12);
			var goodDay = (parseInt((""+dtParts[1]),10) > 0 && parseInt((""+dtParts[1]),10) <= 31);
			var goodYear = (parseInt((""+dtParts[2]),10) > 0 && parseInt((""+dtParts[1]),10) <= 9999);
			if (goodMonth && goodDay && goodYear) {
				// Final Check
				var myNewDate = aa.util.parseDate(""+IN_TRANSACTION_DATE);
				if (myNewDate != null) {
					returnObj.transactionDate = aa.util.formatDate(myNewDate,"MM/dd/yyyy")
				} else {
					returnObj.error = "Error in parameter '" + TRANSACTION_DT_PARM_NAME + "' - There was an issue parsing the date. Supply format MM/dd/yyyy.";
				}
			} else {
				returnObj.error = "Error in parameter '" + TRANSACTION_DT_PARM_NAME + "' - There was an issue parsing the date. Supply format MM/dd/yyyy with proper values for each.";
			}
		} catch (err) {
			returnObj.error = "Error in parameter '" + TRANSACTION_DT_PARM_NAME + "' - Supply a date in format MM/dd/yyyy."
		}
	} else {
		returnObj.isParameterSupplied = false;
	}
	return returnObj;
}

function mmm(obj) {
    var idx;
    var rtnStr = "";
    if (obj.getClass != null) {
        rtnStr += ("************* " + obj.getClass() + " *************") + "\n";
    }
    for (idx in obj) {
        try {
            if (typeof (obj[idx]) == "function") {
                try {
                    rtnStr += (idx + "==>  " + obj[idx]()) + "\n";
                } catch (ex) { }
            } else {
                rtnStr += (idx + ":  _" + obj[idx] + "_") + "\n";
            }
        } catch (er) { }
    }
    return rtnStr;
}
