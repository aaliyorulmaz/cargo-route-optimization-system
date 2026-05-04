import sqlite3

def seed_stations():
    stations = [
        {"ad": "Başiskele", "lat": 40.7133, "lon": 29.9333},
        {"ad": "Çayırova", "lat": 40.8167, "lon": 29.3667},
        {"ad": "Darıca", "lat": 40.7667, "lon": 29.4000},
        {"ad": "Derince", "lat": 40.7500, "lon": 29.8333},
        {"ad": "Dilovası", "lat": 40.7833, "lon": 29.5333},
        {"ad": "Gebze", "lat": 40.8000, "lon": 29.4333},
        {"ad": "Gölcük", "lat": 40.7167, "lon": 29.8167},
        {"ad": "İzmit", "lat": 40.7667, "lon": 29.9167},
        {"ad": "Kandıra", "lat": 41.0667, "lon": 30.1500},
        {"ad": "Karamürsel", "lat": 40.6917, "lon": 29.6167},
        {"ad": "Kartepe", "lat": 40.7500, "lon": 30.0167},
        {"ad": "Körfez", "lat": 40.7667, "lon": 29.7333}
    ]

    conn = sqlite3.connect('backend/database.db')
    cursor = conn.cursor()
    
    print("--- Istasyonlar Ekleniyor ---")
    for s in stations:
        try:
            
            cursor.execute("SELECT id FROM istasyonlar WHERE ad = ?", (s['ad'],))
            exists = cursor.fetchone()
            if not exists:
                cursor.execute("INSERT INTO istasyonlar (ad, latitude, longitude) VALUES (?, ?, ?)", 
                               (s['ad'], s['lat'], s['lon']))
                print(f"[+] Eklendi: {s['ad']}")
            else:
                print(f"[-] Zaten var: {s['ad']}")
        except Exception as e:
            print(f"[!] Hata ({s['ad']}): {e}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    seed_stations()
