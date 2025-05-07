{
  "Licenses/Contractor/*/Application": {
    "WorkflowTaskUpdateAfter": [
      {
        "metadata": {
          "description": "Send notification when additional info is required",
          "operators": {}
        },
        "preScript": "PRE_PREPARE_CONTACT_PARAMS",
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
            "Qualifying Individual"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "reportingInfoStandards": "",
          "useDepartmentInformationStandardChoice": true
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Send notification when application is denied ",
          "operators": {}
        },
        "preScript": "PRE_PREPARE_CONTACT_PARAMS",
        "criteria": {
          "task": [],
          "status": [
            "Denied"
          ]
        },
        "action": {
          "notificationTemplate": "SS_APP_DENIED",
          "notificationReport": [],
          "notifyContactTypes": [
            "Qualifying Individual"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "reportingInfoStandards": "",
          "useDepartmentInformationStandardChoice": true
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Send notification when application is withdrawn",
          "operators": {}
        },
        "preScript": "PRE_PREPARE_CONTACT_PARAMS",
        "criteria": {
          "task": [],
          "status": [
            "Withdrawn"
          ]
        },
        "action": {
          "notificationTemplate": "SS_APP_WITHDRAWAL",
          "notificationReport": [],
          "notifyContactTypes": [
            "Qualifying Individual"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "reportingInfoStandards": "",
          "useDepartmentInformationStandardChoice": true
        },
        "postScript": ""
      }
    ]
  },
  "Licenses/Amendment/*/*": {
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
            "Qualifying Individual"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "useDepartmentInformationStandardChoice": true
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Send notification when application is denied",
          "operators": {}
        },
        "preScript": "PRE_PREPARE_CONTACT_PARAMS",
        "criteria": {
          "task": [],
          "status": [
            "Modification Request Denied"
          ]
        },
        "action": {
          "notificationTemplate": "SS_APP_DENIED",
          "notificationReport": [],
          "notifyContactTypes": [
            "Qualifying Individual"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "reportingInfoStandards": "",
          "useDepartmentInformationStandardChoice": true
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Send notification when application is withdrawn",
          "operators": {}
        },
        "preScript": "PRE_PREPARE_CONTACT_PARAMS",
        "criteria": {
          "task": [],
          "status": [
            "Withdrawn"
          ]
        },
        "action": {
          "notificationTemplate": "SS_APP_WITHDRAWAL",
          "notificationReport": [],
          "notifyContactTypes": [
            "Qualifying Individual"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "reportingInfoStandards": "",
          "useDepartmentInformationStandardChoice": true
        },
        "postScript": ""
      },
      {
        "metadata": {
          "description": "Send notification when request is Approved",
          "operators": {}
        },
        "preScript": "PRE_PREPARE_CONTACT_PARAMS",
        "criteria": {
          "task": [],
          "status": [
            "Modification Request Approved"
          ]
        },
        "action": {
          "notificationTemplate": "SS_REQUEST_APPROVED",
          "notificationReport": [],
          "notifyContactTypes": [
            "Qualifying Individual"
          ],
          "additionalEmailsTo": "",
          "url4ACA": "",
          "createFromParent": false,
          "reportingInfoStandards": "",
          "useDepartmentInformationStandardChoice": true
        },
        "postScript": ""
      }
    ]
  }
}