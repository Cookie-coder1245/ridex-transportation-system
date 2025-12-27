# 🚖 RideX: Next-Gen Smart Transportation System

> **A high-performance ride-hailing simulation engine powered by advanced Graph Algorithms and a Hybrid Python/C++ Architecture.**

RideX is a state-of-the-art transportation management system that models real-world city logistics. By treating the city as a weighted graph—where intersections are nodes and roads are edges—RideX efficiently handles complex tasks like route optimization, driver allocation, and infrastructure planning.

What sets RideX apart is its **Hybrid Architecture**: while the user interface and API are managed by **Python (Flask)**, the heavy computational lifting (Dijkstra, Prim, Kruskal) is offloaded to a **high-performance C++ engine**, ensuring lightning-fast results even as the network scales.

---

## 🚀 Key Features

### 🧠 Intelligent Core
- **Hybrid Python/C++ Engine**: Seamless integration of Python's flexibility with C++'s raw speed for graph processing.
- **Smart Dispatch**: utilitizes **Dijkstra’s Algorithm** to instantly find the nearest available driver and the optimal route to the destination.
- **Infrastructure Optimization**: Implements **Prim’s** and **Kruskal’s** algorithms to identify Minimum Spanning Trees (MST), useful for road maintenance planning and network cost optimization.
- **Workflow Management**: Uses **Topological Sort** to enforce a logical sequence of ride operations (Verify -> Assign -> Route -> ... -> Receipt).

### 🎨 Premium User Experience
- **Interactive Map**: Built with **MapLibre GL JS**, featuring a detailed real-world map of **Lahore, Pakistan**.
- **Modern UI/UX**: A polished interface featuring **FontAwesome** icons, smooth animations, and a responsive sidebar layout.
- **Real-Time Visualization**: Watch as the system visualizes routes, driver movements, and graph traversals in real-time.
- **Dynamic Feedback**: Instant fare calculations based on distance, fuel consumption, and base rates.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | HTML5, CSS3, JavaScript | Interactive UI with MapLibre GL JS for map rendering. |
| **Backend** | Python (Flask) | RESTful API to handle client requests and orchestrate services. |
| **Engine** | **C++ (STD 17)** | Compiled executables (`graph_solver.exe`) for executing graph algorithms. |
| **Communication** | IPC (Subprocess) | Robust data serialization/deserialization between Python and C++. |

---

## 📋 Prerequisites

- **Python 3.8+**
- **C++ Compiler** (g++ or MSVC) - *Pre-compiled binaries are included for Windows.*
- **Modern Web Browser** (Chrome, Edge, Firefox)

---

## ⚡ Quick Start

### 1. Installation

Clone the repository and install the Python dependencies:

```bash
# Navigate to the project directory
cd ridex_project

# Install required Python packages
pip install -r requirements.txt
```

### 2. Run the Application

Start the Flask server:

```bash
python app.py
```

### 3. Usage

Open your browser and navigate to:
👉 **`http://127.0.0.1:5000`**

---

## 📖 User Guide

### 📍 Requesting a Ride
1.  **Select Locations**: Use the dropdown menus or click the **"Map"** buttons to pinpoint your Pickup and Dropoff locations on the interactive map.
2.  **Request**: Click **"Request Ride"**. The system will:
    *   Find the nearest driver (Dijkstra).
    *   Calculate the optimal route (Dijkstra).
    *   Estimate the fare.
3.  **Confirm**: Review the fare and click **"Confirm"** to watch the driver navigate to you and complete the trip.

### 🛣️ Network Analysis (MST)
*   **Prim's Algorithm**: Click the "Prim's MST" button to visualize the most cost-effective way to connect all city nodes starting from a central point.
*   **Kruskal's Algorithm**: Click "Kruskal's MST" to see the global minimum spanning tree construction.
*   *Useful for: City planning, fiber optic laying, and road maintenance.*

### 📋 Workflow Verification
*   Click **"Show Workflow Schedule"** to see the topological ordering of the ride lifecycle. This ensures no step (like "Receipt") happens before its prerequisites (like "End Ride").

---

## 📂 Project Structure

```
ridex_project/
├── 📄 app.py                 # Flask Server Entry Point
├── 📄 api.py                 # REST API Routes
├── 📄 city_map.py            # Graph Data Structures & C++ Bridge
├── 📄 requirements.txt       # Python Dependencies
├── 🖥️ graph_solver.cpp       # C++ Source for Graph Algorithms
├── ⚙️ graph_solver.exe       # Compiled C++ Engine
├── 📁 templates/
│   └── 📄 index.html         # Main Frontend Application
├── 📁 static/
│   ├── 📁 css/               # Stylesheets
│   └── 📁 js/                # Frontend Logic
└── 📄 README.md              # Project Documentation
```

---

## 🧮 Algorithm Deep Dive

| Algorithm | Complexity | Use Case in RideX |
|-----------|------------|-------------------|
| **Dijkstra** | $O(E + V \log V)$ | Finding the shortest path for drivers and routes. |
| **Prim's** | $O(E + V \log V)$ | Building an efficient road network starting from a hub. |
| **Kruskal's** | $O(E \log E)$ | Finding the absolute minimum cost to connect all intersections. |
| **Topological Sort** | $O(V + E)$ | rigorous scheduling of the ride-hailing workflow. |

---

## 👨‍💻 Developers

Build with ❤️ by **Cookie-coder1245**.

*For educational purposes and graph theory demonstration.*
