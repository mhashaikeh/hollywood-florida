function editFeeComment(feeSeqNbr, comment) {
    var itemCap = capId;
    if (arguments.length > 2)
        itemCap = arguments[2];
    var newFee = aa.finance.getFeeItemByPK(itemCap, feeSeqNbr).getOutput();
    if (!newFee)
        return false;

    newFee = newFee.getF4FeeItem();
    newFee.setFeeNotes(comment);

    var editFeeResult = aa.finance.editFeeItem(newFee);
    if (editFeeResult.getSuccess())
        return true;
    else
        return false;
}