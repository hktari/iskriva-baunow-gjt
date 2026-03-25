# Issues Backlog

This document tracks known issues and bugs discovered during development and testing.

## Active Issues

### BUG-002: Missing Button Hover Effects

- **Component**: UI Buttons
- **Severity**: Medium
- **Status**: Open
- **Description**: No hover effects for buttons on mouse interaction.
- **Affected Elements**: Buttons across the application
- **Notes**: Issue discovered during testing phase

### BUG-003: Edit Project Button Fails

- **Component**: Projects Page - Edit Project Button
- **Severity**: High
- **Status**: Resolved
- **Description**: Editing a project failed because optional select fields submitted invalid empty values.
- **Steps to Reproduce**: Open a project, click "Edit Project", and submit while optional selects are set to None.
- **Notes**: Fixed by mapping optional select "None" values to `null` before validation.

### BUG-004: URL Redirect Defaults to Port 3000

- **Component**: Auth/Navigation
- **Severity**: High
- **Status**: Open
- **Description**: When running the application on a port other than 3000, URL redirects (e.g., after login) still redirect to port 3000 instead of the current port.
- **Steps to Reproduce**: Run app on non-3000 port and observe redirect behavior
- **Notes**: Hardcoded port in redirect logic

### BUG-005: Project Type Enumerations Missing

- **Component**: Data Types/Schema
- **Severity**: Medium
- **Status**: Open
- **Description**: Project type enumerations are not defined or missing from the codebase.
- **Steps to Reproduce**: TBD
- **Notes**: Issue discovered during testing phase

### BUG-006: Project Types Not Showing on Analytics Filter Page

- **Component**: Analytics Page - Filters
- **Severity**: High
- **Status**: Open
- **Description**: Project types are not displaying in the analytics filter dropdown.
- **Steps to Reproduce**: Navigate to analytics page and check project type filter
- **Notes**: May be related to BUG-005

### BUG-007: Missing Background on Dropdown Selectors

- **Component**: UI - Dropdown Components
- **Severity**: Medium
- **Status**: Open
- **Description**: Dropdown selectors lack background styling, making them difficult to see/use.
- **Affected Elements**:
  - Analytics filter page dropdowns
  - Country selector on Create New Project page
- **Notes**: UX issue affecting visual clarity

### BUG-008: Country Selector Missing Search Functionality

- **Component**: Create New Project Page - Country Selector
- **Severity**: Medium
- **Status**: Open
- **Description**: Country selector dropdown does not have text search functionality, making it difficult to find countries in a long list.
- **Steps to Reproduce**: Open Create New Project page and try to select a country
- **Notes**: UX improvement needed for better usability

### BUG-009: Poor Toggle State Visibility on Pills

- **Component**: Create New Project Page - Target Group & Impact Areas
- **Severity**: Medium
- **Status**: Open
- **Description**: The toggled and untoggled states on pill components (target group and impact areas) are barely noticeable, making it unclear which options are selected.
- **Steps to Reproduce**: Navigate to Create New Project page and toggle target group or impact area pills
- **Notes**: UX issue - needs better visual distinction between selected/unselected states

## Resolved Issues

### BUG-001: Advanced Filters Failing on Projects Page

- Fixed by updating SelectItem values from empty strings to "all" with proper conversion logic

### BUG-003: Edit Project Button Fails

- Fixed by mapping optional select "None" values to `null` before validation

---

_Last updated: March 2026 (BUG-001, BUG-003 resolved)_
