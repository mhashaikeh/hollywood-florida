function runReportAndAttachAsyncWaitTime(reportName, module, itemCap, reportParameters, docGroup, docType) {
    var scriptName = "RUNREPORTANDATTACHASYNCWAITTIME";
    var errorEmailTo = "";
    var debugEmailTo = errorEmailTo;
    var waitTime = 6000;

    logDebug("(runReportAndSendAsyncWaitTime) Setting environment variables.");
    var envParameters = aa.util.newHashMap();
    envParameters.put("ReportName", reportName);
    envParameters.put("ReportParameters", reportParameters);
    envParameters.put("Module", module);
    envParameters.put("CustomCapId", itemCap.getCustomID());
    envParameters.put("CapID", itemCap);
    envParameters.put("ReportUser", currentUserID);
    envParameters.put("docGroup", docGroup);
    envParameters.put("docType", docGroup);
    envParameters.put("ServProvCode", servProvCode);
    envParameters.put("ErrorEmailTo", errorEmailTo);
    envParameters.put("DebugEmailTo", debugEmailTo);
    envParameters.put("WaitTime", waitTime);

    aa.runAsyncScript(scriptName, envParameters, waitTime);
}