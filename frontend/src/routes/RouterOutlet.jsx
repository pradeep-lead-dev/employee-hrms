import React, { useContext, useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Orders from '../components/Orders/Orders';
import Dashboard from '../pages/Dashboard/Dashboard';
import LiveDetection from '../pages/LiveDetection/LiveDetection';
import Settings from '../pages/Settings/Settings';
import Workflow from '../pages/Workflow/Workflow';
import FormBuilder from '../pages/FormBuilder/FormBuilder';
import Roles from '../pages/Roles/Roles';
import AutomationBuilder from '../components/AutomationBuilder/AutomationBuilder';
import Table from '../components/Table/Table';
import DynamicForm from '../components/DynamicForm/DynamicForm';
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage';
import PrivacyPolicy from '../components/PrivacyPolicy/PrivacyPolicy';
import { AuthContext } from '../context/AuthContext';

const RouterOutlet = () => {
    const { globalPermissions } = useContext(AuthContext)
    return (
        <Routes>
            {globalPermissions.includes('dashboard.read') && <Route path="/" element={<Dashboard />} />}
            {/* {globalPermissions.includes('spot.read') && <Route path="/live-detection" element={<LiveDetection />} />} */}
            <Route path="/settings" element={<Settings />} />
            <Route path="/forms" element={<FormBuilder />} />
            <Route path="/forms/:id" element={<FormBuilder isUpdate={true} />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/workflow" element={<AutomationBuilder />} />
            <Route path="/workflow/:id" element={<AutomationBuilder isUpdate={true} />} />
            <Route path="/table/:param" element={<Table />} />
            <Route path="/table/native/:param/" element={<Table native={true} />} />
            <Route path="/form/:table/" element={<DynamicForm />} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/form/:table/:id" element={<DynamicForm isUpdate={true} />} />
            <Route path="/form/:table/:id" element={<DynamicForm isUpdate={true} />} />
            <Route path={`/profile/:table/:id`} element={<DynamicForm isUpdate={true} userProfile={true}/>} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}

export default RouterOutlet