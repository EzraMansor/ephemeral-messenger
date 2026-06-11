# Ephemeral-Messenger (Session-Isolated Chat PoC)

A session-isolated, ephemeral chat application built with native browser ES modules, Express, and Socket.io. The architecture focuses on real-time messaging workflows that automatically self-terminate upon session expiration, bypassing traditional database overhead by decoupling event listeners from core state modules.

## Architecture & Execution Model

The system isolates sidebars, messaging layout views, and real-time events to handle dynamic view-stretching and prevent state collisions:

### 1. Viewport Flexbox & Layout Stabilization
The chat user interface relies on a strict CSS flexbox layout model designed to handle real-time content scaling:
* Sidebars and the central messaging viewport stretch dynamically to fill 100% of the vertical viewport boundary (`100vh`).
* The message input tray remains anchored as a fixed footer component at the bottom of the viewport boundary, leaving content channels scrollable without shifting UI structures.

### 2. Event Delegation & Circular Dependency Mitigation
Standard real-time modular designs often link component event handlers directly to socket initializations, resulting in circular dependencies across imports. Ephemeral-Messenger mitigates this issue by isolating client interactions:
* Handlers and runtime listeners are extracted out of the core socket initialization scope and funneled into a dedicated delegation layer (`events.js`).
* The system utilizes a central event matrix to trap client actions dynamically without relying on tight module coupling or immediate inline event handlers.

### 3. Ephemeral Session Lifecycle
Data processing occurs entirely in volatile application memory and immediate network sockets. When a browser tab terminates or a session token expires, the corresponding system context clears cleanly from the runtime stack without writing long-term trace signatures.

## Technical Structure

```text
├── public/
│   ├── index.html     # Structural layout definition (Sidebars, Chat, Input)
│   ├── index.css      # Flexbox constraints and structural height rules
│   ├── main.js        # Module bootstrap execution script
│   └── events.js      # Centralized delegated event handlers
├── server.js          # Express & Socket.io runtime orchestration engine
└── package.json       # Node environment configuration manifest
```

## Setup & Local Development

To spin up the development environment locally, clone the repository, install dependencies, and launch the orchestration server:

```bash
# Install development and execution dependencies
npm install

# Start the real-time application server
npm start
```

Point your local browser environment to `http://localhost:3000`. Open multiple isolated tab instances to simulate live ephemeral session handshakes.

## Contribution Guidelines & Implementation Backlog

When introducing new real-time components or view panes, keep style alterations isolated to strict flexbox layout rules and route all interactive client binds through the centralized delegation layer.

### Current Engineering Backlog:
* Socket Disconnect Re-synchronization: Designing an abstract network recovery buffer to catch connection drops without throwing runtime module exceptions.
* In-Memory Message Expiry Cleanups: Optimizing active server arrays to scrub text payloads automatically upon specific time limits or user focus shifts.