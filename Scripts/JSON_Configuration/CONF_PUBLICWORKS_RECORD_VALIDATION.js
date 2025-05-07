{
  "PublicWorks/*/*/*": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "All invoiced fees must be paid before a permit can be issued.",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Permit Issuance"
          ],
          "status": [
            "Issued"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all invoiced fees are paid in full."
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "All invoiced fees must be paid before a permit can be issued.",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Permit Renewal"
          ],
          "status": [
            "Renewed"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all invoiced fees are paid in full."
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "All invoiced fees must be paid before an application/permit can be closed. ",
          "operator": ""
        },
        "criteria": {
          "task": [
            "Inspection"
          ],
          "status": [
            "Final Inspection Complete"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all invoiced fees are paid in full."
        }
      }
    ],
    "InspectionScheduleBefore": [
      {
        "metadata": {
          "description": "All invoiced fees must paid before an inspection can be scheduled.",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "inspectionTypePerformed": [],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "This action cannot be taken until all invoiced fees are paid in full."
        }
      }
    ]
  },
  "PublicWorks/Engineering/Plat/NA": {
    "WorkflowTaskUpdateBefore": [
      {
        "metadata": {
          "description": "All invoiced fees must be paid before decision notification is sent",
          "operator": ""
        },
        "preScript": "",
        "criteria": {
          "task": [
            "Plans Coordination"
          ],
          "status": [
            "Review Complete"
          ],
          "allowBalance": false
        },
        "action": {
          "validationMessage": "All invoiced fees must be paid before decision notification is sent."
        },
        "postScript": ""
      }
    ]
  }
}