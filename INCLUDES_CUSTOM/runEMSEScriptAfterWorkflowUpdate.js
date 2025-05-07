function runEMSEScriptAfterWorkflowUpdate(itemCapId, user, taskName, taskStatus, processCode) {
    var emse = new com.accela.aa.emse.emse.EMSEBusiness();
    var parameters = aa.util.newHashtable();
    var ids = String(itemCapId).split("-");
    parameters.put("PermitId1", ids[0]);
    parameters.put("PermitId2", ids[1]);
    parameters.put("PermitId3", ids[2]);
    parameters.put("CurrentUserID", user);
    parameters.put("WorkflowTask", taskName);
    parameters.put("WorkflowStatus", taskStatus);
    parameters.put("PROCESSCODE", processCode);
    var result = emse.handleEvent("WorkflowTaskUpdateAfter", aa.getServiceProviderCode(), parameters, user, null);
}