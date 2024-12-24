# 📌 Splitzy_web_api

This repository contains the backend API for **Splitzy**, a mobile application designed for splitting group expenses.<br><br>The backend provides a secure and scalable RESTful API to handle user authentication, group management, expense tracking, and settlements.

---

## 💡 Project Overview

The backend is built using **Node.js** and **Express.js** with **MySQL** as the database. It supports functionalities such as:

-   User authentication with **JWT**.
-   Managing groups and invitations.
-   Tracking group expenses and settlements.
-   Ensuring secure and efficient database transactions.

---

## 🛠️ Tech Stack

-   **Node.js**: Backend runtime environment.
-   **Express.js**: Web framework for creating RESTful APIs.
-   **MySQL**: Relational database for secure and structured data storage.
-   **JWT**: For user authentication and authorization.

---

## 📂 Directory Structure

```
SPLITZY_WEB_API/
├── database/
│ ├── create_tables.js # Database schema creation
│ ├── expenses.js # Database queries for expenses
│ ├── groups.js # Database queries for groups
│ ├── invitations.js # Database queries for invitations
│ ├── settlements.js # Database queries for settlements
│ └── users.js # Database queries for users
├── routes/
│ ├── auth.js # Authentication routes (signup, login, logout)
│ ├── expenses.js # Expense-related API routes
│ ├── group.js # Group management API routes
│ ├── invitations.js # Invitation-related API routes
│ ├── settleUp.js # Settlement-related API routes
│ └── users.js # User-related API routes
├── node_modules/ # Project dependencies
├── .env # Environment variables
├── .gitignore # Files and folders to ignore in Git
├── databaseConnection.js # Database connection configuration
├── index.js # Entry point for the backend server
├── package.json # Project metadata and dependencies
├── package-lock.json # Locked dependency versions
├── README.md # Project documentation
└── utils.js # Utility functions
```

---

## 📄 API Endpoints

Here is a brief overview of the API endpoints provided by this backend.

### **Authentication**

| Method | Endpoint       | Description                       |
| ------ | -------------- | --------------------------------- |
| POST   | `/auth/signup` | Register a new user.              |
| POST   | `/auth/login`  | Log in a user and return a token. |
| GET    | `/auth/logout` | Log out the current user.         |

---

### **Expense Management**

| Method | Endpoint    | Description                      |
| ------ | ----------- | -------------------------------- |
| POST   | `/expenses` | Create a new expense in a group. |

---

### **Group Management**

| Method | Endpoint                   | Description                              |
| ------ | -------------------------- | ---------------------------------------- |
| GET    | `/groups`                  | Fetch all groups for the logged-in user. |
| POST   | `/groups`                  | Create a new group.                      |
| GET    | `/groups/:groupId`         | Get details for a specific group.        |
| GET    | `/groups/:groupId/members` | Fetch all members of a specific group.   |
| DELETE | `/groups/:groupId/delete`  | Delete a specific group.                 |

---

### **Invitation Management**

| Method | Endpoint                                     | Description                            |
| ------ | -------------------------------------------- | -------------------------------------- |
| GET    | `/invitations`                               | Fetch all invitations for the user.    |
| GET    | `/invitations/count`                         | Get the count of pending invitations.  |
| POST   | `/invitations/:invitationId/:groupId/accept` | Accept an invitation to join a group.  |
| POST   | `/invitations/:invitationId/decline`         | Decline an invitation to join a group. |

---

### **Settlement Management**

| Method | Endpoint                       | Description                                |
| ------ | ------------------------------ | ------------------------------------------ |
| GET    | `/settle/:groupId`             | Get settlement details for a group.        |
| PUT    | `/settle/:settlementId/settle` | Settle an outstanding balance for a group. |
| PUT    | `/settle/:settlementId/undo`   | Undo a previously settled transaction.     |

---

### **User Management**

| Method | Endpoint                       | Description                                      |
| ------ | ------------------------------ | ------------------------------------------------ |
| GET    | `/users/search`                | Search for users by name or username.            |
| GET    | `/users/getUserInformation`    | Fetch profile information of the logged-in user. |
| PUT    | `/users/updateUserInformation` | Update the logged-in user's profile information. |

---

> This README was proofread and refined with assistance from ChatGPT.
