import osmnx as ox
import networkx as nx
import os

GRAPH_FILE = "kocaeli_graph.graphml"

def get_kocaeli_graph():
    
    if os.path.exists(GRAPH_FILE):
        print("Graph dosyadan yukleniyor...")
        G = ox.load_graphml(GRAPH_FILE)
    else:
        print("Kocaeli haritasi indiriliyor (biraz surebilir)...")
        
        G = ox.graph_from_place("Kocaeli, Turkey", network_type='drive')
        
       
        G = ox.add_edge_speeds(G)
        G = ox.add_edge_travel_times(G)
        
        print("Graph dosyaya kaydediliyor...")
        ox.save_graphml(G, GRAPH_FILE)
    
    return G

def get_shortest_path(G, origin_point, destination_point):
    """
    Iki nokta (lat, lon) arasindaki en kisa yolun koordinatlarini doner.
    """
    
    origin_node = ox.distance.nearest_nodes(G, origin_point[1], origin_point[0])
    destination_node = ox.distance.nearest_nodes(G, destination_point[1], destination_point[0])
    
    
    route = nx.shortest_path(G, origin_node, destination_node, weight='length')
    
    
    route_coords = []
    for node in route:
        point = G.nodes[node]
        route_coords.append([point['y'], point['x']])
        
    
    distance_m = nx.shortest_path_length(G, origin_node, destination_node, weight='length')
    
    return route_coords, distance_m / 1000.0


if __name__ == '__main__':
    G = get_kocaeli_graph()
    print(f"Graph yuklendi. Dugum sayisi: {len(G.nodes)}")
