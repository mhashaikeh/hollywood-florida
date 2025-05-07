function getCapBalanceDue(itemCapId) {
    var itemBalanceDue = 0;
    var itemCapDetailObjResult = aa.cap.getCapDetail(itemCapId);
    if (itemCapDetailObjResult.getSuccess()) {
        itemCapDetail = itemCapDetailObjResult.getOutput();
        itemBalanceDue = itemCapDetail.getBalance();
    }
    return itemBalanceDue;
}