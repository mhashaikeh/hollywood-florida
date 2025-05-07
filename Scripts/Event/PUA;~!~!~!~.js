/*------------------------------------------------------------------------------------------------------/
| Program		: PUA;~!~!~!~.js
| Event			: PUA:Parcel Update After
| Notes			: FOR TICKETS: HLYWDFL-576
| Created by	: JSCHULER
| Created at	: 5/17/2024
/------------------------------------------------------------------------------------------------------*/
try{	
	
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
			appMatch("PublicWorks/Engineering/*/*") ||
			appMatch("Fire/Permit/*/*") ||
			appMatch("PublicWorks/Utilities/Station/NA/*/*") ||
			appMatch("PublicWorks/Utilities/Onsite Drainage/NA/*/*")) {

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
	
} catch (err) {
	logDebug("A JavaScript Error occurred: PUA:*/*/*/*: " + err.message);
	logDebug(err.stack);
};