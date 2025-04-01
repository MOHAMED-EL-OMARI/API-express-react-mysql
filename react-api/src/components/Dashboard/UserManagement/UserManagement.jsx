import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../authcontext';
import { useNavigate } from 'react-router-dom';
import './UserManagement.css';

const UserManagement = () => {
    const { token, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Check if user is admin
        if (!user || user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/admin/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            
            if (response.status === 401 || response.status === 403) {
                setMessage("Access denied. Admin privileges required.");
                return;
            }

            setMessage(data.message);
            if (response.ok) {
                setUserData({ name: '', email: '', password: '', role: 'user' });
            }
        } catch (error) {
            setMessage('Error creating user');
        }
    };

    return (
        <div className="user-management">
            <h2>Create User</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        value={userData.name}
                        onChange={(e) => setUserData({...userData, name: e.target.value})}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={userData.password}
                        onChange={(e) => setUserData({...userData, password: e.target.value})}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Role:</label>
                    <select
                        value={userData.role}
                        onChange={(e) => setUserData({...userData, role: e.target.value})}
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button type="submit">Create User</button>
            </form>
            {message && <p className={message.includes('Error') ? 'error' : 'success'}>{message}</p>}
        </div>
    );
};

export default UserManagement;