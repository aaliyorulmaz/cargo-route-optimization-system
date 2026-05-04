import sqlite3
import os


DB_NAME = 'database.db'

def seed_data():
    if os.path.exists(DB_NAME):
        os.remove(DB_NAME)
    
    
    from models import init_db
    init_db()

    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()

    
    ilceler = [
        ('Basiskele', 40.7115, 29.9328),
        ('Cayirova', 40.8173, 29.3725),
        ('Darica', 40.7735, 29.4003),
        ('Derince', 40.7556, 29.8306),
        ('Dilovasi', 40.7875, 29.5467),
        ('Gebze', 40.8028, 29.4307),
        ('Golcuk', 40.7169, 29.8189),
        ('Kandira', 41.0694, 30.1542),
        ('Karamursel', 40.6922, 29.6156),
        ('Kartepe', 40.7306, 30.0197),
        ('Korfez', 40.7635, 29.7369),
        ('Izmit', 40.7654, 29.9406)
    ]

    c.executemany("INSERT INTO istasyonlar (ad, latitude, longitude) VALUES (?, ?, ?)", ilceler)

    
    araclar = [
        ('Arac-1 (500kg)', 500, 0),
        ('Arac-2 (750kg)', 750, 0),
        ('Arac-3 (1000kg)', 1000, 0)
    ]
    c.executemany("INSERT INTO araclar (plaka, kapasite, kiralama_maliyeti) VALUES (?, ?, ?)", araclar)

    conn.commit()
    conn.close()
    print("Veritabani baslangic verileriyle dolduruldu.")

if __name__ == '__main__':
    seed_data()
