"""
City Map and Driver Management for RideX
"""
import subprocess
import math
import os
import sys
import random
from typing import List, Dict, Tuple, Set, Optional

# Ride workflow dependencies
RIDE_WORKFLOW_DEPENDENCIES = {
    'Verify': [],
    'Assign': ['Verify'],
    'Route': ['Assign'],
    'Fare': ['Route'],
    'Start': ['Fare'],
    'End': ['Start']
}


class Graph:
    """Weighted graph representation using adjacency list"""
    
    def __init__(self):
        self.adjacency_list: Dict[int, List[Tuple[int, float]]] = {}
        self.nodes: Set[int] = set()
    
    def add_edge(self, u: int, v: int, weight: float):
        """Add weighted edge between nodes u and v"""
        if u not in self.adjacency_list:
            self.adjacency_list[u] = []
        if v not in self.adjacency_list:
            self.adjacency_list[v] = []
        
        self.adjacency_list[u].append((v, weight))
        self.adjacency_list[v].append((u, weight))
        self.nodes.add(u)
        self.nodes.add(v)
    
    def get_neighbors(self, node: int) -> List[Tuple[int, float]]:
        """Get all neighbors of a node with weights"""
        return self.adjacency_list.get(node, [])


class GraphAlgorithms:
    """Collection of graph algorithms for RideX using C++ backend"""
    
    @staticmethod
    def _run_cpp_solver(input_str: str, algo: str, args: List[str] = []) -> List[str]:
        """Execute the C++ graph solver"""
        import math
        current_dir = os.path.dirname(os.path.abspath(__file__))
        exe_path = os.path.join(current_dir, 'graph_solver')
        if os.name == 'nt':
            exe_path += '.exe'
        
        cmd = [exe_path, algo] + args
        
        try:
            process = subprocess.Popen(
                cmd,
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
            stdout, stderr = process.communicate(input=input_str)
            
            if process.returncode != 0:
                print(f"Error running C++ solver ({algo}): {stderr}")
                return []
                
            return stdout.strip().split('\n')
        except Exception as e:
            print(f"Exception running C++ solver: {e}")
            return []

    @staticmethod
    def _serialize_graph(graph: Graph, directed: bool = False) -> str:
        """Serialize graph for C++ input: N M \n u v w ..."""
        nodes = sorted(list(graph.nodes))
        node_to_idx = {node: i for i, node in enumerate(nodes)}
        
        edges = []
        seen_edges = set()
        
        for u in graph.adjacency_list:
            for v, weight in graph.adjacency_list[u]:
                if not directed:
                    if u < v: # Avoid duplicates for undirected
                        edges.append((node_to_idx[u], node_to_idx[v], weight))
                else:
                    edges.append((node_to_idx[u], node_to_idx[v], weight))
                    
        N = len(nodes)
        M = len(edges)
        
        input_str = f"{N} {M}\n"
        for u, v, w in edges:
            input_str += f"{u} {v} {w}\n"
            
        return input_str, nodes

    @staticmethod
    def dijkstra(graph: Graph, start: int, end: int) -> Tuple[List[int], float]:
        """Dijkstra's algorithm using C++"""
        if start not in graph.nodes or end not in graph.nodes:
            return [], float('inf')
            
        input_str, nodes = GraphAlgorithms._serialize_graph(graph)
        node_to_idx = {node: i for i, node in enumerate(nodes)}
        
        start_idx = str(node_to_idx[start])
        end_idx = str(node_to_idx[end])
        
        output_lines = GraphAlgorithms._run_cpp_solver(input_str, "dijkstra", [start_idx, end_idx])
        
        if not output_lines or len(output_lines) < 2:
            return [], float('inf')
            
        try:
            distance = float(output_lines[0])
            path_indices = list(map(int, output_lines[1].split()))
            path = [nodes[i] for i in path_indices]
            return path, distance
        except ValueError:
            return [], float('inf')

    @staticmethod
    def prim_mst(graph: Graph) -> List[Tuple[int, int, float]]:
        """Prim's algorithm using C++"""
        input_str, nodes = GraphAlgorithms._serialize_graph(graph)
        output_lines = GraphAlgorithms._run_cpp_solver(input_str, "prim")
        
        mst_edges = []
        for line in output_lines:
            if not line: continue
            parts = line.split()
            if len(parts) == 3:
                u_idx, v_idx, w = int(parts[0]), int(parts[1]), float(parts[2])
                mst_edges.append((nodes[u_idx], nodes[v_idx], w))
        return mst_edges

    @staticmethod
    def kruskal_mst(graph: Graph) -> List[Tuple[int, int, float]]:
        """Kruskal's algorithm using C++"""
        input_str, nodes = GraphAlgorithms._serialize_graph(graph)
        output_lines = GraphAlgorithms._run_cpp_solver(input_str, "kruskal")
        
        mst_edges = []
        for line in output_lines:
            if not line: continue
            parts = line.split()
            if len(parts) == 3:
                u_idx, v_idx, w = int(parts[0]), int(parts[1]), float(parts[2])
                mst_edges.append((nodes[u_idx], nodes[v_idx], w))
        return mst_edges

    @staticmethod
    def topological_sort(dependencies: Dict[str, List[str]]) -> List[str]:
        """Topological sort using C++"""
        # Map tasks to integers
        tasks = sorted(list(dependencies.keys()))
        task_to_idx = {task: i for i, task in enumerate(tasks)}
        
        N = len(tasks)
        edges = []
        for task, prereqs in dependencies.items():
            for prereq in prereqs:
                if prereq in task_to_idx:
                    # prereq -> task
                    edges.append((task_to_idx[prereq], task_to_idx[task], 1.0))
        
        M = len(edges)
        input_str = f"{N} {M}\n"
        for u, v, w in edges:
            input_str += f"{u} {v} {w}\n"
            
        output_lines = GraphAlgorithms._run_cpp_solver(input_str, "topo")
        
        if not output_lines or output_lines[0] == "CYCLE":
            return []
            
        try:
            result_indices = list(map(int, output_lines[0].split()))
            return [tasks[i] for i in result_indices]
        except ValueError:
            return []
from typing import List, Dict, Tuple, Optional


class CityMap:
    """Represents the city as a weighted graph"""
    
    def __init__(self):
        self.graph = Graph()
        self.node_positions: Dict[int, Tuple[float, float]] = {}
        self._initialize_city()
    
    def _initialize_city(self):
        """Initialize a sample city map with intersections and roads"""
        # Create a grid-like city map with 20 intersections
        # Node positions (longitude, latitude) - Lahore, Pakistan coordinates
        # Base: 31.5497° N, 74.3436° E (Lahore center)
        positions = {
            0: (74.3436, 31.5497),   # Downtown (Anarkali)
            1: (74.3525, 31.5600),   # Model Town
            2: (74.3620, 31.5690),   # Johar Town
            3: (74.3715, 31.5790),   # Defence Phase 5
            4: (74.3330, 31.5490),   # Ichhra
            5: (74.3225, 31.5595),   # Gulberg
            6: (74.3120, 31.5695),   # Faisal Town
            7: (74.3025, 31.5795),   # Wapda Town
            8: (74.3530, 31.5390),   # Multan Road
            9: (74.3630, 31.5290),   # Raiwind Road
            10: (74.3735, 31.5195),  # Barkat Market
            11: (74.3130, 31.5390),  # Samanabad
            12: (74.2839, 31.5111),  # Allama Iqbal Town
            13: (74.3135, 31.5195),  # Gulshan-e-Ravi
            14: (74.3435, 31.5595),  # Liberty Market
            15: (74.3435, 31.5395),  # Ferozepur Road
            16: (74.3535, 31.5495),  # DHA Phase 1
            17: (74.3335, 31.5495),  # Shadman
            18: (74.3735, 31.5495),  # DHA Phase 6
            19: (74.3135, 31.5495),  # Ravi Road
        }
        
        self.node_positions = positions
        
        # Add roads (edges) with distances (weights in kilometers)
        # Main roads
        # Use dynamic distance calculation for all edges
        def add(u, v):
            self.graph.add_edge(u, v, self._distance(u, v))

        # Main grid connections
        add(0, 1); add(1, 2); add(2, 3)
        add(0, 4); add(4, 5); add(5, 6); add(6, 7)
        add(0, 8); add(8, 9); add(9, 10)
        add(4, 11); add(11, 12); add(12, 13)

        # Cross connections
        add(0, 14); add(0, 15); add(0, 16); add(0, 17)
        add(1, 14); add(1, 16)
        add(4, 17); add(8, 15)
        add(16, 18); add(17, 19)

        # Additional connectivity
        add(1, 5); add(8, 11); add(14, 5); add(15, 11)

    def _distance(self, u: int, v: int) -> float:
        """Haversine distance between two node IDs (km)."""
        lon1, lat1 = self.node_positions[u]
        lon2, lat2 = self.node_positions[v]
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) ** 2)
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    def get_node_coordinates(self, node: int) -> Tuple[float, float]:
        """Get longitude, latitude for a node"""
        return self.node_positions.get(node, (0.0, 0.0))
    
    def get_path_coordinates(self, path: List[int]) -> List[Tuple[float, float]]:
        """Convert node path to coordinate list"""
        return [self.get_node_coordinates(node) for node in path]


class Driver:
    """Represents a driver in the system"""
    
    def __init__(self, driver_id: int, current_location: int, name: str = None, car_type: str = "Standard"):
        self.driver_id = driver_id
        self.current_location = current_location
        self.name = name or f"Driver {driver_id}"
        self.available = True
        self.car_type = car_type
        # Random rating between 4.5 and 5.0
        import random
        self.rating = round(random.uniform(4.5, 5.0), 1)
        self.plate_number = f"LHR-{random.randint(100, 999)}"
    
    def __repr__(self):
        return f"Driver(id={self.driver_id}, type={self.car_type}, location={self.current_location})"


class DriverManager:
    """Manages drivers and their assignments"""
    
    def __init__(self, city_map: CityMap):
        self.city_map = city_map
        self.drivers: List[Driver] = []
        self._initialize_drivers()
    
    def _initialize_drivers(self):
        """Initialize drivers with different car types at random locations"""
        driver_locations = [0, 1, 4, 8, 14, 16, 17, 5, 11, 2, 7, 12]  # Increased limits
        car_types = ["Standard", "Premium", "Eco", "Standard", "Premium", "Standard", "Eco", "Standard", "Premium", "Standard", "Eco", "Standard"]
        names = ["Ali", "Bilal", "Usman", "Fahad", "Hamza", "Rizwan", "Omer", "Zain", "Ahsan", "Danish", "Saad", "Hassan"]
        
        # Shuffle names to ensure randomness each time
        random.shuffle(names)
        
        for i, location in enumerate(driver_locations):
            # Use modulo safely
            c_type = car_types[i % len(car_types)]
            d_name = names[i % len(names)]
            driver = Driver(i + 1, location, f"{d_name}", c_type)
            self.drivers.append(driver)
    
    def find_nearby_drivers(self, pickup_location: int, limit: int = 3) -> List[Tuple[Driver, List[int], float]]:
        """
        Find multiple nearby drivers using Dijkstra's algorithm
        Returns: List of (driver, path, distance) sorted by distance
        """
        available_drivers = [d for d in self.drivers if d.available]
        if not available_drivers:
            return []
        
        driver_results = []
        
        for driver in available_drivers:
            path, distance = GraphAlgorithms.dijkstra(
                self.city_map.graph,
                driver.current_location,
                pickup_location
            )
            if distance != float('inf'):
                driver_results.append((driver, path, distance))
        
        # Sort by distance and return nearest 'limit' drivers
        driver_results.sort(key=lambda x: x[2])
        return driver_results[:limit]
    
    def find_nearest_driver(self, pickup_location: int) -> Optional[Tuple[Driver, List[int], float]]:
        # Keep for backward compatibility if needed, using the new method
        results = self.find_nearby_drivers(pickup_location, limit=1)
        return results[0] if results else None


class FareCalculator:
    """Calculates fare based on distance"""
    
    BASE_FARE = 150.0  # Base fare in PKR (Pakistani Rupees)
    PER_KM_RATE = 50.0  # Rate per kilometer in PKR
    
    @staticmethod
    def calculate_fare(distance_km: float) -> float:
        """Calculate fare based on distance"""
        return FareCalculator.BASE_FARE + (distance_km * FareCalculator.PER_KM_RATE)


class RideService:
    """Main service for handling rides"""
    
    def __init__(self):
        self.city_map = CityMap()
        self.driver_manager = DriverManager(self.city_map)
        self.fare_calculator = FareCalculator()
        self.graph_algorithms = GraphAlgorithms()
    
    def request_ride(self, pickup_node: int, dropoff_node: int) -> Dict:
        """
        Process a ride request and return multiple options
        """
        # Find nearby drivers (up to 3)
        nearby_drivers = self.driver_manager.find_nearby_drivers(pickup_node, limit=3)
        
        if not nearby_drivers:
            return {
                'success': False,
                'error': 'No available drivers nearby'
            }
            
        # Common ride path (pickup -> dropoff)
        ride_path, ride_distance = self.graph_algorithms.dijkstra(
            self.city_map.graph,
            pickup_node,
            dropoff_node
        )
        
        if not ride_path:
            return {
                'success': False,
                'error': 'No path found between pickup and dropoff locations'
            }
            
        ride_path_coords = self.city_map.get_path_coordinates(ride_path)
        workflow = self.graph_algorithms.topological_sort(RIDE_WORKFLOW_DEPENDENCIES)
        
        options = []
        
        for driver, driver_path, driver_dist in nearby_drivers:
            # Calculate dynamic pricing based on car type
            rate_multiplier = 1.0
            if driver.car_type == "Premium":
                rate_multiplier = 1.4
            elif driver.car_type == "Eco":
                rate_multiplier = 0.9
                
            base_fare_driver = self.fare_calculator.BASE_FARE * rate_multiplier
            per_km_driver = self.fare_calculator.PER_KM_RATE * rate_multiplier
            
            # Add small random variation (±5%) just for price differentiation
            variation = random.uniform(0.95, 1.05)
            
            fare = (base_fare_driver + (ride_distance * per_km_driver)) * variation
            
            # Helper for coordinates
            driver_path_coords = self.city_map.get_path_coordinates(driver_path)
            
            options.append({
                'driver': {
                    'id': driver.driver_id,
                    'name': driver.name,
                    'car_type': driver.car_type,
                    'rating': driver.rating,
                    'plate': driver.plate_number,
                    'current_location': driver.current_location,
                    'location_coords': self.city_map.get_node_coordinates(driver.current_location)
                },
                'driver_to_pickup': {
                    'path': driver_path,
                    'path_coords': driver_path_coords,
                    'distance_km': round(driver_dist, 2),
                    'eta_mins': round(driver_dist * 2.5) # Rough estimate 2.5 min/km
                },
                'fare': round(fare),
                'total_distance_km': round(driver_dist + ride_distance, 2)
            })
            
        return {
            'success': True,
            'multiple_options': True,
            'ride_details': {
                'pickup': {
                    'node': pickup_node,
                    'coords': self.city_map.get_node_coordinates(pickup_node)
                },
                'dropoff': {
                    'node': dropoff_node,
                    'coords': self.city_map.get_node_coordinates(dropoff_node)
                },
                'ride_path': {
                    'path': ride_path,
                    'path_coords': ride_path_coords,
                    'distance_km': round(ride_distance, 2)
                },
                'workflow': workflow
            },
            'options': options
        }
    
    def get_mst_prim(self) -> Dict:
        """Get Minimum Spanning Tree using Prim's algorithm"""
        mst_edges = self.graph_algorithms.prim_mst(self.city_map.graph)
        return {
            'algorithm': 'Prim',
            'edges': mst_edges,
            'total_edges': len(mst_edges),
            'edge_coords': [
                {
                    'u': u,
                    'v': v,
                    'weight': weight,
                    'u_coords': self.city_map.get_node_coordinates(u),
                    'v_coords': self.city_map.get_node_coordinates(v)
                }
                for u, v, weight in mst_edges
            ]
        }
    
    def get_mst_kruskal(self) -> Dict:
        """Get Minimum Spanning Tree using Kruskal's algorithm"""
        mst_edges = self.graph_algorithms.kruskal_mst(self.city_map.graph)
        return {
            'algorithm': 'Kruskal',
            'edges': mst_edges,
            'total_edges': len(mst_edges),
            'edge_coords': [
                {
                    'u': u,
                    'v': v,
                    'weight': weight,
                    'u_coords': self.city_map.get_node_coordinates(u),
                    'v_coords': self.city_map.get_node_coordinates(v)
                }
                for u, v, weight in mst_edges
            ]
        }
    
    def get_city_map_info(self) -> Dict:
        """Get city map information"""
        nodes_coords = {
            node: self.city_map.get_node_coordinates(node)
            for node in self.city_map.graph.nodes
        }
        
        edges_info = []
        for u in self.city_map.graph.adjacency_list:
            for v, weight in self.city_map.graph.adjacency_list[u]:
                if u < v:  # Avoid duplicates
                    edges_info.append({
                        'u': u,
                        'v': v,
                        'weight': weight,
                        'u_coords': self.city_map.get_node_coordinates(u),
                        'v_coords': self.city_map.get_node_coordinates(v)
                    })
        
        return {
            'nodes': list(self.city_map.graph.nodes),
            'nodes_coords': nodes_coords,
            'edges': edges_info,
            'total_nodes': len(self.city_map.graph.nodes),
            'total_edges': len(edges_info)
        }

