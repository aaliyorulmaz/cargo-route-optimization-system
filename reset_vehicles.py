from backend.app import get_db_connection, renumber_vehicles

def reset_vehicles():
    


    conn = get_db_connection()
    print("Mevcut araclar temizleniyor...")
    conn.execute('DELETE FROM araclar')
    


    defaults = [500, 750, 1000]
    print(f"Varsayilan araclar ekleniyor: {defaults}")
    

    for cap in defaults:
        conn.execute('INSERT INTO araclar (kapasite, tip) VALUES (?, ?)', (cap, 'sabit'))
    


    print("Numaralandirma calistiriliyor...")
    renumber_vehicles(conn)
    conn.close()
    print("Islem Tamam! Araclar: ARAC-1 (500), ARAC-2 (750), ARAC-3 (1000)")




if __name__ == "__main__":
    reset_vehicles()
