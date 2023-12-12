# Screeps AI 

## Overview
This project is an AI implementation for the Screeps game, focusing on efficient resource management, creep behavior, and room optimization. Screeps is an MMO strategy game where players program AI scripts (in JavaScript) to control units (creeps) in a persistent world.

## Project Structure
The project is organized into various modules to streamline code management:

- `config`: Contains configuration files.
- `utils`: Utility modules and helper functions.
- `creeps`: Module for managing different types of creeps.
- `creep_factory`: Handles the creation and management of creeps.
- `creep_manager`: Orchestrates and manages creeps in the game.
- `Profiler`: Profiling utility for performance analysis.
- `Room_orchestrator`: Orchestrates room-related tasks and activities.


# AI Summary

## Creep Classes

### ICreep (`ICreep.ts`)

- Abstract class for all creeps.
- Defines common attributes and methods.
- Creeps have actions like `IDLE`, `RENEW`, `BUILD`, `REPAIR`, `TRANSFER`, etc.

### Harvester (`harvester.ts`)

- Inherits from `ICreep`.
- Specialized for gathering resources and transferring to the spawn.
- Uses a logic system for decision-making.
- Includes a softlock guard.

### Builder (`builder.ts`)

- Inherits from `ICreep`.
- Specialized for building and repairing structures.
- Uses a logic system for task management.
- Includes a softlock guard.

### Upgrader (`upgrader.ts`)

- Inherits from `ICreep`.
- Specialized for upgrading the room controller.
- Uses a logic system for task management.
- Includes a softlock guard.

## Orchestrators and Managers

### Creep_manager (`creep_manager.ts`)

- Manages creeps in a room.
- Handles creation and updates of creeps.
- Manages tasks like transferring, repairing, and building.

### Room_orchestrator (`room_orchestrator.ts`)

- Orchestrates room-related tasks and activities.
- Manages
