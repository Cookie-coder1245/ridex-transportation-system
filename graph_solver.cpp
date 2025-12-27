#include <iostream>
#include <vector>
#include <queue>
#include <stack>
#include <algorithm>
#include <string>
#include <iomanip>
#include <map>

using namespace std;

// Structure to represent an edge
struct Edge {
    int u, v;
    double weight;
    
    // For sorting in Kruskal's
    bool operator<(const Edge& other) const {
        return weight < other.weight;
    }
};

// Graph class
class Graph {
public:
    int V; // Number of vertices
    vector<vector<pair<int, double>>> adj; // Adjacency list: neighbor, weight
    vector<Edge> all_edges;

    Graph(int V) : V(V) {
        adj.resize(V);
    }

    void add_edge(int u, int v, double weight) {
        adj[u].push_back({v, weight});
        adj[v].push_back({u, weight});
        all_edges.push_back({u, v, weight});
    }

    void add_directed_edge(int u, int v, double weight) {
        adj[u].push_back({v, weight});
        // Do not add reverse edge
        // all_edges might not be needed for directed graphs in this context (topo sort doesn't use it)
    }
};

// Disjoint Set Union (DSU) for Kruskal's algorithm
struct DSU {
    vector<int> parent;
    DSU(int n) {
        parent.resize(n);
        for(int i = 0; i < n; ++i) parent[i] = i;
    }
    
    int find(int i) {
        if (parent[i] == i)
            return i;
        return parent[i] = find(parent[i]);
    }
    
    void unite(int i, int j) {
        int root_i = find(i);
        int root_j = find(j);
        if (root_i != root_j) {
            parent[root_i] = root_j;
        }
    }
};

// --- Algorithms ---

void run_kruskal(Graph& g) {
    sort(g.all_edges.begin(), g.all_edges.end());
    DSU dsu(g.V);
    
    for (const auto& edge : g.all_edges) {
        if (dsu.find(edge.u) != dsu.find(edge.v)) {
            dsu.unite(edge.u, edge.v);
            cout << edge.u << " " << edge.v << " " << edge.weight << endl;
        }
    }
}

void run_prim(Graph& g) {
    if (g.V == 0) return;

    priority_queue<pair<double, int>, vector<pair<double, int>>, greater<pair<double, int>>> pq;
    
    vector<double> key(g.V, 1e18); // Infinite weight
    vector<int> parent(g.V, -1);
    vector<bool> inMST(g.V, false);

    int start_node = 0;
    pq.push({0, start_node});
    key[start_node] = 0;

    while (!pq.empty()) {
        int u = pq.top().second;
        pq.pop();

        if(inMST[u]) continue;
        inMST[u] = true;
        
        if (parent[u] != -1) {
             cout << parent[u] << " " << u << " " << key[u] << endl;
        }

        for (auto& neighbor : g.adj[u]) {
            int v = neighbor.first;
            double weight = neighbor.second;

            if (!inMST[v] && weight < key[v]) {
                key[v] = weight;
                pq.push({key[v], v});
                parent[v] = u;
            }
        }
    }
}

void run_dijkstra(Graph& g, int start_node, int end_node) {
    priority_queue<pair<double, int>, vector<pair<double, int>>, greater<pair<double, int>>> pq;
    vector<double> dist(g.V, 1e18);
    vector<int> parent(g.V, -1);

    dist[start_node] = 0;
    pq.push({0, start_node});

    while (!pq.empty()) {
        double d = pq.top().first;
        int u = pq.top().second;
        pq.pop();

        if (d > dist[u]) continue;
        if (u == end_node) break;

        for (auto& neighbor : g.adj[u]) {
            int v = neighbor.first;
            double weight = neighbor.second;

            if (dist[u] + weight < dist[v]) {
                dist[v] = dist[u] + weight;
                parent[v] = u;
                pq.push({dist[v], v});
            }
        }
    }

    if (dist[end_node] == 1e18) {
        // No path
        return;
    }

    // Reconstruct path
    vector<int> path;
    for (int v = end_node; v != -1; v = parent[v]) {
        path.push_back(v);
    }
    reverse(path.begin(), path.end());

    // Output: distance line 1, path line 2
    cout << dist[end_node] << endl;
    for (size_t i = 0; i < path.size(); ++i) {
        cout << path[i] << (i == path.size() - 1 ? "" : " ");
    }
    cout << endl;
}

void run_bfs(Graph& g, int start_node, int target_node) {
    queue<int> q;
    vector<bool> visited(g.V, false);
    vector<int> parent(g.V, -1);

    visited[start_node] = true;
    q.push(start_node);

    bool found = false;

    while (!q.empty()) {
        int u = q.front();
        q.pop();

        if (u == target_node) {
            found = true;
            break;
        }

        for (auto& neighbor : g.adj[u]) {
            int v = neighbor.first;
            if (!visited[v]) {
                visited[v] = true;
                parent[v] = u;
                q.push(v);
            }
        }
    }

    if (found) {
        cout << "1" << endl; // Found
        vector<int> path;
        for (int v = target_node; v != -1; v = parent[v]) {
            path.push_back(v);
        }
        reverse(path.begin(), path.end());
        for (size_t i = 0; i < path.size(); ++i) {
            cout << path[i] << (i == path.size() - 1 ? "" : " ");
        }
        cout << endl;
    } else {
        cout << "0" << endl; // Not found
    }
}

void run_dfs(Graph& g, int start_node) {
    stack<int> s;
    vector<bool> visited(g.V, false);
    vector<int> visit_order;

    s.push(start_node);

    while (!s.empty()) {
        int u = s.top();
        s.pop();

        if (!visited[u]) {
            visited[u] = true;
            visit_order.push_back(u);

            // Push neighbors in reverse order to maintain order if needed, 
            // but for standard DFS just pushing is fine. 
            // Neighbors are pairs (v, w)
            for (auto it = g.adj[u].rbegin(); it != g.adj[u].rend(); ++it) {
                int v = it->first;
                if (!visited[v]) {
                    s.push(v);
                }
            }
        }
    }

    for (size_t i = 0; i < visit_order.size(); ++i) {
        cout << visit_order[i] << (i == visit_order.size() - 1 ? "" : " ");
    }
    cout << endl;
}

void run_toposort(Graph& g) {
    vector<int> in_degree(g.V, 0);
    for (int u = 0; u < g.V; ++u) {
        for (auto& neighbor : g.adj[u]) {
            in_degree[neighbor.first]++;
        }
    }

    queue<int> q;
    for (int i = 0; i < g.V; ++i) {
        if (in_degree[i] == 0) {
            q.push(i);
        }
    }

    vector<int> result;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        result.push_back(u);

        for (auto& neighbor : g.adj[u]) {
            int v = neighbor.first;
            in_degree[v]--;
            if (in_degree[v] == 0) {
                q.push(v);
            }
        }
    }

    if (result.size() != g.V) {
        // Cycle detected or invalid
        cout << "CYCLE" << endl;
    } else {
        for (size_t i = 0; i < result.size(); ++i) {
            cout << result[i] << (i == result.size() - 1 ? "" : " ");
        }
        cout << endl;
    }
}


int main(int argc, char* argv[]) {
    // Fast I/O
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    if (argc < 2) {
        cerr << "Usage: " << argv[0] << " [prim|kruskal|dijkstra|bfs|dfs|topo] [args...]" << endl;
        return 1;
    }

    string algo = argv[1];
    
    int N, M;
    if (!(cin >> N >> M)) return 0;

    Graph g(N);
    
    bool directed = (algo == "topo");

    for (int i = 0; i < M; ++i) {
        int u, v;
        double w;
        cin >> u >> v >> w;
        if (directed) {
            g.add_directed_edge(u, v, w);
        } else {
            g.add_edge(u, v, w);
        }
    }

    cout << fixed << setprecision(6);

    if (algo == "prim") {
        run_prim(g);
    } else if (algo == "kruskal") {
        run_kruskal(g);
    } else if (algo == "dijkstra") {
        if (argc < 4) return 1;
        int start = stoi(argv[2]);
        int end = stoi(argv[3]);
        run_dijkstra(g, start, end);
    } else if (algo == "bfs") {
        if (argc < 4) return 1;
        int start = stoi(argv[2]);
        int target = stoi(argv[3]);
        run_bfs(g, start, target);
    } else if (algo == "dfs") {
        if (argc < 3) return 1;
        int start = stoi(argv[2]);
        run_dfs(g, start);
    } else if (algo == "topo") {
        run_toposort(g);
    } else {
        cerr << "Unknown algorithm: " << algo << endl;
        return 1;
    }

    return 0;
}
