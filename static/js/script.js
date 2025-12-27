// Initialize map
const map = new maplibregl.Map({
    container: 'map',
    style: {
        version: 8,
        sources: {
            'osm-tiles': {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors'
            }
        },
        layers: [{
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19
        }]
    },
    center: [74.3436, 31.5497],  // Lahore, Pakistan
    zoom: 12,
});
map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-right');

// Global variables
let cityMapData = null;
let currentMarkers = [];
let currentRoutes = [];
let selectionMode = null; // 'pickup', 'dropoff', or null
let selectedPickup = null;
let selectedDropoff = null;
let selectionMarkers = { pickup: null, dropoff: null };
let carMarker = null;
let animationInProgress = false;

// Load city map data
fetch('/api/city-map?t=' + Date.now())
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            cityMapData = data.data;
            populateLocationDropdowns();
            setupDropdownHandlers();
            setupMapClickHandler();
            showAllNodes();
        }
    });

// English location names for Lahore
const locationNames = {
    0: 'Anarkali (Downtown)',
    1: 'Model Town',
    2: 'Johar Town',
    3: 'Defence Phase 5',
    4: 'Ichhra',
    5: 'Gulberg',
    6: 'Faisal Town',
    7: 'Wapda Town',
    8: 'Multan Road',
    9: 'Raiwind Road',
    10: 'Barkat Market',
    11: 'Samanabad',
    12: 'Allama Iqbal Town',
    13: 'Gulshan-e-Ravi',
    14: 'Liberty Market',
    15: 'Ferozepur Road',
    16: 'DHA Phase 1',
    17: 'Shadman',
    18: 'DHA Phase 6',
    19: 'Ravi Road'
};

function populateLocationDropdowns() {
    const pickup = document.getElementById('pickup');
    const dropoff = document.getElementById('dropoff');

    Object.keys(cityMapData.nodes_coords).forEach(nodeId => {
        const name = locationNames[nodeId] || `Location ${nodeId}`;
        const option1 = new Option(name, nodeId);
        const option2 = new Option(name, nodeId);
        pickup.add(option1);
        dropoff.add(option2);
    });
}

// Handle ride request
document.getElementById('rideForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pickup = document.getElementById('pickup').value;
    const dropoff = document.getElementById('dropoff').value;

    if (!pickup || !dropoff) {
        showError('rideResult', 'Please select both pickup and dropoff locations');
        return;
    }

    if (pickup === dropoff) {
        showError('rideResult', 'Pickup and dropoff cannot be the same');
        return;
    }

    try {
        const response = await fetch('/api/request-ride', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pickup: parseInt(pickup), dropoff: parseInt(dropoff) })
        });

        const result = await response.json();
        displayRideResult(result);
        // Don't show map immediately - wait for confirmation
    } catch (error) {
        showError('rideResult', 'Error requesting ride: ' + error.message);
    }
});

let pendingRideResult = null;

function displayRideResult(result) {
    const container = document.getElementById('rideResult');
    if (!result.success) {
        container.innerHTML = `<div class="error">${result.error}</div>`;
        return;
    }

    // Store result for confirmation
    pendingRideResult = result;

    // Calculate fare breakdown
    const baseFare = 150.0;
    const perKmRate = 50.0;
    const rideDistance = result.ride_path.distance_km;
    const distanceFare = rideDistance * perKmRate;
    const PETROL_PRICE_PER_LITRE = 263.4;
    const LITRES_PER_KM = 0.1; // assumed consumption per km
    const fuelCost = rideDistance * LITRES_PER_KM * PETROL_PRICE_PER_LITRE;
    const totalFare = baseFare + distanceFare + fuelCost;

    container.innerHTML = `
        <div class="result-box">
            <h3>💰 Fare Calculation</h3>
            
            <div class="info-item">
                <span class="info-label">🚗 Driver:</span>
                <span class="info-value">${result.driver.name}</span>
            </div>
            
            <div class="info-item">
                <span class="info-label">📍 Pickup:</span>
                <span class="info-value">${locationNames[result.pickup.node] || 'Location ' + result.pickup.node}</span>
            </div>
            
            <div class="info-item">
                <span class="info-label">🏁 Dropoff:</span>
                <span class="info-value">${locationNames[result.dropoff.node] || 'Location ' + result.dropoff.node}</span>
            </div>
            
            <div class="info-item">
                <span class="info-label">🛣️ Ride Distance:</span>
                <span class="info-value">${result.ride_path.distance_km} km</span>
            </div>
            
            <div style="margin-top: 15px; padding: 15px; background: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                <div class="info-item" style="border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">
                    <span class="info-label">Base Fare:</span>
                    <span class="info-value">PKR ${baseFare.toFixed(2)}</span>
                </div>
                <div class="info-item" style="border-bottom: 1px solid #e5e7eb; padding: 8px 0;">
                    <span class="info-label">Distance (${rideDistance.toFixed(2)} km × PKR ${perKmRate}):</span>
                    <span class="info-value">PKR ${distanceFare.toFixed(2)}</span>
                </div>
                <div class="info-item" style="margin-top: 8px; padding-top: 8px; border-top: 2px solid #4F46E5;">
                    <span class="info-label" style="font-size: 16px; font-weight: 600;">Total Fare:</span>
                    <span class="info-value" style="font-size: 18px; color: #4F46E5; font-weight: 700;">PKR ${totalFare.toFixed(2)}</span>
                </div>
            </div>
            
            <button onclick="confirmRide()" style="margin-top: 15px; background: #4F46E5; padding: 12px; font-size: 16px; font-weight: 600;">
                ✓ Confirm & Start Ride
            </button>
        </div>
    `;
}

function confirmRide() {
    if (!pendingRideResult) return;

    const container = document.getElementById('rideResult');
    container.innerHTML = `
        <div class="result-box">
            <h3>✅ Ride Confirmed</h3>
            <div id="rideStatus" style="margin-top: 15px; padding: 15px; background: #ecfdf5; border-radius: 6px; border: 1px solid #a7f3d0;">
                <strong style="color: #059669; font-size: 16px;">Ride is starting!</strong>
                <div style="margin-top: 8px; font-size: 14px; color: #6b7280;">
                    Your premium ride is on the way from ${locationNames[pendingRideResult.pickup.node] || 'pickup'} to ${locationNames[pendingRideResult.dropoff.node] || 'dropoff'}
                </div>
            </div>
            <button onclick="completeRide()" style="margin-top: 15px; background: #059669; padding: 12px;">
                ✓ Complete Ride
            </button>
        </div>
    `;

    // Display route on map and start car animation
    displayRideOnMap(pendingRideResult);
    // Start car animation from source to destination
    animateCarOnRoute(pendingRideResult);
    pendingRideResult = null;
}

function completeRide() {
    const container = document.getElementById('rideResult');
    const statusDiv = document.getElementById('rideAnimationStatus');
    if (statusDiv) statusDiv.style.display = 'none';

    // Stop animation
    animationInProgress = false;
    if (carMarker) {
        carMarker.remove();
        carMarker = null;
    }

    container.innerHTML = `
        <div class="result-box">
            <h3 style="color: #059669;">🎉 Ride Completed!</h3>
            <div style="padding: 15px; background: #ecfdf5; border-radius: 6px; margin-top: 10px;">
                <p style="color: #059669; font-weight: 600;">Thank you for using RideX!</p>
                <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">
                    Your ride has been completed successfully. We hope you enjoyed your journey!
                </p>
            </div>
            <button onclick="location.reload()" style="margin-top: 10px;">
                Request New Ride
            </button>
        </div>
    `;
    // Clear map after completion
    setTimeout(() => {
        clearMap();
        showAllNodes();
    }, 2000);
}

function displayRideOnMap(result) {
    clearMap();

    // Add driver marker with car icon
    addMarker(result.driver.location_coords, `${result.driver.name} - Driver`, '#10B981', 'driver');

    // Add pickup marker with pin icon
    addMarker(result.pickup.coords, 'Pickup Location', '#3B82F6', 'pickup');

    // Add dropoff marker with flag icon
    addMarker(result.dropoff.coords, 'Dropoff Location', '#EF4444', 'dropoff');

    // Draw driver to pickup path
    if (result.driver_to_pickup.path_coords.length > 1) {
        drawRoute(result.driver_to_pickup.path_coords, '#10B981', 'Driver to Pickup', 3);
    }

    // Draw ride path
    if (result.ride_path.path_coords.length > 1) {
        drawRoute(result.ride_path.path_coords, '#4F46E5', 'Ride Path', 4);
    }

    // Fit bounds
    const allCoords = [
        ...result.driver_to_pickup.path_coords,
        ...result.ride_path.path_coords
    ];
    fitBounds(allCoords);

    // Store result for animation
    window.currentRideResult = result;

    // Start car animation from pickup to dropoff after route is displayed
    setTimeout(() => {
        animateCarOnRoute(result);
    }, 800);
}

function animateCarOnRoute(result) {
    if (animationInProgress) return;
    animationInProgress = true;

    // Remove static driver marker
    if (carMarker) {
        carMarker.remove();
    }

    // Create premium animated car marker
    const carEl = document.createElement('div');
    carEl.style.cssText = `
        width: 56px;
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        border: 4px solid #fff;
        border-radius: 50%;
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.5), 0 0 0 3px rgba(16, 185, 129, 0.2);
        z-index: 1000;
        transition: transform 0.1s linear;
        position: relative;
    `;
    // Add premium badge
    const badge = document.createElement('div');
    badge.style.cssText = `
        position: absolute;
        top: -5px;
        right: -5px;
        width: 18px;
        height: 18px;
        background: #F59E0B;
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: white;
    `;
    badge.textContent = '★';
    carEl.appendChild(badge);

    const carIcon = document.createElement('div');
    carIcon.innerHTML = createSVGIcon('car', '#ffffff');
    carIcon.style.cssText = 'width: 36px; height: 36px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));';
    carEl.appendChild(carIcon);

    // Start car from pickup location (source)
    carMarker = new maplibregl.Marker({
        element: carEl,
        anchor: 'center'
    }).setLngLat(result.pickup.coords).addTo(map);

    // Use only the ride path from pickup (source) to dropoff (destination)
    const ridePath = result.ride_path.path_coords;

    if (ridePath.length < 2) {
        animationInProgress = false;
        return;
    }

    let currentIndex = 0;
    const animateStep = () => {
        if (currentIndex >= ridePath.length - 1) {
            animationInProgress = false;
            // Car reached destination
            carEl.style.animation = 'pulse 1s infinite';
            return;
        }

        const start = ridePath[currentIndex];
        const end = ridePath[currentIndex + 1];
        const steps = 30; // More steps for smoother animation
        let stepCount = 0;

        const moveCar = () => {
            if (stepCount < steps) {
                const t = stepCount / steps;
                const lng = start[0] + (end[0] - start[0]) * t;
                const lat = start[1] + (end[1] - start[1]) * t;
                carMarker.setLngLat([lng, lat]);
                stepCount++;
                requestAnimationFrame(moveCar);
            } else {
                currentIndex++;
                animateStep();
            }
        };
        moveCar();
    };

    // Start animation after a brief delay
    setTimeout(() => {
        animateStep();
    }, 500);
}

async function showMST(algorithm) {
    const container = document.getElementById('mstResult');
    container.innerHTML = '<div class="loading">Loading...</div>';

    try {
        const response = await fetch(`/api/mst/${algorithm}`);
        const result = await response.json();

        if (result.success) {
            container.innerHTML = `
                <div class="result-box">
                    <h3>${result.data.algorithm}'s Algorithm</h3>
                    <div class="info-item">
                        <span class="info-label">Total Edges:</span>
                        <span class="info-value">${result.data.total_edges}</span>
                    </div>
                </div>
            `;
            displayMSTOnMap(result.data);
        } else {
            showError('mstResult', result.error);
        }
    } catch (error) {
        showError('mstResult', 'Error: ' + error.message);
    }
}

function displayMSTOnMap(mstData) {
    clearMap();

    // Draw all MST edges
    mstData.edge_coords.forEach(edge => {
        drawRoute([edge.u_coords, edge.v_coords], '#059669', `MST Edge (${edge.weight} km)`);
    });

    // Add markers for all nodes in MST
    const nodes = new Set();
    mstData.edge_coords.forEach(edge => {
        nodes.add(edge.u);
        nodes.add(edge.v);
    });

    nodes.forEach(nodeId => {
        const coords = cityMapData.nodes_coords[nodeId];
        const name = locationNames[nodeId] || `Location ${nodeId}`;
        addMarker(coords, name, '#6B7280', 'default', parseInt(nodeId));
    });

    // Fit bounds to MST
    const allCoords = [];
    mstData.edge_coords.forEach(edge => {
        allCoords.push(edge.u_coords, edge.v_coords);
    });
    fitBounds(allCoords);
}

async function showWorkflow() {
    const container = document.getElementById('workflowResult');
    container.innerHTML = '<div class="loading">Loading...</div>';

    try {
        const response = await fetch('/api/workflow');
        const result = await response.json();

        if (result.success) {
            const workflow = result.data.workflow.map((step, index) =>
                `<li>${index + 1}. ${step}</li>`
            ).join('');

            container.innerHTML = `
                <div class="result-box">
                    <h3>Workflow Schedule (Topological Sort)</h3>
                    <ol class="workflow-list">${workflow}</ol>
                </div>
            `;
        } else {
            showError('workflowResult', result.error);
        }
    } catch (error) {
        showError('workflowResult', 'Error: ' + error.message);
    }
}

function showCityMap() {
    if (!cityMapData) return;

    const container = document.getElementById('cityMapResult');
    container.innerHTML = `
        <div class="result-box">
            <h3>City Information</h3>
            <div class="info-item">
                <span class="info-label">Total Nodes:</span>
                <span class="info-value">${cityMapData.total_nodes}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Total Roads:</span>
                <span class="info-value">${cityMapData.total_edges}</span>
            </div>
        </div>
    `;
}

function showAllNodes() {
    if (!cityMapData) return;
    clearMap();

    Object.keys(cityMapData.nodes_coords).forEach(nodeId => {
        const coords = cityMapData.nodes_coords[nodeId];
        const name = locationNames[nodeId] || `Location ${nodeId}`;
        // Only add if not already selected (check if coordinates match)
        let isPickup = false;
        let isDropoff = false;

        if (selectionMarkers && selectionMarkers.pickup) {
            try {
                const pickupLngLat = selectionMarkers.pickup.getLngLat();
                if (pickupLngLat && Math.abs(pickupLngLat.lng - coords[0]) < 0.0001 &&
                    Math.abs(pickupLngLat.lat - coords[1]) < 0.0001) {
                    isPickup = true;
                }
            } catch (e) {
                // Marker might not have getLngLat method, skip check
            }
        }

        if (selectionMarkers && selectionMarkers.dropoff) {
            try {
                const dropoffLngLat = selectionMarkers.dropoff.getLngLat();
                if (dropoffLngLat && Math.abs(dropoffLngLat.lng - coords[0]) < 0.0001 &&
                    Math.abs(dropoffLngLat.lat - coords[1]) < 0.0001) {
                    isDropoff = true;
                }
            } catch (e) {
                // Marker might not have getLngLat method, skip check
            }
        }

        if (!isPickup && !isDropoff) {
            addMarker(coords, name, '#6B7280', 'default', parseInt(nodeId));
        }
    });

    const allCoords = Object.values(cityMapData.nodes_coords);
    fitBounds(allCoords);
}

function showAllEdges() {
    if (!cityMapData) return;
    clearMap();
    showAllNodes();

    cityMapData.edges.forEach(edge => {
        drawRoute([edge.u_coords, edge.v_coords], '#9CA3AF', `Road (${edge.weight} km)`);
    });
}


const nodeColors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];

// Map utility functions with better icons and colors
function addMarker(coords, title, color, iconType = 'default', nodeId = null) {
    const el = document.createElement('div');
    el.className = 'marker';

    // Create icon based on type
    let iconHTML = '';
    let size = '30px';
    let bgColor = color;
    let borderColor = color;

    if (iconType === 'driver' || iconType === 'car-moving') {
        iconHTML = '🚗';
        size = '40px';
        bgColor = 'white';
        borderColor = '#10B981';
    } else if (iconType === 'pickup') {
        iconHTML = '📍';
        size = '35px';
        bgColor = 'white';
        borderColor = '#3B82F6';
    } else if (iconType === 'dropoff') {
        iconHTML = '🏁';
        size = '35px';
        bgColor = 'white';
        borderColor = '#EF4444';
    } else {
        // Default node - use vibrant colors
        iconHTML = '●';
        if (nodeId !== null && nodeColors[nodeId % nodeColors.length]) {
            bgColor = nodeColors[nodeId % nodeColors.length];
            borderColor = bgColor;
        } else {
            bgColor = color;
            borderColor = color;
        }
        size = '28px';
    }

    el.style.cssText = `
        width: ${size};
        height: ${size};
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: ${bgColor};
        border: 3px solid ${borderColor};
        border-radius: 50%;
        box-shadow: 0 3px 12px rgba(0,0,0,0.5);
        cursor: pointer;
        font-size: ${iconType === 'default' ? '18px' : '24px'};
        transition: transform 0.2s ease;
    `;
    el.innerHTML = iconHTML;
    el.title = title;

    // No hover scaling to keep markers static on hover
    const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center'
    })
        .setLngLat(coords)
        .addTo(map);

    currentMarkers.push(marker);
    return marker;
}

function drawRoute(coords, color, name, width = 4) {
    if (coords.length < 2) return;

    const sourceId = `route-${Date.now()}-${Math.random()}`;
    const layerId = `route-layer-${Date.now()}-${Math.random()}`;

    // Add source with full geometry
    map.addSource(sourceId, {
        type: 'geojson',
        data: {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: coords
            }
        }
    });

    // Add layer with initial opacity 0 (invisible)
    map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': color,
            'line-width': width,
            'line-opacity': 0
        }
    });

    // Store for later cleanup
    currentRoutes.push({ sourceId, layerId });

    // Fade in the line smoothly (duration 800ms)
    map.setPaintProperty(layerId, 'line-opacity', 0.8);
    // Optionally, you could animate the line dasharray for a drawing effect.
}

function fitBounds(coords) {
    if (coords.length === 0) return;

    const bounds = coords.reduce((bounds, coord) => {
        return bounds.extend(coord);
    }, new maplibregl.LngLatBounds(coords[0], coords[0]));

    map.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000
    });
}

function clearMap() {
    // Remove all markers except selection markers
    if (selectionMarkers) {
        currentMarkers.forEach(marker => {
            // Don't remove selection markers
            if (marker !== selectionMarkers.pickup && marker !== selectionMarkers.dropoff) {
                marker.remove();
            }
        });
        currentMarkers = currentMarkers.filter(m =>
            m === selectionMarkers.pickup || m === selectionMarkers.dropoff
        );
    } else {
        currentMarkers.forEach(marker => marker.remove());
        currentMarkers = [];
    }

    // Remove car marker if exists
    if (carMarker) {
        carMarker.remove();
        carMarker = null;
    }

    // Remove all routes
    currentRoutes.forEach(route => {
        if (map.getLayer(route.layerId)) {
            map.removeLayer(route.layerId);
        }
        if (map.getSource(route.sourceId)) {
            map.removeSource(route.sourceId);
        }
    });
    currentRoutes = [];
    animationInProgress = false;
}

function showError(containerId, message) {
    document.getElementById(containerId).innerHTML = `<div class="error">${message}</div>`;
}

// Setup map click handler for precise location selection
function setupMapClickHandler() {
    map.on('click', (e) => {
        if (!selectionMode || !cityMapData) return;

        const clickedCoords = [e.lngLat.lng, e.lngLat.lat];

        // Find nearest node
        const nearestNode = findNearestNode(clickedCoords);

        if (nearestNode) {
            selectLocation(selectionMode, nearestNode.id, nearestNode.coords, nearestNode.name);
        }
    });
}

// Find nearest node to clicked coordinates
function findNearestNode(coords) {
    if (!cityMapData) return null;

    let nearestNode = null;
    let minDistance = Infinity;

    Object.keys(cityMapData.nodes_coords).forEach(nodeId => {
        const nodeCoords = cityMapData.nodes_coords[nodeId];
        const distance = calculateDistance(coords, nodeCoords);

        if (distance < minDistance) {
            minDistance = distance;
            nearestNode = {
                id: parseInt(nodeId),
                coords: nodeCoords,
                name: locationNames[nodeId] || `Location ${nodeId}`
            };
        }
    });

    return nearestNode;
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in km
    const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
    const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Set selection mode
function setSelectionMode(mode) {
    selectionMode = mode;

    // Update button styles
    document.getElementById('pickupBtn').style.background = mode === 'pickup' ? '#1e40af' : '#3B82F6';
    document.getElementById('dropoffBtn').style.background = mode === 'dropoff' ? '#991b1b' : '#EF4444';

    // Update cursor
    map.getCanvas().style.cursor = 'crosshair';

    // Show instruction
    const instruction = mode === 'pickup'
        ? 'Click on the map to select pickup location'
        : 'Click on the map to select dropoff location';

    showMapInstruction(instruction);
}

// Select location
function selectLocation(type, nodeId, coords, name) {
    if (!selectionMarkers) {
        selectionMarkers = { pickup: null, dropoff: null };
    }

    if (type === 'pickup') {
        selectedPickup = { id: nodeId, coords, name };
        document.getElementById('pickup').value = nodeId;
        const pickupDisplay = document.getElementById('pickupDisplay');
        if (pickupDisplay) {
            pickupDisplay.textContent = `✓ Selected: ${name}`;
        }

        // Add/update pickup marker
        if (selectionMarkers.pickup) {
            selectionMarkers.pickup.remove();
        }
        selectionMarkers.pickup = addMarker(coords, `Pickup: ${name}`, '#3B82F6', 'pickup');

        // Fly to location
        map.flyTo({
            center: coords,
            zoom: 14,
            speed: 1.2
        });
    } else if (type === 'dropoff') {
        selectedDropoff = { id: nodeId, coords, name };
        document.getElementById('dropoff').value = nodeId;
        const dropoffDisplay = document.getElementById('dropoffDisplay');
        if (dropoffDisplay) {
            dropoffDisplay.textContent = `✓ Selected: ${name}`;
        }

        // Add/update dropoff marker
        if (selectionMarkers.dropoff) {
            selectionMarkers.dropoff.remove();
        }
        selectionMarkers.dropoff = addMarker(coords, `Dropoff: ${name}`, '#EF4444', 'dropoff');

        // Fly to location
        map.flyTo({
            center: coords,
            zoom: 14,
            speed: 1.2
        });
    }

    // Reset selection mode
    selectionMode = null;
    map.getCanvas().style.cursor = '';
    document.getElementById('pickupBtn').style.background = '#3B82F6';
    document.getElementById('dropoffBtn').style.background = '#EF4444';
    hideMapInstruction();
}

// Show map instruction
function showMapInstruction(message) {
    let instructionDiv = document.getElementById('mapInstruction');
    if (!instructionDiv) {
        instructionDiv = document.createElement('div');
        instructionDiv.id = 'mapInstruction';
        instructionDiv.style.cssText = `
            position: absolute;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: #4F46E5;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1001;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            font-size: 14px;
        `;
        document.querySelector('.map-container').appendChild(instructionDiv);
    }
    instructionDiv.textContent = message;
    instructionDiv.style.display = 'block';
}

// Hide map instruction
function hideMapInstruction() {
    const instructionDiv = document.getElementById('mapInstruction');
    if (instructionDiv) {
        instructionDiv.style.display = 'none';
    }
}

// Setup dropdown change handlers after data loads
function setupDropdownHandlers() {
    const pickupSelect = document.getElementById('pickup');
    const dropoffSelect = document.getElementById('dropoff');

    pickupSelect.addEventListener('change', (e) => {
        if (!selectionMarkers) {
            selectionMarkers = { pickup: null, dropoff: null };
        }

        if (e.target.value && cityMapData) {
            const nodeId = parseInt(e.target.value);
            const coords = cityMapData.nodes_coords[nodeId];
            const name = locationNames[nodeId] || `Location ${nodeId}`;
            selectLocation('pickup', nodeId, coords, name);
        } else {
            if (selectionMarkers.pickup) {
                selectionMarkers.pickup.remove();
                selectionMarkers.pickup = null;
            }
            const pickupDisplay = document.getElementById('pickupDisplay');
            if (pickupDisplay) {
                pickupDisplay.textContent = '';
            }
            selectedPickup = null;
        }
    });

    dropoffSelect.addEventListener('change', (e) => {
        if (!selectionMarkers) {
            selectionMarkers = { pickup: null, dropoff: null };
        }

        if (e.target.value && cityMapData) {
            const nodeId = parseInt(e.target.value);
            const coords = cityMapData.nodes_coords[nodeId];
            const name = locationNames[nodeId] || `Location ${nodeId}`;
            selectLocation('dropoff', nodeId, coords, name);
        } else {
            if (selectionMarkers.dropoff) {
                selectionMarkers.dropoff.remove();
                selectionMarkers.dropoff = null;
            }
            const dropoffDisplay = document.getElementById('dropoffDisplay');
            if (dropoffDisplay) {
                dropoffDisplay.textContent = '';
            }
            selectedDropoff = null;
        }
    });
}

// Wait for map to load
map.on('load', () => {
    console.log('Map loaded');
});
