//Start: Hide Closed Records in ACA
if(appStatus.indexOf("Closed") != -1) {
	aa.cap.updateAccessByACA(capId,"N");
}
//End: Hide Closed Records in ACA