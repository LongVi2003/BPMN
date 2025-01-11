import React,{useState} from 'react';
import {useNavigate} from 'react-router-dom';
import { useUser } from './UserContext';
import './Login.css'
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const {login} = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${username}:${password}`),
        },
      });

      if (response.ok) {
        setError(null); 
        login(username);
        navigate('/dashboard'); 
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    }
  };
  return (
    <div className='login'>
      <div className="loginForm">
        <h2>Login</h2>
        <form onSubmit = {handleSubmit} className='form-login'>
          <input type="text" placeholder="Username" value = {username} onChange = {(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password" value = {password} onChange={(e) =>setPassword(e.target.value)} />
          <button type="submit">Login</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}

export default Login;
