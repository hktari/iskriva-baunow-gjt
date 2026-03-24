# Frontend Fields Documentation

## Project Fields

### Required Fields
- **project_value** (free entry field, required)
  - Description: Total project value
  - Formula: Investment costs + Staff costs + Administrative costs + Overhead costs + Other costs
  - Format: Numeric with currency format (e.g., 1.000,00 EUR)
  - Filtering: Yes (range, greater than, less than conditions)

### Optional Fields
- **investment_costs** (free entry field, optional)
  - Description: Investment costs component
  - Format: Numeric with currency format (e.g., 1.000,00 EUR)
  - Filtering: Yes (range, greater than, less than conditions)

## KPI (Key Performance Indicator) Fields

### Common KPI Structure
Each KPI contains the following fields:

#### Core Fields
- **indicator_name** (required input, filtering identifier)
  - Description: Name of the KPI indicator
  - Filtering: Yes (range, greater than, less than conditions, multiple entries possible)

- **number_format** (not an identifier, field visible only during indicator creation)
  - Description: Number formatting options
  - Options:
    - decimals: yes/no
    - 1000 separators: yes/no
  - Visibility: Creation only, not in final view

- **target_value** (required input, filtering identifier)
  - Description: Target value for the KPI
  - Filtering: Yes (range, greater than, less than conditions)

- **value_achieved** (required input, not an identifier)
  - Description: Actual achieved value
  - Examples: Various numeric formats based on unit

- **unit** (required input, not an identifier)
  - Description: Unit of measurement
  - Examples: EUR, MW h/year, %, tonnes/year, persons, km²

- **updated** (optional input, not an identifier)
  - Description: Date selection field
  - Format: Date selection
  - Note: Set date format first

### Specific KPI Examples

#### 1. Amount of Subsidies
- **indicator_name**: "Amount of subsidies"
- **number_format**: decimals no, 1000 separators yes
- **target_value**: 5.000
- **value_achieved**: 4.000
- **unit**: EUR
- **updated**: Q2/2025

#### 2. Financial Savings per Year
- **indicator_name**: "Financial savings per year"
- **number_format**: decimals no, 1000 separators yes
- **target_value**: 5.000
- **value_achieved**: 4.000
- **unit**: EUR
- **updated**: 06/2025

#### 3. Renewable Energy Produced per Year
- **indicator_name**: "Renewable energy produced per year"
- **number_format**: decimals no, 1000 separators yes
- **target_value**: 110
- **value_achieved**: 90
- **unit**: MW h/year
- **updated**: Q2/2025

#### 4. Energy Saved per Year
- **indicator_name**: "Energy saved per year"
- **number_format**: decimals no, 1000 separators yes
- **target_value**: 1.922
- **value_achieved**: 1.222
- **unit**: MW h/year
- **updated**: 21/06/2025

#### 5. Percentage Energy Saved per Year
- **indicator_name**: "Percentage energy saved per year"
- **number_format**: decimals no, 1000 separators no
- **target_value**: 65
- **value_achieved**: 50
- **unit**: %
- **updated**: Q2/2025

#### 6. CO₂eq Reduction per Year
- **indicator_name**: "CO₂eq reduction per year"
- **number_format**: decimals yes, 1000 separators yes
- **target_value**: 1.128,55
- **value_achieved**: 928,55
- **unit**: tonnes/year
- **updated**: 06/2025

#### 7. Percentage CO₂eq Reduction per Year
- **indicator_name**: "Percentage CO₂eq reduction per year"
- **number_format**: decimals no, 1000 separators no
- **target_value**: 34
- **value_achieved**: 30
- **unit**: % CO₂/year
- **updated**: 06/2025

#### 8. Number of Educated Persons
- **indicator_name**: "Number of educated persons"
- **number_format**: decimals no, 1000 separators yes
- **target_value**: 1.000
- **value_achieved**: 1.100
- **unit**: persons
- **updated**: 06/2025
- **Note**: Related to BauNOW project capacity building activities

#### 9. Restored or Protected Natural Area
- **indicator_name**: "Restored or Protected natural area"
- **number_format**: decimals no, 1000 separators yes
- **target_value**: 1.000
- **value_achieved**: 1.000
- **unit**: km²
- **updated**: 06/2025

## Field Types Summary

### Input Types
- **Free entry fields**: For numeric values (project_value, investment_costs, target_value, value_achieved)
- **Selection fields**: For number format options (decimals, 1000 separators)
- **Date selection fields**: For updated dates
- **Unit fields**: Predefined units based on KPI type

### Validation Rules
- **Required fields**: project_value, indicator_name, target_value, value_achieved, unit
- **Optional fields**: investment_costs, updated
- **Format constraints**: Numeric values with appropriate formatting based on number_format settings

### Filtering Capabilities
- **Project fields**: Range filtering, greater than, less than conditions
- **KPI fields**: Range filtering, greater than, less than conditions
- **Multi-entry filtering**: Possible for indicator_name field
