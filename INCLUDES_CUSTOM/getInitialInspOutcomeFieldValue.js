function getInitialInspOutcomeFieldValue(itemCap) {
    var r = aa.inspection.getInspections(itemCap);
    if (r.getSuccess()) {
        var inspArray = r.getOutput();
        for (i in inspArray) {
            var inspType = inspArray[i].getInspectionType();
            if (String(inspType) == "Initial Inspection") {
                var inspModel = inspArray[i].getInspection();
                var gs = inspModel.getGuideSheets();
                if (gs) {
                    for (var i = 0; i < gs.size(); i++) {
                        var guideSheetObj = gs.get(i);
                        var guidesheetItem = guideSheetObj.getItems();
                        for (var j = 0; j < guidesheetItem.size(); j++) {
                            var item = guidesheetItem.get(j);
                            if (item.getItemASISubgroupList() != null) {
                                var subGroupList = item.getItemASISubgroupList();
                                if (subGroupList != null) {
                                    for (var index = 0; index < subGroupList.size(); index++) {
                                        var subGroupItem = subGroupList.get(index);
                                        if (subGroupItem != null) {
                                            var asiList = subGroupItem.getAsiList();
                                            for (var asiIndex = 0; asiIndex < asiList.size(); asiIndex++) {
                                                var asiItem = asiList.get(asiIndex);
                                                if (subGroupItem.getSubgroupCode() == "INVESTIGATION INFORMATION" && asiItem.getAsiName() == "Outcome") {
                                                    if (asiItem.getAttributeValue() != null && asiItem.getAttributeValue() != "") {
                                                        return asiItem.getAttributeValue();
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return null;
}