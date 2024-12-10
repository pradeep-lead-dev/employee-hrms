import React, { useContext, useEffect, useState } from 'react';  
import { Steps, Spin, message } from 'antd';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'; // Import green and red icons

const Stepper = ({ status, masterData = [] }) => {
    const [statusList, setStatusList] = useState([]);
    const [actionData, setActionData] = useState(masterData.history || []);
    const [hasFailed, setHasFailed] = useState(false); // Track if failure has occurred
    const [showSuccess, setShowSuccess] = useState(false); 
    const [loading, setLoading] = useState(true); 
    const { defaultToken } = useContext(AuthContext);

    useEffect(() => {
        const getStatuses = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/status`, {
                    headers: {
                        "Authorization": `Bearer ${defaultToken}`
                    }
                });
                const sortedData = response.data.data.sort((a, b) => a.order - b.order);
                setStatusList(sortedData);
            } catch (error) {
                console.error('Error fetching status data:', error);
                message.error('Failed to load status data, please try again.');
            } finally {
                setLoading(false); 
            }
        };

        getStatuses();
        setActionData(masterData.history || []);
    }, [defaultToken, masterData.history]);

    const groupedActions = actionData.reduce((acc, action) => {
        if (!acc[action.status]) {
            acc[action.status] = [];
        }
        acc[action.status].push(action);
        return acc;
    }, {});

    const currentStepIndex = statusList.map(s => s.statusName).indexOf(status);
    const totalSteps = statusList.length;
    const percent = Math.floor(((currentStepIndex + 1) / totalSteps) * 100); 

    const items = statusList.map((statusItem, index) => {
        const actions = groupedActions[statusItem.statusName] || [];
        const title = statusItem.statusDisplayName;

        const description = actions.length > 0
            ? actions.map((action, idx) => `${idx + 1}. ${action.summary}`).join('\n')
            : statusItem.description || 'No actions available.';

        let icon = undefined;
        let stepStatus = undefined;

        // Logic for setting icons and step status
        if (statusItem.statusName === 'verificationSuccess') {
            icon = <CheckCircleOutlined style={{ color: 'green' }} />;
            stepStatus = 'finish'; // Mark step as completed
            setHasFailed(false); // If success is reached, reset failure
        } else if (statusItem.statusName === 'verificationFailed') {
            if (!showSuccess) {
                icon = <CloseCircleOutlined style={{ color: 'red' }} />;
                stepStatus = 'error'; // Only mark step as error when failed and no success
                setHasFailed(true);
            }
        } else if (showSuccess && index === currentStepIndex) {
            icon = <CheckCircleOutlined style={{ color: 'green' }} />;
            stepStatus = 'finish';
        }

        // If failure occurred, keep earlier steps normal except for the failure one
        if (hasFailed && statusItem.statusName !== 'verificationFailed') {
            stepStatus = 'process'; // Keep other steps normal if failed
        }

        return {
            title: <div style={{ fontWeight: 'bold' }}>{title}</div>,
            description: <div style={{ whiteSpace: 'pre-line' }}>{description}</div>,
            icon,
            status: stepStatus,
        };
    });

    const handleStatusToggle = () => {
        const isSuccess = currentStepIndex === totalSteps - 1; 
        setShowSuccess(isSuccess);
    };

    useEffect(() => {
        handleStatusToggle(); 
    }, [currentStepIndex, totalSteps]);

    return (
        <div>
            {loading ? ( 
                <Spin tip="Loading..." /> 
            ) : (
                <Steps
                    direction='vertical'
                    current={currentStepIndex}
                    percent={percent}
                    items={items.map(item => ({
                        ...item,
                        // Hide failure status if success is true
                        status: showSuccess && item.status === 'error' ? undefined : item.status 
                    }))}
                />
            )}
        </div>
    );
};

export default Stepper;
