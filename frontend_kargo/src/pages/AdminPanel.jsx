import { useState, useEffect } from 'react';
import axios from 'axios';
import MapDisplay from '../components/MapDisplay';

function AdminPanel() {
    const [istasyonlar, setIstasyonlar] = useState([]);
    const [talepler, setTalepler] = useState([]);
    const [araclar, setAraclar] = useState([]);

    
    const [cozumSonucu, setCozumSonucu] = useState(null);
    const [haritaRotalari, setHaritaRotalari] = useState([]);

    const [hedef, setHedef] = useState('max_agirlik');
    const [tasinamayanlar, setTasinamayanlar] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    



    const handleSinirliCozum = () => {
        const kargolar = talepler.map(t => ({
            id: t.id,
            agirlik: t.agirlik,
            istasyon_id: t.istasyon_id,
            username: t.username,
            istasyon_adi: t.istasyon_adi
        }));

        axios.post('http://localhost:5000/api/cozum/sinirli', { kargolar, hedef })
            .then(res => {
                


                const rotalar = res.data.rotalar || [];
                const rejected = res.data.tasinamayanlar || [];

                setCozumSonucu(rotalar);
                setTasinamayanlar(rejected);
                rotalariOlustur(rotalar);
            })
            .catch(err => alert('Hata: ' + err.message));
    };

    const handleSinirsizCozum = () => {
        const kargolar = talepler.map(t => ({
            id: t.id,
            agirlik: t.agirlik,
            istasyon_id: t.istasyon_id,
            username: t.username,
            istasyon_adi: t.istasyon_adi
        }));

        axios.post('http://localhost:5000/api/cozum/sinirsiz', { kargolar })
            .then(res => {
                
                setCozumSonucu(res.data);
                setTasinamayanlar([]); 
                rotalariOlustur(res.data);
            })
            .catch(err => alert('Hata: ' + err.message));
    };

    const fetchData = () => {
        axios.get('http://localhost:5000/api/istasyonlar').then(res => setIstasyonlar(res.data));
        axios.get('http://localhost:5000/api/talepler').then(res => setTalepler(res.data));
        axios.get('http://localhost:5000/api/araclar').then(res => setAraclar(res.data));
    };

    const handleSilTalepler = () => {
        if (window.confirm('Tüm talepler silinsin mi?')) {
            axios.delete('http://localhost:5000/api/talepler').then(() => fetchData());
        }
    };


    const rotalariOlustur = (sonucVerisi) => {
        


        const yeniRotalar = sonucVerisi.map(sefer => {
            let koordinatlar = [];

            if (sefer.rota_coords && sefer.rota_coords.length > 0) {
                
                koordinatlar = sefer.rota_coords;
            } else {
                
                const depo = istasyonlar.find(i => i.ad === 'Izmit') || istasyonlar[0];
                if (depo) koordinatlar.push([depo.latitude, depo.longitude]); 

                sefer.kargolar.forEach(kargo => {
                    
                    const ist = istasyonlar.find(i => i.id === kargo.istasyon_id);
                    if (kargo.latitude && kargo.longitude) {
                        koordinatlar.push([kargo.latitude, kargo.longitude]);
                    } else if (ist) {
                        koordinatlar.push([ist.latitude, ist.longitude]);
                    }
                });

                if (depo) koordinatlar.push([depo.latitude, depo.longitude]); 
            }





            return {
                arac_plaka: sefer.arac_plaka,
                maliyet: sefer.ekstra_maliyet,
                toplam_mesafe: sefer.toplam_mesafe,
                kapasite: sefer.kapasite,
                yuk: sefer.yuk,
                kargolar: sefer.kargolar,
                koordinatlar: koordinatlar
            };
        });

        setHaritaRotalari(yeniRotalar);
    };





    const handleSilIstasyon = (id) => {
        if (window.confirm('İstasyonu silmek istediğinize emin misiniz?')) {
            axios.delete(`http://localhost:5000/api/istasyonlar/${id}`)
                .then(() => {
                    alert('İstasyon silindi.');
                    fetchData();
                })
                .catch(err => alert('Hata: ' + err.message));
        }
    };

    return (
        <div className="panel" style={{ width: '95%', maxWidth: 'none', margin: '20px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>🛠️ Yönetici Operasyon Paneli</h2>
                <button onClick={handleSilTalepler} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                    Talepleri Temizle
                </button>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                {}
                <div style={{ flex: 1, minWidth: '400px' }}>

                    {}
                    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #bdc3c7', borderRadius: '5px', background: '#f9f9f9' }}>
                        <h4>➕ İstasyon Yönetimi</h4>

                        {}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const ad = e.target.ad.value;
                            const lat = e.target.lat.value;
                            const lon = e.target.lon.value;
                            axios.post('http://localhost:5000/api/istasyonlar', { ad, latitude: lat, longitude: lon })
                                .then(() => {
                                    alert('İstasyon eklendi!');
                                    fetchData();
                                    e.target.reset();
                                })
                                .catch(err => alert('Hata: ' + err.message));
                        }} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <input name="ad" placeholder="İlçe Adı" required style={{ flex: 1, padding: '5px' }} />
                            <input name="lat" placeholder="Enlem (Lat)" required style={{ width: '80px', padding: '5px' }} />
                            <input name="lon" placeholder="Boylam (Lon)" required style={{ width: '80px', padding: '5px' }} />
                            <button type="submit" style={{ background: '#27ae60', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>Ekle</button>
                        </form>

                        {}
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                <tbody>
                                    {istasyonlar.map(ist => (
                                        <tr key={ist.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td>{ist.ad}</td>
                                            <td style={{ color: '#7f8c8d' }}>{ist.latitude}, {ist.longitude}</td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleSilIstasyon(ist.id)}
                                                    style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}
                                                >
                                                    Sil
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>












                    {}
                    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #bdc3c7', borderRadius: '5px', background: '#f9f9f9' }}>
                        <h4>🚚 Araç Filosu Yönetimi</h4>
                        <p style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>Araçlar "ARAC-1", "ARAC-2" şeklinde otomatik sıra numara alır.</p>

                        {}
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const kapasite = e.target.kapasite.value;
                            axios.post('http://localhost:5000/api/araclar', { kapasite: parseInt(kapasite) })
                                .then(() => {
                                    alert('Araç eklendi!');
                                    fetchData();
                                    e.target.reset();
                                })
                                .catch(err => alert('Hata: ' + err.message));
                        }} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                            <input name="kapasite" type="number" placeholder="Kapasite (kg)" required style={{ flex: 1, padding: '5px' }} />
                            <button type="submit" style={{ background: '#2980b9', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>Ekle</button>
                        </form>

                        {}
                        <h5 style={{ marginTop: '15px', marginBottom: '10px', borderBottom: '1px solid #ddd', paddingBottom: '5px' }}>
                            📋 Mevcut Filo ({araclar.length})
                        </h5>

                        {}
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {araclar.length === 0 ? (
                                <p style={{ color: '#999', fontSize: '0.9rem', fontStyle: 'italic' }}>Henüz araç eklenmemiş.</p>
                            ) : (
                                <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                    <tbody>
                                        {araclar.map(arac => (
                                            <tr key={arac.id} style={{ borderBottom: '1px solid #eee' }}>
                                                <td><b>{arac.plaka}</b></td>
                                                <td>{arac.kapasite} kg</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`${arac.plaka} silinecek. Diğer araç numaraları kaydırılacak. Emin misiniz?`)) {
                                                                axios.delete(`http://localhost:5000/api/araclar/${arac.id}`)
                                                                    .then(() => {
                                                                        fetchData();
                                                                        
                                                                        setTimeout(fetchData, 500);
                                                                    });
                                                            }
                                                        }}
                                                        style={{ background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}
                                                    >
                                                        Sil
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {}
                    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #34495e', borderRadius: '5px', background: '#2c3e50', color: 'white' }}>
                        <h4 style={{ color: '#f1c40f' }}>📊 İstasyon Bazlı Günlük Özet</h4>
                        <table style={{ width: '100%', fontSize: '0.9rem', marginTop: '10px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #7f8c8d' }}>
                                    <th style={{ textAlign: 'left' }}>İstasyon</th>
                                    <th>Toplam Adet</th>
                                    <th>Toplam Ağırlık</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(talepler.reduce((acc, curr) => {
                                    if (!acc[curr.istasyon_adi]) {
                                        acc[curr.istasyon_adi] = { ad: curr.istasyon_adi, adet: 0, agirlik: 0 };
                                    }
                                    acc[curr.istasyon_adi].adet += curr.kargo_sayisi;
                                    acc[curr.istasyon_adi].agirlik += curr.agirlik;
                                    return acc;
                                }, {})).map((ist, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #34495e' }}>
                                        <td style={{ padding: '5px' }}>{ist.ad}</td>
                                        <td style={{ textAlign: 'center' }}>{ist.adet}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#f1c40f' }}>{ist.agirlik} kg</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h3>Gelen Kargo Talepleri ({talepler.length}) Detay</h3>
                    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', marginBottom: '20px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#ecf0f1' }}>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>İstasyon</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Adet</th>
                                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Ağırlık</th>
                                </tr>
                            </thead>
                            <tbody>
                                {talepler.map(t => (
                                    <tr key={t.id}>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.istasyon_adi}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.kargo_sayisi}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{t.agirlik} kg</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {}
                    <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                        <button
                            onClick={handleSinirsizCozum}
                            className="btn-primary"
                            style={{
                                width: '100%',
                                padding: '15px',
                                fontSize: '1.2rem',
                                background: 'linear-gradient(to right, #2980b9, #2c3e50)',
                                border: 'none',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                color: 'white',
                                cursor: 'pointer',
                                borderRadius: '8px'
                            }}
                        >
                            🚀 Otomatik Rota Oluştur (En Optimum Plan)
                        </button>
                        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#7f8c8d', marginTop: '10px' }}>
                            Algoritma mevcut filoyu ve gerekirse kiralık araçları kullanarak <b>maliyet odaklı</b> en uygun rotayı hesaplayacaktır.
                        </p>
                    </div>

                    
                    {cozumSonucu && (
                        <div style={{ marginTop: '20px' }}>
                            <div style={{ padding: '10px', background: '#d5f5e3', borderRadius: '5px', marginBottom: '10px' }}>
                                <h4>✅ Planlama Tamamlandı ({cozumSonucu.length} Sefer)</h4>
                                <div style={{ marginTop: '10px' }}>
                                    {cozumSonucu.map((rota, idx) => (
                                        <div key={idx} style={{ background: 'white', padding: '15px', borderRadius: '5px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                            <h5 style={{ margin: '0 0 10px 0', color: '#2c3e50', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
                                                🚛 {rota.arac_plaka} <span style={{ fontSize: '0.9rem', color: '#7f8c8d', fontWeight: 'normal' }}> (Maliyet: {rota.ekstra_maliyet} TL, Mesafe: {rota.toplam_mesafe} km)</span>
                                            </h5>

                                            <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ color: '#7f8c8d', textAlign: 'left' }}>
                                                        <th style={{ padding: '4px' }}>Gönderen</th>
                                                        <th style={{ padding: '4px' }}>İstasyon</th>
                                                        <th style={{ padding: '4px' }}>Ağırlık</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {rota.kargolar.map((kargo, kIdx) => (
                                                        <tr key={kIdx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                            <td style={{ padding: '4px', fontWeight: 'bold', color: '#2980b9' }}>
                                                                {kargo.username || 'user'}
                                                            </td>
                                                            <td style={{ padding: '4px' }}>{kargo.istasyon_adi}</td>
                                                            <td style={{ padding: '4px' }}>{kargo.agirlik} kg</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                                
                            </div>

                            
                            {tasinamayanlar.length > 0 && (
                                <div style={{ padding: '10px', background: '#fadbd8', borderRadius: '5px', border: '1px solid #e74c3c' }}>
                                    <h4 style={{ color: '#c0392b', marginTop: 0 }}>⚠️ Taşıma Kapasitesi Aşıldı</h4>
                                    <p style={{ fontSize: '0.9rem' }}>Aşağıdaki kargolar mevcut araçlara sığmadı:</p>
                                    <ul style={{ paddingLeft: '20px', fontSize: '0.85rem' }}>
                                        {tasinamayanlar.map(t => (
                                            <li key={t.id}>
                                                <b>{t.istasyon_adi || 'Bilinmeyen'}</b> - {t.agirlik} kg
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                
                <div style={{ flex: 1 }}>
                    <h3>Canlı Rota Haritası</h3>
                    <MapDisplay istasyonlar={istasyonlar} rotalar={haritaRotalari} />
                </div>
            </div>
        </div>
    );
}

export default AdminPanel;
