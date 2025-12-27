#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
#include <string>
#include <iomanip>

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
    vector<vector<pair<int, double>>> adj;
    vector<Edge> all_edges;

    Graph(int V) : V(V) {
        adj.resize(V);
    }

    void add_edge(int u, int v, double weight) {
        adj[u].push_back({v, weight});
        adj[v].push_back({u, weight});
        all_edges.push_back({u, v, weight});
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

    // Priority queue to store pairs of (weight, vertex)
    // Min-heap
    priority_queue<pair<double, int>, vector<pair<double, int>>, greater<pair<double, int>>> pq;
    
    vector<double> key(g.V, 1e18); // Infinite weight
    vector<int> parent(g.V, -1);
    vector<bool> inMST(g.V, false);

    // Start with node 0
    int start_node = 0;
    pq.push({0, start_node});
    key[start_node] = 0;

    while (!pq.empty()) {
        int u = pq.top().second;
        pq.pop();

        if(inMST[u]) continue;
        inMST[u] = true;
        
        // If getting here means we added u to MST via edge (parent[u], u)
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

int main(int argc, char* argv[]) {
    // Fast I/O
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    if (argc < 2) {
        cerr << "Usage: " << argv[0] << " [prim|kruskal]" << endl;
        return 1;
    }

    string algo = argv[1];
    
    int N, M;
    if (!(cin >> N >> M)) return 0;

    Graph g(N);
    
    for (int i = 0; i < M; ++i) {
        int u, v;
        double w;
        cin >> u >> v >> w;
        g.add_edge(u, v, w);
    }

    // Set output precision
    cout << fixed << setprecision(6);

    if (algo == "prim") {
        run_prim(g);
    } else if (algo == "kruskal") {
        run_kruskal(g);
    } else {
        cerr << "Unknown algorithm: " << algo << endl;
        return 1;
    }

    return 0;
}
