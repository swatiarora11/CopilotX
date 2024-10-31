page_type: sample
type of Copilot: Declarative 
CopilotX: "X" here means the bot can be used for different vertical like ITES, Manufacturing, retail etc
description: This sample is a declarative agent called "CopilotX" for manufacturing which provides assitant for implementing an incident reporting workflow in a factory setting. Factory workers or agents can report incidents via email with text, audio, or image attachments. The data will be stored in Azure Blob Storage, and a flow in Logic Apps will trigger the logging of an incident ticket in Microsoft Teams. A supervisor or factory manager can request daily incident reports via the CopilotX, which will display incident details in an adaptive card. The card will include anomaly detection results and resolution suggestions using Azure ML and Custom Vision, along with relevant documentation fetched by Copilot from the web. 
products:
- office-teams
- copilot-m365
languages:
- typescript
---
