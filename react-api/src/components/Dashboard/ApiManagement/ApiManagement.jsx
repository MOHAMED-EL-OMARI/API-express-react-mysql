import React, { useState, useEffect } from 'react';
import './ApiManagement.css';

const ApiManagement = () => {
    const [apis, setApis] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchApis();
    }, []);

    const fetchApis = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/admin/apis', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setApis(data.apis);
            }
        } catch (error) {
            setMessage('Error fetching APIs');
        }
    };

    const handleApiAction = async (apiId, action) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/apis/${apiId}/${action}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setMessage(data.message);
            if (response.ok) {
                fetchApis(); // Refresh the list
            }
        } catch (error) {
            setMessage(`Error ${action} API`);
        }
    };

    return (
        <div className="api-management">
            <h2>API Management</h2>
            <div className="api-list">
                {apis.map(api => (
                    <div key={api.id} className="api-item">
                        <div className="api-info">
                            <h3>{api.name}</h3>
                            <p>Endpoint: {api.endpoint}</p>
                            <p>Status: {api.is_active ? 'Active' : 'Inactive'}</p>
                        </div>
                        <div className="api-actions">
                            <button 
                                onClick={() => handleApiAction(api.id, api.is_active ? 'deactivate' : 'activate')}
                                className={api.is_active ? 'deactivate' : 'activate'}
                            >
                                {api.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button 
                                onClick={() => handleApiAction(api.id, 'delete')}
                                className="delete"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {message && <p className={message.includes('Error') ? 'error' : 'success'}>{message}</p>}
        </div>
    );
};

export default ApiManagement;