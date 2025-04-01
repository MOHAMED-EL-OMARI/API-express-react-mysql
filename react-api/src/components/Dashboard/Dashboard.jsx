import React from 'react';
import UserManagement from './UserManagement/UserManagement';
import ApiManagement from './ApiManagement/ApiManagement';
import LogoutButton from '../LogoutButton/LogoutButton';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <LogoutButton />
            </div>
            <div className="dashboard-grid">
                <UserManagement />
                <ApiManagement />
            </div>
        </div>
    );
};

export default Dashboard;