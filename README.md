---
page_type: sample
description: CopilotX is a versatile, declarative agent designed to support various industry verticals, including ITES, Manufacturing, Retail, and Healthcare. It tailors its functionality based on the selected data from the repository below, adapting to the specific needs and workflows of each sector.
products: 
- MS Teams
- Copilot
- Azure 
languages:
  - typescript
---

# CopilotX Declerative agent sample for Manufacturing

CopilotX is a specialized, declarative agent designed for manufacturing environments, supporting an efficient incident reporting workflow in factory settings. With CopilotX, factory workers or agents can report incidents via email, attaching text, audio, or image files. For factories utilizing SAP, relevant repository details are provided.

Upon receiving an incident report via Outlook, the data is stored in Azure Blob Storage, and a Logic Apps flow initiates the creation of an incident ticket in Microsoft Teams. Supervisors or factory managers can use CopilotX to request daily incident reports, which appear as adaptive cards with incident details. Each card includes anomaly detection insights and resolution suggestions powered by Azure ML and Custom Vision, alongside relevant documentation sourced by Copilot from the web and SharePoint.

This sample implements the Declerative Copilot agent that will help you achieve tailor made AI assitance using Microsoft 365 Copilot. 

![Screenshot of the sample extension working in Copilot in Microsoft Teams]

> NOTE: The solution consists of an API plugin that calls a set of Azure functions, which store the consulting data in a Azure Table storage (it uses the Azurite storage emulator when running locally).
A declarative agent is provided to converse with users and to call the API plugin, as well as to reference the correct SharePoint document library.

## Version history

Version|Manifest version|Date|Author|Comments
-------|--|--|----|--------
1.0|1.xx |November , 2024 |Swati Arora |Initial release for Internal Repatable IP 
1.1|1.xx|December, 2024 | Swati Arora| SAP Connector, Custom Vision to be added in next version



## Plugin Features

The sample showcases the following features:

  1. Declarative agent with branding and instructions, access to relevant SharePoint documents and the API plugin
  1. API based plugin works with any platform that supports REST requests
  1. Copilot will construct queries for specific data using GET requests
  1. Copilot updates and adds data using POST requests
  1. Multi-parameter queries to filter results
  1. Show a confirmation card before POSTing data; capture missing parameters
  1. Display rich adaptive cards

## Setup

### Prerequisites

* [Visual Studio Code](https://code.visualstudio.com/Download)
* [NodeJS 18.x](https://nodejs.org/en/download)
* [Teams Toolkit extension for VS Code](https://marketplace.visualstudio.com/items?itemName=TeamsDevApp.ms-teams-vscode-extension)
  NOTE: If you want to build new projects of this nature, you'll need Teams Toolkit v5.6.1-alpha.039039fab.0 or newer
* [Teams Toolkit CLI](https://learn.microsoft.com/microsoftteams/platform/toolkit/teams-toolkit-cli?pivots=version-three)
  (`npm install -g @microsoft/teamsapp-cli`)
* (optional) [Postman](https://www.postman.com/downloads/)
- [Azure Subscription] 

### Setup instructions (one-time setup)

1. Log into Teams Toolkit using the tenant where you will run the sample.

1. If your project doesn't yet have a file **env/.env.local.user**, then create one by copying **env/.env.local.user.sample**. If you do have such a file, ensure it includes these lines.

~~~text
SECRET_STORAGE_ACCOUNT_CONNECTION_STRING=UseDevelopmentStorage=true
~~~

1. OPTIONAL: Copy the files from the **/sampleDocs** folder to OneDrive or SharePoint. Add the location of these files in the `OneDriveAndSharePoint` capability in the declarative copilot (**/appPackage/**).

### Running the solution (after each build)

1. Press F5 to start the application. It will take a while on first run to download the dependencies. Eventually a browser window will open up and your package is installed.

2. Navigate to Copilot as shown below 1️⃣
![Running in Copilot](./assets/images/startsample.png)

3. Access the declarative agent by opening the flyout 4️⃣, then select the CopilotX Local solution 5️⃣.
   
### API Summary
## Understanding design consderations of the API's of CopilotX
The copilotXAPI.http file contains various HTTP request examples that can be used to interact with the CopilotX API. This file is useful for testing and understanding the different endpoints available in the API. Below are some sample requests included in the file:
GET Requests
> Get Users by Name: GET {{base_url}}/users/?userName=Avery

> Get Users by Ticket: GET {{base_url}}/users/?ticketName=My Ticket

> Get Users by Skill: GET {{base_url}}/users/?skill=python

> Get Users by Certification: GET {{base_url}}/users/?certification=cloud

> Get Users by Role: GET {{base_url}}/users/?role=developer

> Get Users by Hours Available This Month: GET {{base_url}}/users/?hoursAvailable=10

These requests return an array of user objects, which are defined in the ApiUser interface in /model/apiModel.ts.

## Working with Tickets

> Get All Tickets: GET {{base_url}}/tickets/?ticketName=My Ticket
> Get Ticket by Name: GET {{base_url}}/tickets/?ticketName=My Ticket

> Get Tickets by Status: GET {{base_url}}/tickets/?status=open

> Get Tickets by Priority: GET {{base_url}}/tickets/?priority=high

These requests return an array of ticket objects, which are defined in the ApiTicket interface in /model/apiModel.ts.

POST Requests
> Create a New Ticket: POST {{base_url}}/tickets

### Request body:
```{
  "ticketName": "New Ticket",
  "description": "Description of the new ticket",
  "priority": "high",
  "status": "open",
  "ownerName": "John Doe",
  "assetName": "Asset 1"
}
### Response body:
{
  "status": 200,
  "message": "Ticket 'New Ticket' created successfully."
}

> Update a Ticket: POST {{base_url}}/tickets/update

Request body:
{
  "ticketName": "Existing Ticket",
  "description": "Updated description",
  "priority": "medium",
  "status": "in progress",
  "ownerName": "Jane Doe",
  "assetName": "Asset 2"
}
Response body:
{
  "status": 200,
  "message": "Ticket 'Existing Ticket' updated successfully."
}

> Note: These examples demonstrate how to interact with the CopilotX API to retrieve and manipulate data related to users and tickets. The copilotXAPI.http file is a resource to test API endpoints and understand the available operations.
