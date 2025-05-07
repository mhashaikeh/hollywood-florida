{
  "Enforcement/Complaint/NA/NA": {
    "InspectionResultSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically Close Record when resulted Unfounded.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
          ],
          "inspectionResult": [
            "Unfounded"
          ]
        },
        "action": {
          "taskName": "Investigation",
          "taskStatus": "No Violation",
          "newAppStatus": "No Violation"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically Close Record when resulted Unfounded.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Inspection"
          ],
          "inspectionResult": [
          ]
        },
        "action": {
        },
        "postScript": "POST_ENFORCEMENT_COMPLAINT_INSPECTION_OUTCOME"
      }
    ]
  },
  "Enforcement/Case/NA/NA": {
    "InspectionResultSubmitAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically Close Record when resulted Unfounded.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Inspection"
          ],
          "inspectionResult": [
          ]
        },
        "action": {
        },
        "postScript": "POST_ENFORCEMENT_FOLLOW_UP_INSPECTION_OUTCOME"
      },
	  {
        "preScript": "",
        "metadata": {
          "description": "Automatically apply Admin Cost Fee.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "ES Compliance Inspection"
          ],
          "inspectionResult": [
          ]
        },
        "action": {
        },
        "postScript": "POST_ENFORCEMENT_ES_COMPLIANCE_INSPECTION_OUTCOME"
      }
    ]
  },
  "Enforcement/Incident/Abatement/Abandoned Vehicle": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Incident/Abatement/Animal Nuisance": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Incident/Abatement/Graffiti": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Incident/Abatement/Noise Nuisance": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Incident/Abatement/Trees": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Incident/Abatement/Weeds": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Incident/Building/Grading": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Incident/Building/Illegal Occupancy": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Incident/Building/Sub-Standard Property": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Incident/Building/Working Without Permit": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Incident/Health and Safety/Garbage Service": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Incident/Health and Safety/Junk": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Incident/Health and Safety/Vacant Building": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Incident/Zoning/Fence Dispute": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Incident/Zoning/Home Occupation": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Incident/Zoning/Illegal Sign": {
    "InspectionScheduleAfter": [
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Initial Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Initial Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      },
      {
        "preScript": "",
        "metadata": {
          "description": "Automatically forward workflow when a inspection has scheduled.",
          "operators": ""
        },
        "criteria": {
          "inspectionTypePerformed": [
            "Follow-Up Investigation"
          ],
          "inspectionResult": [
            ""
          ]
        },
        "action": {
          "taskName": "Follow-Up Investigation",
          "taskStatus": "Scheduled"
        },
        "postScript": ""
      }
    ]
  }
}