# Expense Tracker Application

## Project Description

The Expense Tracker is a comprehensive web-based financial management application designed to help users monitor and analyze their personal spending habits. The application provides an intuitive interface for recording daily expenses, setting monthly budgets, and visualizing spending patterns across different categories. Built with modern web technologies and cloud-based infrastructure, the system offers real-time data synchronization and persistent storage, enabling users to access their financial information from any device with internet connectivity.

The application emphasizes user experience through a clean, responsive design that adapts seamlessly to various screen sizes, from mobile devices to desktop computers. Users can authenticate securely through their Google accounts, eliminating the need for separate credential management while leveraging Google's robust authentication infrastructure.

## Tech Stack

- **Frontend Framework** - React

- **Styling** - Tailwind CSS

- **Backend and Database**
    - Firebase Authentication 
    - Cloud Firestore
    - Firebase SDK 

- **Data Visualization**
    - Chart.js
    - react-chartjs-2
    - Chart Types Implemented 
    - Horizontal bar charts for category-wise expense comparison
    - Pie charts for proportional spending distribution

## Features

### Authentication and User Management
- Google OAuth-based authentication for secure and convenient user access
- Automatic user profile creation upon first login
- Persistent session management across browser sessions
- Secure sign-out functionality

### Budget Management
- Set and update monthly budget targets
- Real-time calculation of remaining budget based on recorded expenses
- Visual indicators for budget status (positive balance in green, deficit in red)
- Budget persistence across sessions through cloud storage

### Expense Tracking
- Add new expenses with detailed information including:
  - Descriptive text for expense identification
  - Monetary amount with decimal precision
  - Date selection with validation against future dates
  - Category classification from predefined options
- Comprehensive expense list with chronological ordering
- Individual expense deletion with confirmation dialog
- Real-time synchronization across all user devices

### Expense Categories
The application supports twelve distinct expense categories:
- Shopping
- Food
- Travel
- Clothes
- Groceries
- Rent
- Bills
- Entertainment
- Study
- Cosmetics
- Healthcare
- Others

### Filtering and Analysis
- Multiple time-based filtering options:
  - All-time view: Complete expense history
  - Yearly view: Expenses aggregated by year
  - Monthly view: Detailed monthly breakdowns
- Dynamic year and month selection based on available expense data
- Automatic recalculation of totals and visualizations based on selected filters

### Data Visualization
- Pie chart representation of spending distribution across categories
- Horizontal bar chart for quick category comparison
- Miniature bar chart in dashboard summary for at-a-glance insights
- Interactive charts with hover tooltips displaying exact values

### User Interface Features
- Responsive design adapting to mobile, tablet, and desktop viewports
- Time-aware greeting messages (Good Morning, Good Afternoon, Good Evening)
- Loading states with animated spinners during data fetches
- Error handling with user-friendly messages
- Modal dialog for expense entry
- Form validation preventing invalid data submission
- Confirmation dialogs for destructive actions

## System Architecture

### Architecture Overview
The application follows a client-server architecture with a single-page application (SPA) frontend and cloud-based backend services.

### Data Flow

#### Authentication Flow
1. User initiates Google sign-in from HomePage
2. Firebase Authentication handles OAuth process
3. Upon successful authentication, user object is created
4. System checks for existing user document in Firestore
5. If new user, creates user document with default budget
6. Application redirects to DashboardPage

#### Expense Management Flow
1. User opens AddExpenseModal through dashboard button
2. User enters expense details (description, amount, category, date)
3. Form validation ensures data integrity
4. Valid submission triggers Firestore document creation
5. Real-time listener updates local state immediately
6. UI reflects new expense without page refresh

#### Data Synchronization Flow
1. Component mounts and establishes Firestore listeners
2. Listeners monitor user document and expenses collection
3. Any database changes trigger callback functions
4. State updates cause React to re-render affected components
5. useMemo hooks optimize derived data calculations
6. Charts and summaries update automatically


## Conclusion

The Expense Tracker application demonstrates the effective integration of modern web technologies to create a functional financial management tool. Through its combination of real-time data synchronization, intuitive user interface, and comprehensive visualization features, the application provides users with meaningful insights into their spending habits while maintaining simplicity and ease of use.

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/vlCa2ep6)
