// src/components/UserTypeSelector.js

import React from 'react';
import { Link } from 'react-router-dom';

const UserTypeSelector = () => {
    return (
        <div className="user-type-selector-container">
            <div className="user-type-selector-card">
                <h2>Welcome to PitchPulse</h2>
                <p>Are you here to find a turf or list your own?</p>
                <div className="button-group">
                    <Link to="/login" className="btn-user-type">
                        Player
                    </Link>
                    <Link to="/owner-login" className="btn-user-type">
                        Owner
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UserTypeSelector;