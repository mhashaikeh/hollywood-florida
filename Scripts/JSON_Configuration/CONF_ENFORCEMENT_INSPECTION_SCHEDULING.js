{
  "Enforcement/Property Maintenance/Case/NA": {
    "ApplicationSubmitAfter": [
      {
        "metadata": {
          "description": "Schedule a New Complaint inspection upon record creation",
          "operators": {}
        },
        "preScript": "",
        "criteria": {},
        "action": {
          "inspectionType": "New Complaint",
          "rangeType": "Days",
          "range": 0,
          "assignment": "",
          "comments": "Created by Script"
        },
        "postScript": ""
      }
    ]
  },
    "Enforcement/Complaint/NA/NA": {
    "ApplicationSubmitAfter": [
      {
        "metadata": {
          "description": "Schedule a New Complaint inspection upon record creation",
          "operators": {}
        },
        "preScript": "",
        "criteria": {},
        "action": {
          "inspectionType": "Initial Inspection",
          "rangeType": "Days",
          "range": 0,
          "assignment": "",
          "comments": "Created by Script"
        },
        "postScript": "POST_ENFORCEMENT_COMPLAINT_AUTO"
      }
    ]
  }
}