from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt
import sqlite3
import hashlib
import json
from algorithms import solve_unlimited_vehicles, solve_limited_vehicles


import os

app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'super-secret-key-yazlab3' 
CORS(app)
jwt = JWTManager(app)

DB_NAME = os.path.join(os.path.dirname(__file__), 'database.db')

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn



@app.route('/api/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    
    
    hashed_pw = hashlib.sha256(password.encode()).hexdigest()
    
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, hashed_pw)).fetchone()
    conn.close()
    
    if user:
        
        access_token = create_access_token(
            identity=str(user['id']), 
            additional_claims={'role': user['role'], 'username': username}
        )
        return jsonify(access_token=access_token, role=user['role']), 200
    else:
        return jsonify({"msg": "Hatali kullanici adi veya sifre"}), 401

@app.route('/api/register', methods=['POST'])
def register():
    username = request.json.get('username')
    password = request.json.get('password')
    
    
    hashed_pw = hashlib.sha256(password.encode()).hexdigest()
    
    conn = get_db_connection()
    try:
        conn.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, hashed_pw))
        conn.commit()
        conn.close()
        return jsonify({"msg": "Kayit basarili"}), 201
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"msg": "Bu kullanici adi zaten alini"}), 400



@app.route('/api/istasyonlar', methods=['GET', 'POST'])
def manage_istasyonlar():
    conn = get_db_connection()
    if request.method == 'GET':
        istasyonlar = conn.execute('SELECT * FROM istasyonlar').fetchall()
        conn.close()
        return jsonify([dict(ix) for ix in istasyonlar])
    
    elif request.method == 'POST':
        
        
        data = request.json
        try:
            conn.execute('INSERT INTO istasyonlar (ad, latitude, longitude) VALUES (?, ?, ?)',
                         (data['ad'], data['latitude'], data['longitude']))
            conn.commit()
            conn.close()
            return jsonify({"message": "Istasyon eklendi"}), 201
        except Exception as e:
            conn.close()
            return jsonify({"error": str(e)}), 500

@app.route('/api/istasyonlar/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_istasyon(id):
    current_user = get_jwt_identity()
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({"msg": "Yetkisiz islem"}), 403
        
    try:
        conn = get_db_connection()
        conn.execute('DELETE FROM istasyonlar WHERE id = ?', (id,))
        conn.commit()
        conn.close()
        return jsonify({"message": "Istasyon silindi"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def renumber_vehicles(conn):
    """
    Araclari ID sirasina gore 'ARAC-1', 'ARAC-2' seklinde yeniden isimlendirir.
    Boylece aradan silme olsa bile numaralar sirali gider.
    """
    araclar = conn.execute('SELECT id FROM araclar ORDER BY id ASC').fetchall()
    for index, arac in enumerate(araclar):
        yeni_plaka = f"ARAC-{index + 1}"
        conn.execute('UPDATE araclar SET plaka = ? WHERE id = ?', (yeni_plaka, arac['id']))
    conn.commit()

@app.route('/api/araclar', methods=['GET', 'POST'])
def manage_araclar():
    conn = get_db_connection()
    
    if request.method == 'GET':
        araclar = conn.execute('SELECT * FROM araclar ORDER BY id ASC').fetchall()
        conn.close()
        return jsonify([dict(ix) for ix in araclar])
        
    elif request.method == 'POST':
        
        data = request.json
        kapasite = data.get('kapasite')
        
        try:
            
            conn.execute('INSERT INTO araclar (kapasite, tip) VALUES (?, ?)', (kapasite, 'sabit'))
            
            renumber_vehicles(conn)
            
            conn.close()
            return jsonify({"message": "Arac eklendi"}), 201
        except Exception as e:
            conn.close()
            return jsonify({"error": str(e)}), 500

@app.route('/api/araclar/<int:id>', methods=['DELETE'])
def delete_arac(id):
    conn = get_db_connection()
    try:
        conn.execute('DELETE FROM araclar WHERE id = ?', (id,))
        renumber_vehicles(conn) 
        conn.close()
        return jsonify({"message": "Arac silindi"}), 200
    except Exception as e:
        conn.close()
        return jsonify({"error": str(e)}), 500



@app.route('/api/talepler', methods=['GET', 'POST', 'DELETE'])
@jwt_required() 
def manage_talepler():
    current_user = get_jwt_identity()
    user_id = int(current_user) 
    claims = get_jwt()
    role = claims['role']
    
    conn = get_db_connection()
    
    if request.method == 'GET':
        
        query = '''
            SELECT t.*, i.ad as istasyon_adi, u.username, 
                   rd.guzergah_json, rd.arac_plaka
            FROM talepler t 
            JOIN istasyonlar i ON t.istasyon_id = i.id 
            JOIN users u ON t.user_id = u.id
            LEFT JOIN rota_kargo_iliskisi rki ON t.id = rki.talep_id
            LEFT JOIN rota_detaylari rd ON rki.rota_id = rd.id
        '''
        
        if role != 'admin':
            query += f' WHERE t.user_id = {user_id}'
            
        talepler = conn.execute(query).fetchall()
        conn.close()
        return jsonify([dict(t) for t in talepler])
    
    elif request.method == 'POST':
        
        data = request.json
        conn.execute('INSERT INTO talepler (user_id, istasyon_id, kargo_sayisi, agirlik, aciklama) VALUES (?, ?, ?, ?, ?)',
                     (user_id, data['istasyon_id'], data['kargo_sayisi'], data['agirlik'], data.get('aciklama', '')))
        conn.commit()
        conn.close()
        return jsonify({"message": "Talep alindi"}), 201

    elif request.method == 'DELETE':
        
        if role != 'admin':
            return jsonify({"msg": "Yetkisiz islem!"}), 403
            
        conn.execute('DELETE FROM talepler')
        conn.commit()
        conn.close()
        return jsonify({"message": "Tum talepler silindi"}), 200



@app.route('/api/cozum/sinirsiz', methods=['POST'])
@jwt_required()
def cozum_sinirsiz():
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({"msg": "Sadece yonetici rota planlayabilir"}), 403
        
    try:
        data = request.json
        
        kargolar_raw = data.get('kargolar', [])
        
        conn = get_db_connection()
        
        
        istasyonlar = conn.execute('SELECT * FROM istasyonlar').fetchall()
        ist_map = {i['id']: {'lat': i['latitude'], 'lon': i['longitude']} for i in istasyonlar}
        
        kargolar = []
        for k in kargolar_raw:
            ist = ist_map.get(k['istasyon_id'])
            
            k_obj = dict(k)
            if ist:
                k_obj['latitude'] = ist['lat']
                k_obj['longitude'] = ist['lon']
            else:
                
                k_obj['latitude'] = 40.8206 
                k_obj['longitude'] = 29.9203
            kargolar.append(k_obj)
        
        
        db_araclar = conn.execute('SELECT * FROM araclar ORDER BY id ASC').fetchall()
        mevcut_araclar = []
        for ar in db_araclar:
            mevcut_araclar.append({
                'id': ar['id'],
                'kapasite': ar['kapasite'],
                'plaka': ar['plaka'], 
                'tip': 'sabit'
            })
            
        
        if not mevcut_araclar:
             mevcut_araclar = [
                {'id': 1, 'kapasite': 500, 'plaka': 'ARAC-1 (500kg)', 'tip': 'sabit'},
                {'id': 2, 'kapasite': 750, 'plaka': 'ARAC-2 (750kg)', 'tip': 'sabit'},
                {'id': 3, 'kapasite': 1000, 'plaka': 'ARAC-3 (1TON)', 'tip': 'sabit'}
            ]
        
       
        sonuc_rotalar = solve_unlimited_vehicles(kargolar, mevcut_araclar, kiralik_arac_kapasite=500, kiralik_arac_maliyet=200)
        
        if sonuc_rotalar:
            save_plan_to_db(conn, sonuc_rotalar, 'sinirsiz')

        conn.close()
        return jsonify(sonuc_rotalar)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/api/cozum/sinirli', methods=['POST'])
@jwt_required()
def cozum_sinirli():
    claims = get_jwt()
    if claims['role'] != 'admin':
        return jsonify({"msg": "Sadece yonetici rota planlayabilir"}), 403
        
    try:
        data = request.json
        kargolar_raw = data.get('kargolar', [])
        hedef = data.get('hedef', 'max_agirlik') 
        
        conn = get_db_connection()
        
        
        istasyonlar = conn.execute('SELECT * FROM istasyonlar').fetchall()
        ist_map = {i['id']: {'lat': i['latitude'], 'lon': i['longitude']} for i in istasyonlar}
        
        kargolar = []
        for k in kargolar_raw:
            ist = ist_map.get(k['istasyon_id'])
            k_obj = dict(k)
            if ist:
                k_obj['latitude'] = ist['lat']
                k_obj['longitude'] = ist['lon']
            else:
                k_obj['latitude'] = 40.8206
                k_obj['longitude'] = 29.9203
            kargolar.append(k_obj)
            
        
        db_araclar = conn.execute('SELECT * FROM araclar ORDER BY id ASC').fetchall()
        mevcut_araclar = []
        for ar in db_araclar:
            mevcut_araclar.append({
                'id': ar['id'],
                'kapasite': ar['kapasite'],
                'plaka': ar['plaka'],
                'tip': 'sabit'
            })
            
        if not mevcut_araclar:
             mevcut_araclar = [
                {'id': 1, 'kapasite': 500, 'plaka': 'ARAC-1 (500kg)', 'tip': 'sabit'},
                {'id': 2, 'kapasite': 750, 'plaka': 'ARAC-2 (750kg)', 'tip': 'sabit'},
                {'id': 3, 'kapasite': 1000, 'plaka': 'ARAC-3 (1TON)', 'tip': 'sabit'}
            ]
            
        
        sonuc = solve_limited_vehicles(kargolar, mevcut_araclar, hedef=hedef)
        
       
        if sonuc.get('rotalar'):
             save_plan_to_db(conn, sonuc['rotalar'], f'sinirli_{hedef}')

        conn.close()
        return jsonify(sonuc)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def save_plan_to_db(conn, rotalar, senaryo_tipi):
    
    total_cost = sum(r['ekstra_maliyet'] + r['toplam_mesafe'] for r in rotalar)
    total_dist = sum(r['toplam_mesafe'] for r in rotalar)
    
    cur = conn.cursor()
    
    try:
        
        cur.execute('''
            INSERT INTO sefer_planlari (senaryo_tipi, toplam_maliyet, toplam_mesafe, kullanilan_arac_sayisi) 
            VALUES (?, ?, ?, ?)
        ''', (senaryo_tipi, total_cost, total_dist, len(rotalar)))
        plan_id = cur.lastrowid
        
        for r in rotalar:
            
            guzergah_json = json.dumps(r.get('rota_coords', []))
            
            cur.execute('''
                INSERT INTO rota_detaylari (plan_id, arac_plaka, kapasite, yuklenen_agirlik, guzergah_json, maliyet, mesafe_km)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (plan_id, r['arac_plaka'], r['kapasite'], r['yuk'], guzergah_json, r['ekstra_maliyet'], r['toplam_mesafe']))
            rota_id = cur.lastrowid
            
            
            for kargo in r['kargolar']:
                cur.execute('INSERT INTO rota_kargo_iliskisi (rota_id, talep_id) VALUES (?, ?)', (rota_id, kargo['id']))
                
                cur.execute("UPDATE talepler SET durum = 'planlandi' WHERE id = ?", (kargo['id'],))
        
        conn.commit()
    except Exception as e:
        print(f"VERITABANI HATASI (save_plan_to_db): {e}")
        import traceback
        traceback.print_exc()
        raise e 

@app.route('/api/user/my-route', methods=['GET'])
@jwt_required()
def get_user_route():
    
    user_id = int(get_jwt_identity())
    conn = get_db_connection()
    
    
    query = '''
        SELECT rd.arac_plaka, rd.guzergah_json, rd.mesafe_km, rd.kapasite, rd.yuklenen_agirlik, 
               t.istasyon_id, i.latitude as hedef_lat, i.longitude as hedef_lon, i.ad as istasyon_adi
        FROM talepler t
        JOIN rota_kargo_iliskisi rki ON t.id = rki.talep_id
        JOIN rota_detaylari rd ON rki.rota_id = rd.id
        JOIN istasyonlar i ON t.istasyon_id = i.id
        WHERE t.user_id = ? 
        ORDER BY t.tarih DESC
    '''
    
    rows = conn.execute(query, (user_id,)).fetchall()
    conn.close()
    
    routes_data = []
    for row in rows:
        routes_data.append({
            'arac_plaka': row['arac_plaka'],
            'rota': json.loads(row['guzergah_json']),
            'mesafe': row['mesafe_km'],
            'istasyon_adi': row['istasyon_adi'],
            'hedef_coords': [row['hedef_lat'], row['hedef_lon']],
            'kapasite': row['kapasite'],
            'yuk': row['yuklenen_agirlik']
        })

    return jsonify({
        'found': len(routes_data) > 0,
        'routes': routes_data
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
