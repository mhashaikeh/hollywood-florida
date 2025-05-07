/*Moved to PPA;~!~!~!~ 07172024
try{
	//Start: If no Record Balnce and Awaiting Payment, send Issuance email with Building Permit Report
	if (appTypeArray[1] != "Amendment"){
		if(balanceDue<=0 && matches(capStatus,"Ready to Issue","Awaiting Payment")){

			//Notification and Reports
			var envParameters = aa.util.newHashMap();
			envParameters.put("CapID",capId);
			aa.runAsyncScript("ASYNCRUNBUILDINGPERMITRPT", envParameters, 5000);

			//Close Permit Issuance and Open Inspection Task
			closeTask("Permit Issuance","Issued","","");
			activateTask("Inspection");
			updateAppStatus("Inspection Phase", "Updated By PPA:Building!~!~!~ Script");

			//Populate Renewal Exp Date and set as Active
			vPermitObj = new licenseObject(null, capId);
			currentDate = new Date();
			var currentDateString = (currentDate.getMonth() + 1) + "/" + currentDate.getDate() + "/" + currentDate.getFullYear();
			editAppSpecific("Permit Issued Date", currentDateString);
			var newExpDate = addDays(currentDate, 180);
			vPermitObj.setExpiration(dateAdd(newExpDate,0));
			vPermitObj.setStatus("Active");
		}
	}
	//End: If no Record Balnce and Awaiting Payment, send Issuance email with Building Permit Report
} catch (err) {
    var emailAddress = "accelaerrors@hollywoodfl.org"; //email to send report
    aa.sendMail("no-reply@accela.com", emailAddress, "", "PPA:BUILDING!~!~!~", err + debug + err.stack);
}
*/