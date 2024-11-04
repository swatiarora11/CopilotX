---
page_type: sample
description: CopilotX is a versatile declarative agent designed to support ticket management, user support and work tracking by providing efficient responses and practical assistance for various industry verticals including ITES, Manufacturing, Retail, and Healthcare. It can be adapted to the specific needs and workflows of each sector by changing data about units and assets in azure storage and changing knowledge base documents to provide customized response for the sector.
products: 
- MS Teams
- Copilot
- Azure
- Sharepoint 
languages:
  - typescript
---

# CopilotX Agent (ITES | Manufacturing | Retail | Healthcare)

[CopilotX (Manufacturing)](https://github.com/swatiarora11/CopilotX/blob/main/README.md ) | [CopilotX (IT Services)](https://github.com/swatiarora11/CopilotX/commit/19faebb7279da3d964b8d2cce727c5cb91c1899e)

## Overview

The CopilotX is a versatile declarative agent designed to be a user-friendly assistant for professionals in Manufacturing industry specializing in asset incidence management and resolution. It aims to streamline ticket management, user support and work tracking by providing efficient responses and practical assistance. Company specific knowledge base can also be uploaded to a sharepoint site so that copilot remains grounded in company data and assist the professionals with customized resolutions for incidents or any other company specific documentation including policies/ procedures to be complied by the professionals.

## Features
**User Management:** Find users based on their names, ticket assignments, skills, roles, and certifications. This feature helps in quickly locating team members, identifying their competencies, and assigning roles effectively.

**Ticket Management:** Access detailed information about tickets and assets, log work hours and manage ticket assignments. Users can add others to tickets and keep track of billed hours to ensure transparency and accountability.

**Professional Interactions:** Greet users professionally and provide support tailored to their queries. CopilotX provides relevant suggestions for ticket resolution while encouraging consultation with managers if needed for complex queries.

**OneDrive and SharePoint Integration:** Easily access documents from SharePoint, enabling a seamless flow of information for effective resolution of tickets.

**Predefined Conversation Starters:** To enhance user experience, CopilotX includes popular conversation starters such as:

- Retrieve Unit Details
- Access Asset Information
- List My Assigned Tickets
- Log Work Hours
- Locate Azure-Certified Users
- Add Users to Tickets
- Seek Incident Resolution Guidance

## Suggested Integration Workflow

This workflow demonstrates how CopilotX can be leveraged for efficient incident reporting, tracking and resolution assistance. For factories utilizing SAP, the relevant repository information can be easily integrated for data accessibility. Suggested workflow steps are as follows - 

### 1. **Incident Reporting:** 
- Factory workers or agents report incidents by sending an email through Outlook, attaching necessary files (text, audio, images)
- Upon email reception, Logic Apps flow is triggered and incident data is securely stored in Azure Storage and an incident ticket is created. Factory supervisors, safety managers and relevant personnel are notified in Teams to review and address the incident promptly.
- Azure Machine Learning and Custom Vision can be leveraged to automatically detect type of incident based on incident data uploaded by the factory worker or agent. This might help in classifying the incidents and automate logging of incident tickets.

### 2. **Insights and Assistance with CopilotX:** 
- Supervisors or factory managers can request daily incident reports through CopilotX. On receiving the prompt, CopilotX can show detailed incident information as adaptive cards within Teams.
- Supervisors or factory managers can ask for resolution guidance on a ticket. CopilotX can dynamically fetch relevant information from sharepoint site or web to assist the professional by providing incident resolution guidance in natural language.

### 3. **Extended Integrations:**  

- This workflow is adaptable to integrate with SAP and other enterprise systems. 
- For SAP-connected factories, incident metadata and status updates can be synced with SAP enriching the reporting framework and aligning with existing ERP systems.

This implementation offers a robust and adaptable AI assistant within the Microsoft 365 Copilot environment.


## REST APIs

Copilot can leverage REST APIs to extend its functionality by integrating data and actions from external systems, services and applications directly into its interface, creating a seamless workflow for end-users. Below documentation summarizes the CopilotX API endpoints for managing units, assets, users, and tickets.

### 1. Units API
This API handles operations related to units within CopilotX.

- **Retrieve All Units**: Use `GET /units` to fetch a list of all available units.
  
- **Get Unit by ID**: Use `GET /units/{id}` with the unit's ID to obtain specific unit details.

- **Find Unit by Name or Associated Asset**:
  - Use `GET /units/?unitName={unitName}` to find a unit by name.
  - Use `GET /units/?assetName={assetName}` to find a unit based on an asset’s name.

- **Add an Asset to a Unit**: Use `POST /units/addAsset` to assign an asset to a unit. Provide the unit and asset names in the JSON body.

---

### 2. Assets API
The Assets API allows you to manage assets in CopilotX.

- **Retrieve All Assets**: Use `GET /assets` to obtain a list of all assets.

- **Get Asset by ID**: Use `GET /assets/{id}` to fetch details about a specific asset by its ID.

- **Find Asset by Name**: Use `GET /assets/?assetName={assetName}` to locate an asset by its name.

---

### 3. User API
This API is for retrieving information about CopilotX users and managing their work on tickets.

- **Get Current User Information**: Use `GET /me` to obtain information about the current user and their assigned tickets.

- **Log Work Hours on a Ticket**: Use `POST /me/workonticket` to record hours worked on a specific ticket. Provide the ticket name and the number of hours in the JSON body.

- **Retrieve All Users**: Use `GET /users` to get a list of all registered users.

- **Get User by ID**: Use `GET /users/{id}` to get details of a user by their ID.

- **Filter Users by Attributes**:
  - By name: `GET /users/?userName={userName}`
  - By ticket assignment: `GET /users/?ticketName={ticketName}`
  - By skill: `GET /users/?skill={skill}`
  - By certification: `GET /users/?certification={certification}`
  - By role: `GET /users/?role={role}`
  - By available hours this month: `GET /users/?hoursAvailable={hoursAvailable}`

---

### 4. Tickets API
The Tickets API supports operations for managing and updating tickets.

- **Retrieve All Tickets**: Use `GET /tickets` to list all available tickets.

- **Get Ticket by ID**: Use `GET /tickets/{id}` to retrieve a specific ticket by its ID.

- **Find Tickets by Ticket Name or User**:
  - By ticket name: `GET /tickets/?ticketName={ticketName}`
  - By user name: `GET /tickets/?userName={userName}`
  - By ticket owner’s name: `GET /tickets/?ownerName={ownerName}`

- **Create a New Ticket**: Use `POST /tickets/create` to create a ticket. The ticket name, description, owner’s name, asset, and priority should be specified in the JSON body.

- **Update an Existing Ticket**: Use `POST /tickets/update` to update a ticket's information, such as its description or priority.

- **Assign a User to a Ticket**: Use `POST /tickets/assignUser` to add a user to a ticket. The user’s role and forecasted hours can also be specified.

- **Add a Comment to a Ticket**: Use `POST /tickets/comment` to leave a comment on a specific ticket. Include the ticket name, username, and comment text.

---

This guide provides a high-level overview of each endpoint. For implementation, ensure requests align with the endpoint’s method (`GET` or `POST`) and that the required JSON body or parameters are provided as specified.


## Pre-requisites & Setup Instructions

### Prerequisites

* [Visual Studio Code](https://code.visualstudio.com/Download)
* [NodeJS 18.x](https://nodejs.org/en/download)
* [Teams Toolkit extension for VS Code](https://marketplace.visualstudio.com/items?itemName=TeamsDevApp.ms-teams-vscode-extension)
  NOTE: If you want to build new projects of this nature, you'll need Teams Toolkit v5.6.1-alpha.039039fab.0 or newer
* [Teams Toolkit CLI](https://learn.microsoft.com/microsoftteams/platform/toolkit/teams-toolkit-cli?pivots=version-three)
  (`npm install -g @microsoft/teamsapp-cli`)
* (optional) [Postman](https://www.postman.com/downloads/)
- [Azure Subscription] 

### Setup instructions

1. Log into Teams Toolkit using the tenant where you will run the sample.

1. If your project doesn't yet have a file **env/.env.local.user**, then create one by copying **env/.env.local.user.sample**. If you do have such a file, ensure it includes these lines.

~~~text
SECRET_STORAGE_ACCOUNT_CONNECTION_STRING=UseDevelopmentStorage=true
~~~

1. OPTIONAL: Copy the files from the **/sampleDocs** folder to OneDrive or SharePoint. Add the location of these files in the `OneDriveAndSharePoint` capability in the declarative copilot (**/appPackage/**).
   
## Adaptive Cards

                                  <<Attach adaptive card snapshots>>

## Version History

Version|Manifest version|Date|Author|Comments
-------|--|--|----|--------
1.0|1.xx |November, 2024 |Swati Arora |Initial release for Internal Repeatable IP 
1.1|1.xx|December, 2024 | Swati Arora| SAP Connector, Custom Vision to be added in next version