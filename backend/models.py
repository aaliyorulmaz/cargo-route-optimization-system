import sqlite3
import hashlib

import os

DB_NAME = os.path.join(os.path.dirname(__file__), 'database.db')

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    
    
    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL, -- Hashlenmis (basitce)
        role TEXT NOT NULL DEFAULT 'user' -- 'admin' veya 'user'
    )''')
    
   
    c.execute('''CREATE TABLE IF NOT EXISTS parameters (
        key TEXT PRIMARY KEY,
        value REAL
    )''')
    
    
    defaults = [
        ('arac_maliyeti_500', 0),   
        ('arac_maliyeti_ekstra', 200),
        ('yakit_maliyeti_km', 1.0)
    ]
    for key, val in defaults:
        c.execute('INSERT OR IGNORE INTO parameters (key, value) VALUES (?, ?)', (key, val))

    
    c.execute('''CREATE TABLE IF NOT EXISTS istasyonlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ad TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        aktif INTEGER DEFAULT 1
    )''')

    
    c.execute('''CREATE TABLE IF NOT EXISTS araclar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plaka TEXT,
        kapasite INTEGER, -- 500, 750, 1000
        tip TEXT DEFAULT 'sabit' -- 'sabit' veya 'kiralik'
    )''')

    
    c.execute('''CREATE TABLE IF NOT EXISTS talepler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        istasyon_id INTEGER,
        kargo_sayisi INTEGER,
        agirlik INTEGER,
        aciklama TEXT,
        durum TEXT DEFAULT 'beklemede', -- beklemede, planlandi, teslim_edildi
        tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(istasyon_id) REFERENCES istasyonlar(id)
    )''')

   
    c.execute('''CREATE TABLE IF NOT EXISTS sefer_planlari (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        senaryo_tipi TEXT, -- 'sinirsiz', 'sinirli_max_adet', 'sinirli_max_agirlik'
        toplam_maliyet REAL,
        toplam_mesafe REAL,
        kullanilan_arac_sayisi INTEGER
    )''')

    
    c.execute('''CREATE TABLE IF NOT EXISTS rota_detaylari (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_id INTEGER,
        arac_plaka TEXT,
        kapasite INTEGER,
        yuklenen_agirlik INTEGER,
        guzergah_json TEXT, -- Node ID listesi veya lat/lon listesi (JSON string)
        ziyaret_sirasi_json TEXT, -- Ugranilan istasyon ID'leri sirali
        maliyet REAL,
        mesafe_km REAL,
        FOREIGN KEY(plan_id) REFERENCES sefer_planlari(id)
    )''')
    
    
    c.execute('''CREATE TABLE IF NOT EXISTS rota_kargo_iliskisi (
        rota_id INTEGER,
        talep_id INTEGER,
        FOREIGN KEY(rota_id) REFERENCES rota_detaylari(id),
        FOREIGN KEY(talep_id) REFERENCES talepler(id)
    )''')

    
    admin_pass = hashlib.sha256("admin123".encode()).hexdigest()
    c.execute("INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)", 
              ('admin', admin_pass, 'admin'))
              
   
    user_pass = hashlib.sha256("1234".encode()).hexdigest()
    c.execute("INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)", 
              ('user1', user_pass, 'user'))

    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    print("Veritabani v2.0 semasi basariyla olusturuldu.")
