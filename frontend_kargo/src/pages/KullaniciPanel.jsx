import { useState, useEffect } from 'react';

import axios from 'axios';

import MapDisplay from '../components/MapDisplay';




function KullaniciPanel() {



    const [istasyonlar, setIstasyonlar] = useState([]);
    const [formData, setFormData] = useState({
        istasyon_id: '',
        kargo_sayisi: '',
        agirlik: ''
    });



    const [mesaj, setMesaj] = useState('');
    const [myRoutes, setMyRoutes] = useState([]); 

    



    useEffect(() => {
        fetchData();
        fetchMyRoutes();
        const interval = setInterval(() => {
            fetchData();
            fetchMyRoutes();
        }, 10000); 
        return () => clearInterval(interval);
    }, []);




    const fetchData = () => {
        axios.get('http://localhost:5000/api/istasyonlar')
            .then(res => setIstasyonlar(res.data))
            .catch(err => console.error(err));
    };






    const fetchMyRoutes = () => {
        
        axios.get('http://localhost:5000/api/user/my-route')
            .then(res => {
                if (res.data.found) {
                    setMyRoutes(res.data.routes);
                } else {
                    setMyRoutes([]);
                }
            })
            .catch(err => console.error("Rota cekilemedi:", err));
    };





    const handleChange = (e) => {
        setFormData({

            ...formData,
            [e.target.name]: e.target.value
        });
    };








    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.istasyon_id || !formData.kargo_sayisi || !formData.agirlik) {
            setMesaj('Lütfen tüm alanları doldurunuz.');
            return;
        }





        axios.post('http://localhost:5000/api/talepler', {
            istasyon_id: parseInt(formData.istasyon_id),
            kargo_sayisi: parseInt(formData.kargo_sayisi),
            agirlik: parseInt(formData.agirlik)
        })

            .then(() => {
                setMesaj('Kargo talebiniz başarıyla alındı! Yönetici onayı bekleniyor.');
                setFormData({ istasyon_id: '', kargo_sayisi: '', agirlik: '' });
                setTimeout(() => setMesaj(''), 5000);
            })
            .catch(err => {
                console.error(err);
                setMesaj('Bir hata oluştu.');
            });

    };

    



    const mapRoutes = myRoutes.map(route => ({
        arac_plaka: route.arac_plaka,
        koordinatlar: route.rota,
        maliyet: 0,
        toplam_mesafe: route.mesafe,

        kapasite: route.kapasite,
        yuk: route.yuk
    }));







    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

            {}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div className="panel" style={{ flex: 1, minWidth: '400px' }}>
                    <h2 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px', marginBottom: '20px', color: '#2c3e50' }}>
                        📦 Kargo Gönderimi
                    </h2>





                    {mesaj && <div style={{
                        padding: '10px',
                        backgroundColor: mesaj.includes('Hata') ? '#e74c3c' : '#2ecc71',
                        color: 'white',
                        marginBottom: '15px',
                        borderRadius: '4px'


                    }}>{mesaj}</div>}




                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Teslim Alınacak İstasyon (İlçe):</label>
                            <select
                                name="istasyon_id"
                                value={formData.istasyon_id}
                                onChange={handleChange}
                                style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                <option value="">Seçiniz...</option>
                                {istasyonlar.map(ist => (
                                    <option key={ist.id} value={ist.id}>
                                        {ist.ad}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                            <div style={{ flex: 1 }}>
                                <label>Kargo Adedi:</label>
                                <input
                                    type="number"
                                    name="kargo_sayisi"
                                    value={formData.kargo_sayisi}
                                    onChange={handleChange}
                                    min="1"
                                    placeholder="Adet"
                                    style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label>Ağırlık (kg):</label>
                                <input
                                    type="number"
                                    name="agirlik"
                                    value={formData.agirlik}
                                    onChange={handleChange}
                                    min="1"
                                    placeholder="kg"
                                    style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ddd' }}
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px', padding: '10px' }}>
                            Talebi Gönder
                        </button>
                    </form>
                </div>

                {}
                <div className="panel" style={{ flex: 1, minWidth: '300px', background: '#f8f9fa' }}>
                    <h3 style={{ color: '#2c3e50', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                        🚚 Kargo Durumunuz ({myRoutes.length})
                    </h3>

                    {myRoutes.length > 0 ? (
                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {myRoutes.map((route, idx) => (
                                <div key={idx} style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <h4 style={{ margin: '0 0 5px 0', color: '#2980b9' }}>📍 İstasyon: {route.istasyon_adi}</h4>
                                    <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Araç:</strong> {route.arac_plaka}</p>
                                    <p style={{ margin: '5px 0', fontSize: '0.9rem' }}><strong>Mesafe:</strong> {route.mesafe ? route.mesafe.toFixed(2) : 0} km</p>
                                    <span style={{
                                        display: 'inline-block',
                                        padding: '4px 8px',
                                        background: '#2ecc71',
                                        color: 'white',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        marginTop: '5px'
                                    }}>
                                        Yolda
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                            <p>Şu an aktif bir sevkiyatınız veya planlanmış rotanız bulunmuyor.</p>
                            <p style={{ fontSize: '0.8rem' }}>Yönetici planlama yaptığında burada görünecektir.</p>
                        </div>
                    )}
                </div>
            </div>

            {}
            {myRoutes.length > 0 && (
                <div className="panel" style={{ padding: '0', overflow: 'hidden', minHeight: '500px' }}>
                    <div style={{ padding: '15px', background: '#ecf0f1', borderBottom: '1px solid #ddd' }}>
                        <h3 style={{ margin: 0 }}>📍 Canlı Takip Haritası</h3>
                    </div>
                    {}
                    <MapDisplay
                        istasyonlar={istasyonlar}
                        rotalar={mapRoutes}
                    />
                </div>
            )}
        </div>
    );
}






export default KullaniciPanel;
