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