{
  "Building/*/*/*": {
    "InspectionResultSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a Final inspection has passed.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [],
          "inspectionResult": [
            "Passed"
          ]
        },
        "action": {},
        "postScript": "POST_BUILDING_INSPECTION_RESULT"
      }
    ]
  }
}