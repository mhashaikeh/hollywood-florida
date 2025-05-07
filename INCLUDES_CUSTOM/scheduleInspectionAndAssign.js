function scheduleInspectionAndAssign(itemCapId, inspType, inspDate, iName) {
	var schedRes = aa.inspection.scheduleInspection(itemCapId, null, aa.date.parseDate(inspDate), null, inspType, "Scheduled via Script");
	if (schedRes.getSuccess()) {
		var inspId = schedRes.getOutput();
		try {
			assignInspection(inspId, iName);
		} catch (ex) {
			logDebug(ex);
		}
	} else {
		logDebug("**Failed to schedule inspection of type: " + inspType + " on capId : " + itemCapId);
	}
}