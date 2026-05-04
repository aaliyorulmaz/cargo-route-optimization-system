import React from 'react';
import MapDisplay from './MapDisplay';

const MapModal = ({ routeData, onClose }) => {
    if (!routeData) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                width: '80%',
                height: '80%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}>

                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3>🚚 Araç Rotası: {routeData.plaka}</h3>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}>❌</button>
                </div>






                <div style={{ flex: 1, border: '1px solid #ddd' }}>
                    <MapDisplay
                        routes={[JSON.parse(routeData.guzergah)]}
                        stations={[]} 
                    />
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                    Bu harita sadece kargonuzu taşıyan aracın güzergahını gösterir.
                </div>
            </div>
        </div>
    );
};

export default MapModal;
