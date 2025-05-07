function getWfProcessCodeByCapId(itemCapId){
    var wfObj = aa.workflow.getTasks(itemCapId).getOutput();
    return wfObj[0].getProcessCode();
}