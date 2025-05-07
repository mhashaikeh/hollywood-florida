function calcBldPermitFeesAndInvoice() {
	//Start: Apply Building Permit Fee
	var reviewerValuation = AInfo["Reviewer Valuation"];

	// MAS SF#01486264
	var calVariable = reviewerValuation;
	var estimatedCost = AInfo["Estimated Cost (Job Value)"];
	if (Number(estimatedCost) > Number(reviewerValuation)) {
		calVariable = estimatedCost;
	}

	var feeAmount = 0;
	if (calVariable <= 1000) {
		feeAmount = 100;
	} else if (calVariable <= 1000000) {
		feeAmount = 100 + (calVariable - 1000) * 0.022;
	} else if (calVariable <= 2000000) {
		feeAmount = 100 + (1000000 - 1000) * 0.022 + (calVariable - 1000000) * 0.0165;
	} else {
		feeAmount = 100 + (1000000 - 1000) * 0.022 + (2000000 - 1000000) * 0.0165 + (calVariable - 2000000) * 0.0115;
	}

	// Apply the fee with the calculated amount
	updateFee("BLD01", "BUILDING", "FINAL", feeAmount, "N");

	// Log the calculated fee amount for reference
	logDebug("Fee Amount Calculated: " + feeAmount);
	//End: Apply Building Permit Fee

	// Start Apply Certificate of Completion Fees
	var ownerAsBuilder = AInfo["Owner as Builder"];
	var isSubPermit = AInfo["Is this application being submitted as a sub-permit to a master building permit"];
	var permitFee = feeAmount;

	// Initialize fee variables
	var feeAmountBLD21 = 0;
	var feeAmountBLD22 = 0;

	// Calculate the fees based on the conditions
	if (ownerAsBuilder == 'Yes' && isSubPermit == 'No') {
		feeAmountBLD21 = Math.max(permitFee * 0.01, 15);
		updateFee('BLD21', 'BUILDING', 'FINAL', feeAmountBLD21, 'N');
		logDebug("Fee Amount BLD21 Calculated: " + feeAmountBLD21);
	} else if (ownerAsBuilder != "Yes" && isSubPermit == 'No') {
		feeAmountBLD22 = Math.max(permitFee * 0.03, 45);
		updateFee('BLD22', 'BUILDING', 'FINAL', feeAmountBLD22, 'N');
		logDebug("Fee Amount BLD22 Calculated: " + feeAmountBLD22);
	}
	// End Apply Certificate of Completion Fees

	// Start Apply County Fee
	var countyFeeAmount = Math.max((calVariable / 1000) * 0.52, 2);
	updateFee('COUNTY', 'GOVERNMENTAL', 'FINAL', countyFeeAmount, 'N');

	//End Apply County Fee

	// Start Calculate State, Tech, Education Fees

	// Calculate the STATE fee
	var stateFeeAmount = permitFee * 0.03;
	updateFee('STATE', 'GOVERNMENTAL', 'FINAL', stateFeeAmount, 'N');
	updateFee('BLD24', 'BUILDING', 'FINAL', permitFee, 'N');
	updateFee('BLD25', 'BUILDING', 'FINAL', permitFee, 'N');
	logDebug("STATE Fee Amount Calculated: " + stateFeeAmount);
	logDebug("Technology Fee Amount Calculated: " + (permitFee * 0.02));
	logDebug("Education Fee Amount Calculated: " + (permitFee * 0.01));
	// End Calculate State, Tech, Education Fees
	invoiceAllFees();
}
