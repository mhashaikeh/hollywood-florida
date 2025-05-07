/*------------------------------------------------------------------------------------------------------/
| Program : ACA_ACCESSORY_HIDE_CARPORT.js
| Event   : ACA_Onload Event
|
| Usage   : Attach this script to the onload script and it will skip the page if the Phased Dev is No.
|
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
|
/------------------------------------------------------------------------------------------------------*/
function getMasterScriptText(vScriptName) {
    vScriptName = vScriptName.toUpperCase();
    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
    var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
    return emseScript.getScriptText() + "";
}
eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString(); // Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/");
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
        var AccessoryType = getCustomFieldPageflow("Type of Accessory Structure");
        if (AccessoryType != "Carport") {
            aa.env.setValue("ReturnData", "{'PageFlow':{'HidePage':'Y'}}");
        }

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/
aa.env.setValue("ErrorCode", "0");
/*------------------------------------------------------------------------------------------------------/
| <===========External Functions (used by Action entries)
/------------------------------------------------------------------------------------------------------*/
function getCustomFieldPageflow(fieldLabel) {
    var capASI = cap.getAppSpecificInfoGroups();
    if (capASI) {
        var i = cap.getAppSpecificInfoGroups().iterator();
        while (i.hasNext()) {
            var group = i.next();
            var fields = group.getFields();
            if (fields) {
                var iteFields = fields.iterator();
                while (iteFields.hasNext()) {
                    var field = iteFields.next();
                    if (fieldLabel === field.getCheckboxDesc() + "") {
                        return field.getChecklistComment() + "";
                    }
                }
            }
        }
    }
}