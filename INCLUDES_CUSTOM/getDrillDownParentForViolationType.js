function getDrillDownParentForViolationType(violationTypeValue) {
    try {
        eval(getScriptText("INCLUDE_CONFIG_API"));
        var childBizDomain = "ENF_CASE_ABBREV_TYPES";
        var parentBizDomain = "ENF_VIOLATION_CATEGORY";
        var childChoices = ConfigEngineAPI.searchStandardChoiceValueModel(childBizDomain, false);
        var childSeqNbr = false;
        for (var i in childChoices) {
            if (childChoices[i]["BIZDOMAIN_VALUE"] == violationTypeValue) {
                childSeqNbr = childChoices[i]["BDV_SEQ_NBR"];
                break;
            }
        }
        if (!childSeqNbr) return false;
        var drillDownMappings = ConfigEngineAPI.searchDrillDownMapping_BY_DDL_C(childSeqNbr, false);
        if (!drillDownMappings || drillDownMappings.length == 0) return fasle;
        var parentSeqNbr = drillDownMappings[0]["PARENT_VAL_ID"];
        var parentChoices = ConfigEngineAPI.searchStandardChoiceValueModel(parentBizDomain, false);
        for (var i in parentChoices) {
            if (parentChoices[i]["BDV_SEQ_NBR"] == parentSeqNbr) {
                return parentChoices[i]["BIZDOMAIN_VALUE"];
            }
        }
        return false;
    } catch (e) {
        logDebug("Error in getDrillDownParentForViolationType: " + e);
        return false;
    }
}