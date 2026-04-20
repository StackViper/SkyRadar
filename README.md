# ✈️ SkyRadar - Live Flight Tracker

A production-grade, real-time web-socket based flight tracking platform split into a Node.js Backend Microservice and a React Native Frontend Architecture. 

Built strictly with **Principal Engineer Architectural Standards**, this repository represents how to correctly decouple state, optimize external API pooling, and handle thousands of WebSocket connections to mobile devices smoothly.

---

## 🏗️ Principal Engineer Architecture & Scalability

By combining these backend and frontend architectural patterns, this repository is built to scale gracefully, supporting a massive surge of concurrent users without collapsing the external OpenSky rate-limit or causing UI-thread blocking on older mobile devices.

### 🌐 Backend Architecture (Node.js + Socket.IO)

- **Domain Silos (`src/modules/flights/`)**: Business logic is separated strictly into responsibilities (Store, Service, Processor, Scheduler). This represents SOLID principles, making mocking and unit testing seamless.
- **In-Memory Singleton Cache (`flight.store.ts`)**: Acts as a high-speed cache. Even if 100,000 new clients connect simultaneously, their HTTP/WebSocket handshake reads instantly from O(1) memory instead of triggering a DB lookup or an API fetch.
- **Single Worker API Pooling**: No matter how many websocket clients connect, only **one** backend asynchronous loop polls the OpenSky API. This completely prevents rate-limiting and external API stress.
- **Recursive Timeouts over Intervals**: Utilizing `setTimeout` recursively avoids Node.js Event Loop starvation. If an API request hangs, it guarantees tasks never overlap and swallow memory (unlike native `setInterval`).
- **Stateless Microservice Ready**: The backend `flight.store` singleton is cleanly abstracted to be swapped for a Distributed `Redis Pub/Sub` cache. Once transitioned, you can scale hundreds of this backend instance dynamically via Kubernetes.
- **Graceful Teardown**: Server captures OS signals. Before terminating, it elegantly bleeds off connected WebSocket traffic to prevent data corruption during auto-scaling scale-in events.

### 📱 Frontend Architecture (React Native)

- **Reactive State Decoupling**: Global states are handled securely by `Zustand`. Components subscribe *only* to the slices of state they need. Maps update independently of the UI overlay text avoiding bottleneck main-thread freezes.
- **Animation Interpolation (Reanimated)**: Instead of the React Native Bridge passing 60 FPS coordinate data, the frontend only receives 1 socket update every 10 seconds. The frontend then calculates a smooth 2000ms visual glide path natively using C++ (`react-native-reanimated`). This keeps the JS-thread overhead at ~0% allowing older devices to render massive swarms beautifully.
- **Push-Only Strategy**: The frontend never initiates GET requests for data, keeping scaling purely vertical on the WebSockets pipeline, reducing HTTP handshake overhead massively.
- **WebSocket Fallback Agility**: The service handles connection backoffs exponentially. If the backend scaling group resets, the frontend won't DDoS the load-balancers, but safely backs off and reconnects gradually.

---

## 📁 Repository Structure

```text
/
├── backend/          # Node.js Express server + WebSocket Gateway
│   ├── src/          # Domain-driven backend modules
│   └── package.json
│
└── frontend/         # React Native (Expo) Mobile App
    ├── src/          # Clean Architecture frontend slices
    └── package.json
```

---

## 🚀 Getting Started

### 1️⃣ Start the Backend Server
Provides the WebSocket proxy, polling worker, and state caching.

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2️⃣ Start the Frontend App
Connects to the WebSocket server to render smooth interpolated map updates.

```bash
# Open a new terminal instance
cd frontend
npm install
npm run ios     # or npm run android
```

---

## 🔧 Technology Stack

**Backend:** Node.js, TypeScript, Express, Socket.IO, Axios, Zod, Winston
**Frontend:** React Native (Expo), TypeScript, Zustand, React-Native-Maps, Reanimated, Socket.IO-Client
