function removeAddressCondition(conditionType) {
    var addressesArray = aa.address.getAddressByCapId(capId);
    if (addressesArray.getSuccess()) {
        addressesArray = addressesArray.getOutput();
        for (var i in addressesArray) {
            var addressObj = addressesArray[i];
            var addressId = addressObj.getRefAddressId();
            var dispAddress = addressObj.getDisplayAddress();
            if (addressId) {
                var conditionsArray = aa.addressCondition.getAddressConditions(addressId);
                if (conditionsArray.getSuccess()) {
                    conditionsArray = conditionsArray.getOutput();
                    for (var i in conditionsArray) {
                        var conditionObj = conditionsArray[i];
                        var conditionId = conditionObj.getConditionNumber();
                        logDebug("Condition ID is " + conditionId);
                        var conditionDesc = conditionObj.getConditionType();
                        logDebug("Condition Description " + conditionDesc);
                        if (conditionType.equals(conditionDesc)) {
                            if (conditionId) {
                                var result = aa.addressCondition.removeAddressCondition(addressId, conditionId);
                                if (result.getSuccess()) {
                                    logDebug("Removed " + conditionType + " condition on address: " + dispAddress);
                                } else {
                                    logDebug("***ERROR*** Unable to remove condition on address: " + dispAddress + " : " + result.getErrorMessage());
                                }
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}