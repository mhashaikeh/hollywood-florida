function isAllChildrenClosed() {
    var childrenArr = getChildren("*/*/*/*", capId);
    if (childrenArr && childrenArr.length > 0) {
        for (var c in childrenArr) {
            var childCapId = childrenArr[c];
            var childCap = aa.cap.getCap(childCapId).getOutput();
            var childCapClassStr = String(childCap.getCapClass());
            if (childCapClassStr.indexOf("INCOMPLETE") > -1) { continue; }

            var childCapType = childCap.getCapType().toString();
            var childCapTypeArr = childCapType.split("/");
            if (matches(childCapTypeArr[0], "Enforcement", "Licenses")) {
                continue;
            }
            var childCapStatus = childCap.getCapStatus() + "";
            if (childCapStatus.indexOf("Closed") == -1) {
                return false;
            }
        }
    }
    return true;
}