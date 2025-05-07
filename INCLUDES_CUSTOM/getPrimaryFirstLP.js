function getPrimaryFirstLP() {//optional cap Id
    var itemCap = capId;
    if (arguments.length > 0) {
        itemCap = arguments[0];
    }
    var LPs = aa.licenseScript.getLicenseProf(itemCap);
    if (LPs.getSuccess()) {
        // In case there are multiple LPs attached to record, get the primary if not exists get first added
        LPs = LPs.getOutput();
        var lpsArr = LPs;
        if (!lpsArr) {
            return null;
        }
        lpsArr = lpsArr.filter(function (lpObj) {
            return lpObj.getPrintFlag() == "Y";
        });

        if (!lpsArr || lpsArr.length == 0) {
            // get first added, order by lic Seq Nbr
            var lpProfModelArr = LPs.map(function (obj) {
                return obj.getLicenseProfessionalModel();
            });

            var firstAddedLp = lpProfModelArr.sort(function (a, b) {
                return a.getLicSeqNbr() - b.getLicSeqNbr();
            })[0];

            if (firstAddedLp) {
                lpsArr = LPs.filter(function (lpObj) {
                    return lpObj.getLicenseProfessionalModel().getLicSeqNbr() == firstAddedLp.getLicSeqNbr();
                });
            }
        }

        if (lpsArr && lpsArr.length) {
            return lpsArr[0];
        }
    }

    return null;
}