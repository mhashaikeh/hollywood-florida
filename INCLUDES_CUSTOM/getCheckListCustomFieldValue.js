function getCheckListCustomFieldValue(gsCustomFieldItem, gsCustomFieldGroup, itemCap) {
    //Optional Inspection ID
    if (arguments.length > 3) {
        inspIDNumArg = arguments[3];
        var useInspIdArg = true;
    } else {
        inspIDNumArg = null;
        var useInspIdArg = false;
    }
    var r = aa.inspection.getInspections(itemCap);
    if (r.getSuccess()) {
        var inspArray = r.getOutput();
        for (i in inspArray) {
            var inspModel = inspArray[i].getInspection();
            if (!useInspIdArg || inspModel.getIdNumber() == inspIDNumArg) {
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
                                                if (subGroupItem.getSubgroupCode() == gsCustomFieldGroup && asiItem.getAsiName() == gsCustomFieldItem) {
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