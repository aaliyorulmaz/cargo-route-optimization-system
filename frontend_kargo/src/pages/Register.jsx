import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';





function Register() {




    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [mesaj, setMesaj] = useState('');
    const navigate = useNavigate();




    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/register', {
                username,
                password
            });
            setMesaj('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setMesaj('Kayıt başarısız. Kullanıcı adı alınmış olabilir.');
        }
    };




    return (
        <div className="centered-container">
            <div className="panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>📝 Kayıt Ol</h2>

                {mesaj && <div style={{
                    color: mesaj.includes('başarılı') ? 'green' : 'red',
                    marginBottom: '10px'
                }}>{mesaj}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label style={{ textAlign: 'left' }}>Kullanıcı Adı:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ textAlign: 'left' }}>Şifre:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Kayıt Ol</button>
                </form>

                <div style={{ marginTop: '15px' }}>
                    <p>Zaten hesabın var mı? <Link to="/login" style={{ color: '#3498db', fontWeight: 'bold' }}>Giriş Yap</Link></p>
                </div>
            </div>
        </div>
    );
}




export default Register;
