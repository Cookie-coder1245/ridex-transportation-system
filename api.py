from flask import Blueprint, jsonify, request
from city_map import RideService

api_bp = Blueprint('api', __name__)

# Initialize ride service
ride_service = RideService()

@api_bp.route('/city-map', methods=['GET'])
def get_city_map():
    """Get city map information"""
    try:
        city_info = ride_service.get_city_map_info()
        return jsonify({'success': True, 'data': city_info})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/request-ride', methods=['POST'])
def request_ride():
    """Handle ride request"""
    try:
        data = request.get_json()
        pickup = int(data.get('pickup'))
        dropoff = int(data.get('dropoff'))
        
        result = ride_service.request_ride(pickup, dropoff)
        return jsonify(result)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/mst/prim', methods=['GET'])
def get_mst_prim():
    """Get MST using Prim's algorithm"""
    try:
        mst = ride_service.get_mst_prim()
        return jsonify({'success': True, 'data': mst})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/mst/kruskal', methods=['GET'])
def get_mst_kruskal():
    """Get MST using Kruskal's algorithm"""
    try:
        mst = ride_service.get_mst_kruskal()
        return jsonify({'success': True, 'data': mst})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/drivers', methods=['GET'])
def get_drivers():
    """Get all drivers information"""
    try:
        drivers = [
            {
                'id': driver.driver_id,
                'name': driver.name,
                'location': driver.current_location,
                'location_coords': ride_service.city_map.get_node_coordinates(driver.current_location),
                'available': driver.available
            }
            for driver in ride_service.driver_manager.drivers
        ]
        return jsonify({'success': True, 'data': drivers})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@api_bp.route('/workflow', methods=['GET'])
def get_workflow():
    """Get ride workflow schedule"""
    try:
        from city_map import RIDE_WORKFLOW_DEPENDENCIES
        workflow = ride_service.graph_algorithms.topological_sort(RIDE_WORKFLOW_DEPENDENCIES)
        return jsonify({
            'success': True,
            'data': {
                'workflow': workflow,
                'dependencies': RIDE_WORKFLOW_DEPENDENCIES
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
