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