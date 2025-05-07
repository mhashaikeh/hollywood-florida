{
  "Enforcement/Permit/Dog/NA": {
    "WorkflowTaskUpdateAfter": [
      {
        "preScript": "PRE_PREPARE_CONTACT_PARAMS",
        "metadata": {
          "description": "Send notification when additional information is required",
          "operators": {}
        },
        "criteria": {
          "task": [],
          "status": [
            "Additional Info Required"
          ]
        },
        "action": {
          "notificationTemplate": "SS_ADDITIONAL_INFO_REQD",
          "notificationReport": [],
          "notifyContactTypes": [
            "Applicant"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "useDepartmentInformationStandardChoice": true
        },
        "postScript": ""
      },
      {
        "preScript": "PRE_PREPARE_CONTACT_PARAMS",
        "metadata": {
          "description": "Send notification when additional information is required",
          "operators": {}
        },
        "criteria": {
          "task": [],
          "status": [
            "Ready to Issue"
          ]
        },
        "action": {
          "notificationTemplate": "ENF_DDOG_READYTOISSUE",
          "notificationReport": [],
          "notifyContactTypes": [
            "Applicant"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "useDepartmentInformationStandardChoice": true
        },
        "postScript": ""
      },
      {
        "preScript": "PRE_PREPARE_CONTACT_PARAMS",
        "metadata": {
          "description": "Send notification when additional information is required",
          "operators": {}
        },
        "criteria": {
          "task": [],
          "status": [
            "Issued"
          ]
        },
        "action": {
          "notificationTemplate": "ENF_PERMIT_ISSUANCE",
          "notificationReport": [],
          "notifyContactTypes": [
            "Applicant"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "useDepartmentInformationStandardChoice": true
        },
        "postScript": "POST_DDOG_ISSUANCE"
      }
    ]
  }
}