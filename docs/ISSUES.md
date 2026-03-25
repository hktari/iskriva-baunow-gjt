# Issues Backlog

This document tracks known issues and bugs discovered during development and testing.

## Active Issues

### BUG-001: Advanced Filters Failing on Projects Page
- **Component**: Projects Page - Advanced Filters
- **Severity**: High
- **Status**: Open
- **Description**: Components fail on the projects page, specifically the advanced filters functionality.
- **Steps to Reproduce**: TBD
- **Notes**: Issue discovered during testing phase

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
- **Status**: Open
- **Description**: The edit project button is non-functional or causes errors.
- **Steps to Reproduce**: TBD
- **Notes**: Issue discovered during testing phase

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

## Resolved Issues

_None yet_

---

*Last updated: March 2026*
