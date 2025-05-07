
//Get inspection model list
var inspectionList = aa.env.getValue("InspectionList");
var debug = "";
var showDebug = false;
var showMessage = true;
//Get product
var product = aa.env.getValue("Product");


    if (inspectionList != null) {
        var its = inspectionList.iterator();

        while (its.hasNext()) {

            var inspectionModel = its.next();
            var requiredInspection = inspectionModel.getActivity().getRequiredInspection();
            


            if (requiredInspection == "Y") {
                var capIdModel = inspectionModel.getActivity().getCapIDModel();
                var inspectionId = inspectionModel.getActivity().getIdNumber();
                var inspection = aa.inspection.getInspection(capIdModel, inspectionId).getOutput();
               

                var inspGroup = inspection.getInspection().getInspectionGroup();
                var inspType = inspection.getInspection().getInspectionType();
                createPendingInspection(inspGroup, inspType, capIdModel);
            }
        }
    }


function logDebug(dstr) {
    debug += dstr + "\n";
}

function createPendingInspection(iGroup,iType, capId) // optional Cap ID
{
	var itemCap = capId;

	var itmResult = aa.inspection.getInspectionType(iGroup,iType)
	
	if (!itmResult.getSuccess())
		{
		logDebug("**WARNING error retrieving inspection types: " + itmResult.getErrorMessage);
		return false;
		}

	var itmArray = itmResult.getOutput();
	
	if (!itmArray)
		{
		logDebug("**WARNING could not find any matches for inspection group " + iGroup + " and type " + iType);
		return false;
		}

	var itmSeq = null;
	
	for (thisItm in itmArray)
		{
		var it = itmArray[thisItm];
		if (it.getGroupCode().toUpperCase().equals(iGroup.toUpperCase()) && it.getType().toUpperCase().equals(iType.toUpperCase()))
			itmSeq = it.getSequenceNumber();
		}

	if (!itmSeq)
		{
		message("**WARNING could not find an exact match for inspection group " + iGroup + " and type " + iType);
		return false;
		}
		
	var inspModel = aa.inspection.getInspectionScriptModel().getOutput().getInspection();
	
	var activityModel = inspModel.getActivity();
	activityModel.setInspSequenceNumber(itmSeq);
	activityModel.setCapIDModel(itemCap);

	pendingResult = aa.inspection.pendingInspection(inspModel)

	if (pendingResult.getSuccess())
		{
		logDebug("Successfully created pending inspection group " + iGroup + " and type " + iType);
		return true;
		}
	else
		{
		logDebug("**WARNING could not create pending inspection group " + iGroup + " and type " + iType + " Message: " + pendingResult.getErrorMessage());
		return false;
		}
	
}

if (debug.indexOf("**ERROR") > 0)
	{
	aa.env.setValue("ScriptReturnCode", "1");
	aa.env.setValue("ScriptReturnMessage", debug);
	}
else
	{
	aa.env.setValue("ScriptReturnCode", "0");
	if (showDebug) 	aa.env.setValue("ScriptReturnMessage", debug);
    else aa.env.setValue("ScriptReturnMessage", "Success");
	}

