// Updated layout for improved mobile view
import React from 'react';
import './OnboardingWizard.css'; // Assuming there's a CSS file for styles

const OnboardingWizard = () => {
    return (
        <div className="wizard-container">
            <h1 className="wizard-title">Welcome to the Wizard!</h1>
            <div className="wizard-content">
                {/* Wizard steps go here */}
            </div>
            <button className="wizard-button">Next</button>
        </div>
    );
};

export default OnboardingWizard;

// Updated CSS for mobile responsiveness
/* OnboardingWizard.css */
.wizard-container {
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.wizard-title {
    font-size: 24px;
    margin-bottom: 16px;
    text-align: center;
}

.wizard-content {
    padding: 12px;
}

.wizard-button {
    padding: 12px 24px;
    font-size: 18px;
    margin-top: 20px;
    border: none;
    border-radius: 8px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    touch-action: manipulation;
}

.wizard-button:hover {
    background-color: #0056b3;
}