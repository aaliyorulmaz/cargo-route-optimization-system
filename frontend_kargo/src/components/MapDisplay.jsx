import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const truckIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/741/741407.png', 
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


function ChangeView({ bounds }) {
    const map = useMap();
    if (bounds && bounds.length > 0) {
        map.fitBounds(bounds);
    }
    return null;
}

function MapDisplay({ istasyonlar, rotalar }) {
    

    const center = [40.8206, 29.9203]; 

    
    const bounds = istasyonlar.map(i => [i.latitude, i.longitude]);

    return (
        <MapContainer center={center} zoom={10} scrollWheelZoom={true} style={{ height: '500px', width: '100%', borderRadius: '8px' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            
            {istasyonlar.map(ist => (
                <Marker
                    key={ist.id}
                    position={[ist.latitude, ist.longitude]}
                    icon={ist.ad === 'Kocaeli Üniversitesi' ? redIcon : blueIcon}
                >
                    <Popup>
                        <b>{ist.ad}</b>
                        {ist.ad === 'Kocaeli Üniversitesi' && <><br /><i>(Merkez Depo)</i></>}
                    </Popup>
                </Marker>
            ))}

            
            {rotalar && rotalar.map((rota, idx) => {
                
                const startPoint = rota.koordinatlar && rota.koordinatlar.length > 0 ? rota.koordinatlar[0] : null;

                return (
                    <div key={idx}>
                        <Polyline
                            positions={rota.koordinatlar}
                            pathOptions={{
                                color: '#8e44ad',
                                weight: 5,
                                opacity: 0.8,
                                dashArray: '10, 10', 
                                lineCap: 'round'
                            }}
                        >
                            <Popup>
                                <b>Araç: {rota.arac_plaka}</b> <br />
                                Maliyet: {rota.maliyet} TL <br />
                                Mesafe: {rota.toplam_mesafe ? rota.toplam_mesafe.toFixed(2) : 0} km
                            </Popup>
                        </Polyline>





                        
                        {startPoint && (
                            <Marker position={startPoint} icon={truckIcon}>
                                <Popup maxWidth={300}>
                                    <div style={{ textAlign: 'left' }}>
                                        <h4 style={{ margin: '0 0 8px 0', borderBottom: '1px solid #ccc', color: '#2c3e50' }}>
                                            🚛 {rota.arac_plaka}
                                        </h4>
                                        <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                                            <b>Kapasite:</b> {rota.kapasite ? rota.kapasite + ' kg' : 'Bilinmiyor'}<br />
                                            <b>Mevcut Yük:</b> {rota.yuk ? rota.yuk + ' kg' : 'Bilinmiyor'}
                                        </p>

                                        


                                        {rota.kargolar && rota.kargolar.length > 0 && (
                                            <div style={{ marginTop: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                                                <strong style={{ fontSize: '0.9rem', color: '#e67e22' }}>📦 Yüklü Kargolar:</strong>
                                                <ul style={{ paddingLeft: '15px', margin: '5px 0', fontSize: '0.85rem' }}>
                                                    {rota.kargolar.map((k, i) => (
                                                        <li key={i}>
                                                            <b>{k.username || 'user'}</b>: {k.istasyon_adi} ({k.agirlik} kg)
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </div>
                )
            })}

            <ChangeView bounds={bounds} />
        </MapContainer>
    );
}

export default MapDisplay;
