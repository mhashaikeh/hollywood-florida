{
  "Enforcement/Complaint/NA/NA": {
    "ApplicationSubmitBefore": [
      {
        "preScript": "",
        "metadata": {
          "description": "required complainant",
          "operators": {}
        },
        "criteria": {
          "customFields": {
            "Source of Complaint": [
              "Email",
              "Phone",
              "Walk In"
            ]
          },
          "requiredContact": [
            "Complainant"
          ]
        },
        "action": {
          "validationMessage": "The applied Source of Complaint Requires a Complainant Contact Type to be applied before submission"
        },
        "postScript": ""
      }
    ]
  },
  "Enforcement/Case/*/*": {
    "WorkflowTaskUpdateBefore": [
      {
        "preScript": "",
        "metadata": {
          "description": "Verify Cost Validation Table is Complete",
          "operators": {}
        },
        "criteria": {
          "task": [
            "Hearing"
          ],
          "status": [
            "Stipulated Agreement"
          ]
        },
        "action": {
          "validationMessage": ""
        },
        "postScript": "POST_ENFORCEMENT_COURT_COST_VALIDATION"
      }
    ]
  },
  "Enforcement/Permit/Dog/*": {
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
      }
    ]
  }
}