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