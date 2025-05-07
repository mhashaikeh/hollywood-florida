/*------------------------------------------------------------------------------------------------------/
| Program: CLEAREXPIREDINCOMPLETECAP.js  Trigger: Batch
|
| Intent: When executed by the batch engine this script will delete incomplete records. The records 
|         removed are those left over from the "Save and Resume" feature. Completed records will not
|         be removed.
|
| Required Standard Choices: PARTIALLY_COMPLETED_CAP_PURGE_DAYS
|
| Version 1.0 - Base Version. From Accela Community posted by John Schomp 06/06/2012
|
/------------------------------------------------------------------------------------------------------*/
sysDateStart = aa.date.getCurrentDate();
batchJobResult = aa.batchJob.getJobID();
batchJobName = "" + aa.env.getValue("BatchJobName");
batchJobDesc = "" + aa.env.getValue("BatchJobDesc");

batchJobID = 0;
if (batchJobResult.getSuccess()) {
    batchJobID = batchJobResult.getOutput();
    aa.print("Batch Job: " + batchJobName + ", Job ID: " + batchJobID);
}
else
    aa.print("Batch job ID not found " + batchJobResult.getErrorMessage());

var removeResult = aa.cap.removeExpiredIncompleteCAP();

if (removeResult.getSuccess()) {
    sysDateEnd = aa.date.getCurrentDate();
    aa.print("Completed Successfully");
    aa.env.setValue("ScriptReturnCode", "0");
    aa.env.setValue("ScriptReturnMessage", "Successfully removed incomplete records.");
    //aa.eventLog.createEventLog("Remove Incomplete Records", "Batch Process", batchJobName, sysDateStart, sysDateEnd, batchJobDesc, batchJobResult, batchJobID);
}
else {
    aa.print("Failed");
    aa.env.setValue("ScriptReturnCode", "1");
    aa.env.setValue("ScriptReturnMessage", "Falied removing incomplete records.");
}