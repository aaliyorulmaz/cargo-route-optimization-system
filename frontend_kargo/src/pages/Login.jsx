import { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Login() {


    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();






    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/login', {
                username,
                password
            });

            



            login({ ...res.data, username });

            



            if (res.data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/user');
            }
        } catch (err) {
            setError('Giriş başarısız! Kullanıcı adı veya şifre hatalı.');
        }
    };




    return (
        <div className="centered-container">
            <div className="panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>🔐 Giriş Yap</h2>

                {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

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
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Giriş Yap</button>
                </form>

                <div style={{ marginTop: '15px' }}>
                    <p>Hesabın yok mu? <Link to="/register" style={{ color: '#3498db', fontWeight: 'bold' }}>Kayıt Ol</Link></p>
                </div>
            </div>
        </div>
    );



}





export default Login;
