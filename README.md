# Star Wars Legion Tracker

A comprehensive web application for creating, managing, and tracking custom Star Wars Legion units, armies, and battles.

**Live Application:** [https://nicovanwyk.github.io/legion-tracker](https://nicovanwyk.github.io/legion-tracker)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
    - [Custom Units Management](#custom-units-management)
    - [Army Builder](#army-builder)
    - [Battle Tracker](#battle-tracker)
    - [Reference System](#reference-system)
    - [User Account System](#user-account-system)
- [Custom Game Mechanics](#custom-game-mechanics)
- [Getting Started](#getting-started)
- [Technical Details](#technical-details)
- [Browser Compatibility](#browser-compatibility)
- [Roadmap](#roadmap)

## Overview

Star Wars Legion Tracker is a React-based web application designed to enhance your Star Wars Legion tabletop gaming experience, with a particular focus on custom army development. The application allows you to create and manage custom units, build balanced armies, and track your battles in real-time, all with a mobile-friendly interface.

## Features

### Custom Units Management

- **Unit Creation Interface**
    - Create detailed custom units with complete stat blocks
    - Track proxy miniature sources for each unit
    - Document conversion work for unofficial miniatures

- **Stat Management**
    - Points cost calculation
    - Detailed movement values
    - Weapon statistics (range bands, attack dice, abilities)
    - Defense values (defense dice, wounds, resilience)
    - Courage and surge values

- **Unit Customization**
    - Support for all standard unit types (Command, Corps, Special Forces, Support, Heavy, Operative)
    - Additional custom unit types (Auxiliary Forces, Strike Teams, Task Forces)
    - Custom faction management (Republic, Separatist/CIS, Rebel, Empire)
    - Upgrade slots configuration with custom upgrade types

- **Keyword System**
    - Comprehensive library of standard keywords with descriptions
    - Custom keywords management with full rules text
    - Specialized faction-specific abilities

- **Weapons Management**
    - Detailed weapon statistics
    - Custom attack dice configuration (red, black, white)
    - Weapon-specific keywords and abilities

### Army Builder

- **Army Creation**
    - Build custom armies using your created units
    - Faction-specific army lists
    - Points tracking and army composition analysis

- **Army Management**
    - Add/remove units from armies
    - Track total army points
    - Balance analysis between unit types

- **Army Validation**
    - Rules-based army validation
    - Unit type requirements tracking
    - Points limit enforcement

- **List Sharing**
    - Export army lists for sharing
    - Print army details for game reference
    - Army list versioning

### Battle Tracker

- **Real-time Battle Management**
    - Track Star Wars Legion battles through each game phase
    - Phase-specific interface changes:
        - Command Phase: Order assignment, command card selection
        - Activation Phase: Unit activation tracking
        - End Phase: Round cleanup and token management

- **Unit Tracking**
    - Order token assignment
    - Activation status
    - Suppression management
    - Wound tracking
    - Token status (aim, dodge, standby, etc.)

- **Command Management**
    - Command card selection
    - Order pool management
    - Priority tracking

- **Game State**
    - Current round tracking
    - Victory point calculation
    - Objective status

- **Battle Statistics**
    - Track battle results and history
    - Unit performance metrics
    - Win/loss records

### Reference System

- **Rules Reference**
    - Quick access to game rules and keywords
    - Searchable keyword database
    - Phase-specific rule reminders

- **Reference Panel**
    - Pop-up interface for rules lookup during gameplay
    - Context-sensitive rule displays
    - Mobile-friendly reference access

- **Keyword Library**
    - Standard keywords with full descriptions
    - Custom keywords with rules text
    - Keyword categorization (Movement, Attack, Defense, etc.)

- **Custom Rules Documentation**
    - Documentation for house rules and custom game mechanics
    - Explanation of custom unit types and their role in gameplay
    - Proxy miniature mapping guidelines

### User Account System

- **User Authentication**
    - Firebase-based authentication system
    - Account creation and management
    - Secure data storage

- **Data Management**
    - Cloud storage of all user data
    - Synchronization across devices
    - Backup and recovery options

- **Privacy Settings**
    - Control sharing of custom content
    - Public/private army lists

## Getting Started

1. Visit [https://nicovanwyk.github.io/legion-tracker](https://nicovanwyk.github.io/legion-tracker)
2. Create an account (or login if returning)
3. Start by creating your custom units
4. Build armies using your custom units
5. Use the battle tracker during your games

## Technical Details

- **Frontend**: React with Bootstrap for styling
- **Backend**: Firebase (Authentication and Firestore database)
- **Hosting**: GitHub Pages
- **State Management**: React Context API
- **Routing**: React Router
- **Authentication**: Firebase Authentication
- **Data Storage**: Firestore

## Browser Compatibility

Star Wars Legion Tracker is compatible with:

- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari
- Mobile browsers (responsive design)

*Star Wars Legion Tracker is a fan-made application and is not affiliated with or endorsed by Lucasfilm Ltd., Atomic Mass Games, or Disney.*