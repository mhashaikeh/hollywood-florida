/*------------------------------------------------------------------------------------------------------/
| Program		: ASA;~!~!~!~.js
| Event			: ASA:Application Submit After
| Notes			: FOR TICKETS: HLYWDFL-576
| Created by	: JSCHULER
| Created at	: 4/18/2024
/------------------------------------------------------------------------------------------------------*/
try{	
	if(!publicUser){
		copyParcelGisObjects(); //Needed to get GIS feature associated when created by AMO or Apps 
		
		// Records to get GIS info for custom fields:
		if (appMatch("Building/Fence/*/*") ||  
			appMatch("Building/Window and Door/*/*") || 
			appMatch("Building/Commercial/Plumbing/*") || 
			appMatch("Building/Residential/Plumbing/*") || 
			appMatch("Building/Commercial/Demolition/*") || 
			appMatch("Building/Residential/Demolition/*") || 
			appMatch("Building/Commercial/Electrical/*") || 
			appMatch("Building/Residential/Electrical/*") || 
			appMatch("Building/Commercial/Mechanical/*") || 
			appMatch("Building/Residential/Mechanical/*") || 
			appMatch("Building/Roofing/*/*") || 
			appMatch("Building/Mobile Home/NA/NA") || 
			appMatch("Building/Antenna/NA/NA") ||
			appMatch("Building/Temporary Structure/NA/NA") || 
			appMatch("Building/Commercial/Accessory/NA") || 
			appMatch("PublicWorks/Engineering/*/*") ||
			appMatch("Fire/Permit/*/*") ||
			appMatch("PublicWorks/Utilities/Station/NA") ||
			//appMatch("PublicWorks/Utilities/Flood Zone Determination/NA") ||
			appMatch("PublicWorks/Utilities/Onsite Drainage/NA")) {
				
			// Call GIS services to fill in custom fields	
			// Layer: Drainage District	
			var drainageFields =  ["*"];
			var drainage = getGISInfo2multiAttribute("HOLLYWOOD", "Drainage District", drainageFields);
			if (drainage) {
				//editAppSpecific("Dependent", drainage.get("DEPENDENT"));
				editAppSpecific("Drainage District Name", drainage.get("DISTRICTNAME"));
			}
			// Layer: Zoning
			var zoningFields =  ["*"];
			var zoning = getGISInfo2multiAttribute("HOLLYWOOD", "Zoning", zoningFields);
			if (zoning) {
				editAppSpecific("Zoning Base Elevation", zoning.get("BASEELEV"));
				editAppSpecific("Zoning Height", zoning.get("HEIGHT"));
				editAppSpecific("Zoning Class", zoning.get("ZONECLASS"));
				editAppSpecific("Zoning Description", zoning.get("ZONEDESC"));
			}
			// Layer: TOC
			var tocFields =  ["*"];
			var toc = getGISInfo2multiAttribute("HOLLYWOOD", "TOC", tocFields);
			if (toc) {
				editAppSpecific("TOC Base Elevation", toc.get("BASEELEV"));
				editAppSpecific("TOC Height", toc.get("HEIGHT"));
				editAppSpecific("TOC Land Use Code", toc.get("LANDUSECODE"));
				editAppSpecific("TOC Land Use Description", toc.get("LANDUSEDESC"));
			}
			// Layer: RAC
			var racFields =  ["*"];
			var rac = getGISInfo2multiAttribute("HOLLYWOOD", "RAC", racFields);
			if (rac) {
				editAppSpecific("RAC Base Elevation", rac.get("BASEELEV"));
				editAppSpecific("RAC Height", rac.get("HEIGHT"));
				editAppSpecific("RAC Land Use Code", rac.get("LANDUSECODE"));
				editAppSpecific("RAC Land Use Description", rac.get("LANDUSEDESC"));
			}
			// Layer: FEMA
			var femaFields =  ["*"];
			var fema = getGISInfo2multiAttribute("HOLLYWOOD", "FEMA Flood Map", femaFields);
			if (fema) {
				editAppSpecific("FEMA Description", fema.get("Description"));
				editAppSpecific("FEMA Flood Elevation", fema.get("ELEV"));
				editAppSpecific("FEMA Effective Date", fema.get("Effective_Date"));
				editAppSpecific("FEMA Firm Panel", fema.get("FIRM_PAN"));
				editAppSpecific("FEMA Flood Zone", fema.get("FLD_ZONE"));
				// 1195 editAppSpecific("FEMA Old Flood Zone", fema.get("FZONE_OLD"));
				editAppSpecific("FEMA Insurance Required", fema.get("INS_REQ"));
				// 1195 editAppSpecific("FEMA Panel ID", fema.get("PANEL_ID"));
				editAppSpecific("FEMA SFHA", fema.get("SFHA_TF"));
				editAppSpecific("FEMA Static BFE", fema.get("STATIC_BFE"));
			}
			// Layer: Historic District	
			var historicFields =  ["*"];
			var historic = getGISInfo2multiAttribute("HOLLYWOOD", "HISTORIC DISTRICT", historicFields);
			if (historic) {
				editAppSpecific("Historic District Description", historic.get("DESCRIPTION"));
			}
			// Layer: CRA
			var craFields =  ["*"];
			var cra = getGISInfo2multiAttribute("HOLLYWOOD", "CRA", craFields);
			if (cra) {
				editAppSpecific("CRA District", cra.get("CRA_District"));
			}
			// Layer: Comm Districts
			var commFields =  ["*"];
			var comm = getGISInfo2multiAttribute("HOLLYWOOD", "Comm Districts", commFields);
			if (comm) {
				editAppSpecific("Commission District", comm.get("DISTRICT"));
			}			
		}

		//Start: Notify LP upon Submission
		if (appTypeArray[0] != "Licenses"){
			var licenseProfResult = aa.licenseProfessional.getLicensedProfessionalsByCapID(capId);
			if (licenseProfResult.getSuccess()) {
				var licenseProfList = licenseProfResult.getOutput();
				if (licenseProfList) {
					for (thisLP in licenseProfList) {
						if (licenseProfList[thisLP].getLicenseNbr() != null) {
							var licNbr = licenseProfList[thisLP].getLicenseNbr();
							var firstName = licenseProfList[thisLP].getContactFirstName();
							var lastName = licenseProfList[thisLP].getContactLastName();
							var eMail = licenseProfList[thisLP].getEmail();
							emailParameters = aa.util.newHashtable();
							var deptName = (appTypeArray[0] == "PublicWorks") ? "Engineering Division" : appTypeArray[0] + " Division";
							getDepartmentParams4Notification(emailParameters, deptName);
							var sysDate = aa.date.getCurrentDate();
							var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "MM/DD/YYYY");
							addParameter(emailParameters, "$$altID$$", capId.getCustomID());
							addParameter(emailParameters, "$$recordAlias$$", cap.getCapType().getAlias());
							addParameter(emailParameters, "$$ContactName$$",""+firstName + " " + lastName);
							addParameter(emailParameters, "$$licNbr$$",""+licNbr);
							addParameter(emailParameters, "$$mmddyy$$", sysDateMMDDYYYY);
							sendNotification("Accela@HollywoodFl.org",eMail,"","SS_LP_APPLIED_NOTIFICATION",emailParameters,null,capId)
						}
					}
				}
			}
		}
		//End: Notify LP upon Submission

		//Start: Apply Condition for County Contractor Verification
		if (appTypeArray[0] != "Licenses" && appTypeArray[1] != "Amendment") {
			var regNotActive = false;
			var LPs = aa.licenseScript.getLicenseProf(capId);		
			// Check if license professionals were successfully retrieved
			if (LPs.getSuccess()) {
				var LPsArr = LPs.getOutput();			
				// Only continue if there are license professionals
				if (LPsArr && LPsArr.length > 0) {
					var licType = LPsArr[0].getLicenseType();
					countyLic = lookup("CTR_COUNTY_CATEGORY", licType);					
					if (countyLic != undefined) {
						if (!appHasCondition("County", "Applied", "Manual License Number and Expiration Validation Required", null)) {
							addStdCondition("County", "Manual License Number and Expiration Validation Required");
						}
					}
					if (String(licType) == "Liquified Petroleum Gas License LP Gas Installer") {
						if (!appHasCondition("Liquified Petroleum", "Applied", "Manual License Number and Expiration Validation Required", null)) {
							addStdCondition("Liquified Petroleum", "Manual License Number and Expiration Validation Required");
						}
					}
				} else {
					// Handle the case where no license professionals are found
					logDebug("No license professionals found.");
				}
			}
		}
		//End: Apply Condition for County Contractor Verification

		//SF: 01503281
		aa.print('SF: 01503281..........');
		var cap = aa.cap.getCap(capId).getOutput();
		var fileDate = cap.getCapModel().getFileDate();
		aa.print('fileDate: ' + fileDate);
		fileDate = aa.util.formatDate(fileDate, "MM/dd/yyyy");
		aa.print('fileDate: ' + fileDate);

		if(fileDate !=null && fileDate !='') {
			aa.print('Updating Application Date');
			editAppSpecific("Application Date", fileDate);
		}
		//SF: 01503281 END
	}
} catch (err) {
	logDebug("A JavaScript Error occurred: ASA:*/*/*/*: " + err.message);
	logDebug(err.stack);
};