<<<<<<< HEAD
# RideX: Smart Transportation System Using Graphs

A lightweight ride-hailing simulation system that models a city using graph theory. Intersections are nodes, roads are weighted edges, and the system demonstrates routing, driver allocation, road optimization, and workflow scheduling in a realistic scenario.

## 🚀 Features

- **City Representation**: Weighted graph with intersections (nodes) and roads (edges)
- **Shortest Path Routing**: Dijkstra's algorithm for finding optimal routes
- **Driver Assignment**: Nearest driver allocation using graph algorithms
- **Road Optimization**: Minimum Spanning Tree (Prim's and Kruskal's algorithms)
- **Workflow Scheduling**: Topological sort for ride workflow tasks
- **Fare Calculation**: Distance-based pricing with detailed breakdown
- **Interactive Map**: MapLibre GL JS visualization with Lahore, Pakistan map
- **Precise Location Selection**: Click on map or use dropdowns
- **Car Animation**: Premium car icon animates from pickup to dropoff
- **Professional UI**: Poppins font, SVG icons, modern design

## 📋 Prerequisites

- Python 3.7 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Edge, Safari)

## 🛠️ Installation

1. **Navigate to the project directory:**
   ```bash
   cd ridex_backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

   This will install:
   - Flask (web framework)
   - Flask-CORS (CORS support)

## ▶️ How to Run

1. **Start the Flask server:**
   ```bash
   python app.py
   ```

2. **Open your browser:**
   Navigate to: `http://localhost:5000`

3. **You're ready to use RideX!**

## 📖 Usage Guide

### Request a Ride

1. **Select Pickup Location:**
   - Use the dropdown to select pickup location
   - OR click the blue "📍 Map" button and click on the map

2. **Select Dropoff Location:**
   - Use the dropdown to select dropoff location
   - OR click the red "📍 Map" button and click on the map

3. **Click "Request Ride"**

4. **Review Fare Calculation:**
   - See detailed fare breakdown (Base Fare + Distance × Rate)
   - Review pickup and dropoff locations
   - Check total fare in PKR

5. **Confirm Ride:**
   - Click "✓ Confirm & Start Ride"
   - Watch the premium car animate from pickup to dropoff

6. **Complete Ride:**
   - Click "✓ Complete Ride" when done
   - Request a new ride if needed

### Road Optimization (MST)

- Click **"Prim's MST"** to see optimized road network using Prim's algorithm
- Click **"Kruskal's MST"** to see optimized road network using Kruskal's algorithm
- Visualize minimum spanning tree on the map

### Workflow Schedule

- Click **"Show Workflow Schedule"** to see the topological sort order
- View the proper sequence: Verify → Assign → Route → Fare → Start → End → Receipt

### Map Controls (Hamburger Menu)

Click the hamburger menu (☰) in the top-right corner to access:
- **Clear Map**: Remove all routes and markers
- **Show All Nodes**: Display all city locations
- **Show All Roads**: Display all roads in the city

## 🧮 Graph Algorithms Used

1. **Dijkstra's Algorithm** – Finds shortest path for rides and nearest driver
2. **BFS/DFS** – Checks connectivity and explores the city map
3. **Prim's Algorithm (MST)** – Builds minimum-cost road network
4. **Kruskal's Algorithm (MST)** – Optimizes existing road networks
5. **Topological Sort** – Schedules ride workflow tasks in proper order

## 🏗️ Project Structure

```
ridex_backend/
├── app.py                 # Flask application and API endpoints
├── graph_algorithms.py    # Graph algorithms implementation
├── city_map.py            # City map and driver management
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # Frontend HTML template
└── README.md             # This file
```

## 🌐 API Endpoints

- `GET /` - Main application page
- `GET /api/city-map` - Get city map information
- `POST /api/request-ride` - Request a ride (body: `{pickup: int, dropoff: int}`)
- `GET /api/mst/prim` - Get MST using Prim's algorithm
- `GET /api/mst/kruskal` - Get MST using Kruskal's algorithm
- `GET /api/drivers` - Get all drivers information
- `GET /api/workflow` - Get ride workflow schedule

## 📍 City Map

The system uses Lahore, Pakistan as the city map with 20 locations:
- Anarkali (Downtown)
- Model Town
- Johar Town
- Defence Phase 5
- Gulberg
- DHA Phase 1
- And more...

## 💰 Fare Calculation

- **Base Fare**: PKR 150
- **Rate per Kilometer**: PKR 50
- **Formula**: Base Fare + (Distance in km × Rate per km)

## 🎨 Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Maps**: MapLibre GL JS
- **Fonts**: Poppins (Google Fonts)
- **Algorithms**: Graph theory (Dijkstra, BFS, DFS, Prim, Kruskal, Topological Sort)

## 📝 Example Usage

### Request Ride via API

```bash
curl -X POST http://localhost:5000/api/request-ride \
  -H "Content-Type: application/json" \
  -d '{"pickup": 0, "dropoff": 5}'
```

### Get City Map

```bash
curl http://localhost:5000/api/city-map
```

## 🔧 Troubleshooting

**Port already in use:**
- Change the port in `app.py`: `app.run(debug=True, port=5001)`

**Dependencies not installing:**
- Ensure you're using Python 3.7+
- Try: `pip install --upgrade pip` then `pip install -r requirements.txt`

**Map not loading:**
- Check browser console for errors
- Ensure internet connection (for map tiles)

## 📄 License

MIT

## 👨‍💻 Development

This is a demonstration project for graph algorithms in transportation systems.

## 🎯 Key Features Highlight

- ✅ Precise location selection (map click or dropdown)
- ✅ Fare calculation with detailed breakdown
- ✅ Premium car animation from pickup to dropoff
- ✅ Professional UI with Poppins font
- ✅ Responsive design
- ✅ No API keys required (uses OpenStreetMap tiles)

---

**Enjoy using RideX!** 🚗✨
=======
# ridex-transportation-system
>>>>>>> d7718ee235e5c2e033066eeb34593dcd0ea1e6ab
