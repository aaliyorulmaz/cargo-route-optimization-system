import math
from osm_helper import get_kocaeli_graph, get_shortest_path
import json


G = None

def ensure_graph_loaded():
    global G
    if G is None:
        G = get_kocaeli_graph()

import math
from osm_helper import get_kocaeli_graph, get_shortest_path
import json


G = None

def ensure_graph_loaded():
    global G
    if G is None:
        G = get_kocaeli_graph()

def calculate_distance_osm(lat1, lon1, lat2, lon2):
    
    ensure_graph_loaded()
    
    _, dist_km = get_shortest_path(G, (lat1, lon1), (lat2, lon2))
    return dist_km

def tsp_nearest_neighbor(start_pos, points, graph_G):
    
    current_pos = start_pos
    unvisited = points[:] 
    path = []
    total_dist = 0
    full_coords = [] 
    
    while unvisited:
        nearest_point = None
        min_dist = float('inf')
        nearest_route_coords = []
        
        for point in unvisited:
            
            target_pos = (point['latitude'], point['longitude'])
            
            
            route_geo, dist = get_shortest_path(graph_G, current_pos, target_pos)
            
            if dist < min_dist:
                min_dist = dist
                nearest_point = point
                nearest_route_coords = route_geo
        
        
        path.append(nearest_point)
        total_dist += min_dist
        full_coords.extend(nearest_route_coords)
        current_pos = (nearest_point['latitude'], nearest_point['longitude'])
        unvisited.remove(nearest_point)
        
    
    depo_pos = (40.8206, 29.9203)
    route_geo, dist = get_shortest_path(graph_G, current_pos, depo_pos)
    total_dist += dist
    full_coords.extend(route_geo)
    
    return path, total_dist, full_coords

def solve_unlimited_vehicles(kargolar, mevcut_araclar, kiralik_arac_kapasite=500, kiralik_arac_maliyet=200):
    
    ensure_graph_loaded()
    
    
    kargolar_sirali = sorted(kargolar, key=lambda x: x['agirlik'], reverse=True)
    kullanilan_araclar = []
    
    
    depo_pos = (40.8206, 29.9203)
    
    
    mevcut_araclar.sort(key=lambda x: x['kapasite'], reverse=True)
    
    for arac in mevcut_araclar:
        if not kargolar_sirali: break 
        
        arac_yuku = 0
        arac_kargolari = []
        
        
        for kargo in kargolar_sirali[:]:
            if arac_yuku + kargo['agirlik'] <= arac['kapasite']:
                arac_yuku += kargo['agirlik']
                arac_kargolari.append(kargo)
                kargolar_sirali.remove(kargo)
        
        if arac_kargolari:
            
            sorted_cargos, rota_mesafe, rota_geo = tsp_nearest_neighbor(depo_pos, arac_kargolari, G)
            
            kullanilan_araclar.append({
                'arac_plaka': arac['plaka'],
                'arac_tipi': 'Mevcut',
                'kapasite': arac['kapasite'],
                'yuk': arac_yuku,
                'kargolar': sorted_cargos, 
                'ekstra_maliyet': 0, 
                'toplam_mesafe': round(rota_mesafe, 2),
                'rota_coords': rota_geo
            })

    
    
    kiralik_sayac = 1
    while kargolar_sirali:
        arac_yuku = 0
        arac_kargolari = []
        
        
        current_daily_capacity = kiralik_arac_kapasite
        
        
        if kargolar_sirali and kargolar_sirali[0]['agirlik'] > current_daily_capacity:
             current_daily_capacity = kargolar_sirali[0]['agirlik']
        
        
        for kargo in kargolar_sirali[:]:
            if arac_yuku + kargo['agirlik'] <= current_daily_capacity:
                arac_yuku += kargo['agirlik']
                arac_kargolari.append(kargo)
                kargolar_sirali.remove(kargo)
        
        
        if not arac_kargolari: 
             break
        
        
        sorted_cargos, rota_mesafe, rota_geo = tsp_nearest_neighbor(depo_pos, arac_kargolari, G)

        kullanilan_araclar.append({
            'arac_plaka': f'Kiralik {kiralik_sayac} ({current_daily_capacity}kg)',
            'arac_tipi': 'Kiralik',
            'kapasite': current_daily_capacity,
            'yuk': arac_yuku,
            'kargolar': sorted_cargos,
            'ekstra_maliyet': kiralik_arac_maliyet if current_daily_capacity == kiralik_arac_kapasite else kiralik_arac_maliyet * 2, # Buyuk arac daha pahali olsun
            'toplam_mesafe': round(rota_mesafe, 2),
            'rota_coords': rota_geo
        })
        kiralik_sayac += 1
        
    return kullanilan_araclar

def solve_limited_vehicles(kargolar, mevcut_araclar, hedef='max_agirlik'):
    
    ensure_graph_loaded()
    
    
    if hedef == 'max_agirlik':
        
        kargolar_sirali = sorted(kargolar, key=lambda x: x['agirlik'], reverse=True)
    else: 
        
        kargolar_sirali = sorted(kargolar, key=lambda x: x['agirlik'], reverse=False)
        
    
    mevcut_araclar.sort(key=lambda x: x['kapasite'], reverse=True)
    
    kullanilan_araclar = []
    depo_pos = (40.8206, 29.9203)
    
    for arac in mevcut_araclar:
        if not kargolar_sirali: break
        
        arac_yuku = 0
        arac_kargolari = []
        
        for kargo in kargolar_sirali[:]:
            if arac_yuku + kargo['agirlik'] <= arac['kapasite']:
                arac_yuku += kargo['agirlik']
                arac_kargolari.append(kargo)
                kargolar_sirali.remove(kargo)
        
        if arac_kargolari:
            
            sorted_cargos, rota_mesafe, rota_geo = tsp_nearest_neighbor(depo_pos, arac_kargolari, G)
            
            kullanilan_araclar.append({
                'arac_plaka': arac['plaka'],
                'arac_tipi': 'Mevcut',
                'kapasite': arac['kapasite'],
                'yuk': arac_yuku,
                'kargolar': sorted_cargos,
                'ekstra_maliyet': 0,
                'toplam_mesafe': round(rota_mesafe, 2),
                'rota_coords': rota_geo
            })
            
    
    return {
        'rotalar': kullanilan_araclar,
        'tasinamayanlar': kargolar_sirali
    }
