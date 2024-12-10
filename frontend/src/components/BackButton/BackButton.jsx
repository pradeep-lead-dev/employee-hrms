// BackButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { styled } from '@mui/material/styles';

const ModernBackButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(90deg, #065172 30%, #057eb3 90%)',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '5px 10px',
    fontWeight: 600,
    fontSize: '16px',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'linear-gradient(45deg, ##057eb3 30%, #065172 90%)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
        transform: 'scale(1.05)',
    },
    '& .MuiButton-startIcon': {
        marginRight: '8px',
        transition: 'transform 0.3s ease',
    },
    '&:hover .MuiButton-startIcon': {
        transform: 'translateX(-3px)',
    },
}));

const BackButton = ({ label = '', ...props }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(-1); // Navigate to the previous page
    };

    return (
        <ModernBackButton
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={handleClick}
            {...props}
        >
            
        </ModernBackButton>
    );
};

export default BackButton;
