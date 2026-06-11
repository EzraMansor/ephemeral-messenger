# ADHD Pomodoro (Time-Variance Engine)

A performance-compensated, dual-loop timing application built with native browser ES modules and jQuery. Unlike static countdown timers, this tool calculates cumulative variance metrics (deltas) across a dynamic list of serialized tasks to track execution efficiency in real time.

# Architecture & Execution Model

## The core engine handles scheduling and synchronization using a decoupled state structure:
### 1. Dual-Loop Synchronization Matrix

The application updates two independent counters simultaneously within a unified interval loop: time (the cumulative duration pool of all remaining tasks) and taskTime (the allocation for the current active task sequence).
### 2. High-Fidelity Clock Drift Compensation

Standard browser event loops (setInterval) fluctuate based on CPU thread throttling and event loop latency. To ensure absolute tracking accuracy, this engine employs a manual execution buffer offset:
* Captures a high-resolution time reference baseline (performance.now()) upon initialization.
* Tracks time drift differentials (timeElapsed) across execution blocks.
* Compensates for multi-second system pauses (e.g., background tab resource sleeping) using an adaptive parsing check while stepping back into focus.

### 3. Asynchronous Data Persistence

Application states serialize into individual task objects containing state flags (name, time, isCompleted). Mutations to the document object model trigger immediate stringified transactions to localStorage, protecting current metrics against hardware resets or tab updates.

## Technical Structure
```
├── index.html        # Main interface layout
├── index.css         # Structural flexible layout specifications
├── main.js          # Execution bootstrap script
├── task.js          # Core DOM management & delegated event hooks
└── timer.js         # Synchronization engine & mathematical variance operations
```

## Setup & Local Development

Because this application utilizes native browser ES modules (type="module"), loading the entry point straight from the local file system (file://) will trigger browser CORS security blocks.

To run the codebase locally, execute a local web server from your workspace root.

Using python:
`python -m http.server 8000`

Using Node.js (http-server):
`npx http-server -p 8000`

Point your local browser environment to http://localhost:8000.

## Contribution Guidelines & Implementation Backlog

For developers looking to branch or modify the execution workflows, prioritize structural decoupling. Keep DOM parsing boundaries clean inside task.js and mathematical state alterations inside timer.js.

## Current Engineering Backlog:
* ### Storage Intercept Optimization:
 Transitioning real-time storage sync operations from immediate structural transitions to fixed snapshot saves to prevent high-frequency write overhead.

* ### Timestamp Re-synchronization:
 Refactoring tab-recovery tracking to leverage a static Date.now() baseline compare on wake, bypassing manual calculation loops entirely.