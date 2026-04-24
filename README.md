# ✈️ SkyRadar: Real-Time Global Flight Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Zustand](https://img.shields.io/badge/State-Zustand-orange)](https://github.com/pmndrs/zustand)

**SkyRadar** is a production-grade, real-time flight tracking system engineered for high-frequency data ingestion and smooth mobile visualization. Built with a decoupled microservice-ready architecture, it leverages WebSockets to stream live aircraft telemetry from the OpenSky Network directly to a high-performance React Native frontend.

---

## 🏗️ System Architecture

SkyRadar is designed with scalability and performance at its core, divided into two primary subsystems:

### 📡 High-Ingestion Backend
- **Core Engine**: Node.js & Express with TypeScript for strict type safety.
- **Telemetry Processing**: A dedicated `FlightProcessor` and `FlightScheduler` handle periodic polling of global flight data, ensuring efficient delta-updates.
- **Real-Time Stream**: Leverages **WebSocket Gateway** to push low-latency aircraft state vectors to connected clients.
- **Reliability**: Integrated health checks and structured logging for production observability.

### 📱 Premium Mobile Frontend
- **Framework**: Expo / React Native with a focus on cross-platform performance.
- **Smooth Motion Engine**: Uses `AnimatedRegion` and **React Native Reanimated** to interpolate flight positions over a 10-second window, eliminating "jitter" from discrete updates.
- **Spatial Visualization**: `react-native-maps` integration with optimized dark-themed Google Maps markers.
- **State Ingestion**: Reactive state management with **Zustand** that handles high-throughput WebSocket events without UI blocking.
- **Design Language**: Modern Glassmorphism UI using `expo-blur` and linear gradients.

---

## 🚀 Key Features

- **Live Flight Vectors**: Real-time position tracking with latitude, longitude, and heading-aware markers.
- **Smooth Animation Engine**: Aircraft markers glide across the map using 8-second linear interpolation between 10-second data updates.
- **Auto-Fit View**: The map intelligently zooms and pans to keep all active flights centered in the viewport.
- **Persistent Flight Trails**: Dotted polylines visualize the most recent 5 recorded positions for every aircraft.
- **Connection Awareness**: Dedicated Status Banner showing real-time socket health: `Connecting`, `Live`, `Reconnecting`, and `Offline`.
- **Deep Data Inspection**: Interactive info cards displaying Callsign, ICAO, Altitude, Velocity, and Vertical Rate stats.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Backend** | Node.js, Express, TypeScript |
| **Real-time** | Native WebSockets |
| **State Management** | Zustand |
| **Styling** | Vanilla CSS-in-JS + expo-blur (Glassmorphism) |
| **Animations** | React Native Reanimated & AnimatedRegion |
| **Maps** | React Native Maps (Google Maps SDK) |
| **Icons** | Lucide-React-Native |

---

## 📂 Project Structure

```text
/
├── backend/
│   ├── src/
│   │   ├── modules/flight/    # Core flight logic, store, and services
│   │   ├── sockets/           # WebSocket gateway implementation
│   │   └── scheduler/         # OpenSky polling engine
│   └── .env                   # API keys and port configuration
│
└── frontend/
    ├── src/
    │   ├── components/        # Reusable UI (Markers, Cards, Status Banner)
    │   ├── hooks/             # WebSocket and lifecycle hooks
    │   ├── store/             # Zustand global state (flights, connection)
    │   ├── services/          # Decoupled WebSocket communication
    │   └── utils/             # Helper formatters and dark-map themes
    └── App.tsx                # Context providers and root entry
```

---

## 🏁 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo Go app on your mobile device (to scan the QR code)

### 2. Backend Setup
```bash
cd backend
npm install
# Configure your OPENSKY credentials in .env
npm run start 
```

### 3. Frontend Setup
```bash
cd frontend
npm install
# Update WS_URL in src/utils/constants.ts to your local IP
npx expo start
```

---

## ⚙️ Deep Dive: Working Principles

To achieve a seamless, low-latency tracking experience, SkyRadar operates on a cyclic data pipeline orchestrated across three distinct layers:

### 1. The Ingestion Cycle (Backend)
Instead of overwhelming the client with raw API requests, the backend serves as a **Telemetry Aggregator**. 
- **Discrete Polling**: The `FlightScheduler` executes a polling job every 10 seconds against the OpenSky REST API.
- **State Deduplication**: Incoming state vectors are normalized and stored in a memory-efficient `FlightStore`.
- **Event Broadcasting**: Once data is processed, the backend emits a single `flight_update` event via WebSockets to all connected clients, reducing redundant network overhead.

### 2. Temporal Interpolation (The "Smoothness" Secret)
A common pitfall in flight trackers is the "teleportation" effect, where aircraft jump from point A to B every update. SkyRadar solves this using **Temporal Interpolation**:
- **Movement Window**: We define an animation duration slightly shorter than the polling interval (e.g., 8 seconds for a 10s interval).
- **Linear Gating**: When a new coordinate arrives, we don't snap the marker. Instead, we use `AnimatedRegion` to calculate the vector from the current position to the new one and shift the marker linearly over time.
- **Heading Continuity**: Heading (rotation) is handled similarly, ensuring planes don't snap 90 degrees instantly but rotate smoothly toward their new vector.

### 3. Reactive UI Propagation (Frontend)
High-frequency socket events can easily cause "re-render storms" in React. We mitigate this through:
- **Zustand State Gating**: The WebSocket service updates the Zustand store directly. Since Zustand operates outside the standard React render cycle, we only trigger UI updates in components that specifically subscribe to changed flight IDs.
- **Spatial Memoization**: Markers are rendered as atomic components. Only the marker whose aircraft has moved receives a prop change, keeping the Map engine's reconciler footprint extremely small.

---

## 🔧 Engineering Excellence

- **Jitter-Free Movement**: By calculating the delta between current and next position and applying a linear animation over 8 seconds, we achieve a fluid movement that mimics real-time radar, even with a 10s polling interval.
- **Optimized Rendering**: Markers are optimized using standard React `memo` and selective re-renders to ensure high frame rates on lower-end mobile devices.
- **Resilient Connectivity**: The WebSocket service implements exponential backoff for reconnections, ensuring the app stays alive during network switches.

---

## 🗺️ Roadmap
- [ ] **Path Replay**: Historical flight path visualization for the last 24 hours.
- [ ] **Arrival Alerts**: Push notifications when a tracked flight enters a predefined geo-fence.
- [ ] **Enhanced Metadata**: Integration of external APIs for Aircraft models and Airline logos.
- [ ] **Offline Mode**: Caching last known positions for spotty connections.

---

Developed with ❤️ for the **Microrider** Project.
