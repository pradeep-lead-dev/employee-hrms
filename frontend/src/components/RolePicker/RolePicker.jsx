import React, { useContext, useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import axios from 'axios';
import { LoadingOutlined } from '@ant-design/icons';
import { AuthContext } from '../../context/AuthContext';

const RolePicker = ({ roleList, setRoleList, mode, disabled }) => {
    const [loading, setLoading] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState(roleList || []);
    const [roles, setRoles] = useState([]);
    // console.log('rolelist from picker ',roleList);
    const { token, defaultToken } = useContext(AuthContext)


    useEffect(() => {
        setRoleList(selectedRoles)
    }, [selectedRoles])

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        setSelectedRoles(roleList)
    }, [roleList])

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/roles`, {
                headers: {
                    "Authorization": `Bearer ${defaultToken}`
                }
            });

            setRoles(response.data.data);

            // setRoles([
            //     {
            //         roleName: 'role1',
            //         roleDisplayName: 'Role 1',
            //         permissions: ['dashboard.create', 'dashboard.read']
            //     },
            //     {
            //         roleName: 'role2',
            //         roleDisplayName: 'Role 2'
            //     },
            //     {
            //         roleName: 'role3',
            //         roleDisplayName: 'Role 3'
            //     },
            //     {
            //         roleName: 'role4',
            //         roleDisplayName: 'Role 4'
            //     },
            // ])
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (value) => {
        setSelectedRoles(value);
    };

    return (
        <Select
            disabled={disabled}
            mode={mode || 'multiple'}
            placeholder="Select roles"
            value={selectedRoles}
            onChange={handleChange}
            loading={loading}
            // style={{ width: '100%', borderRadius: '8px', boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' }}
            maxTagCount="responsive"
            optionLabelProp="label"
            dropdownRender={(menu) => (
                <div>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '10px 0' }}>
                            <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                        </div>
                    ) : (
                        menu
                    )}
                </div>
            )}
        >
            {roles?.map((role) => (
                <Select.Option key={role.roleName} value={role.roleName} label={role.roleDisplayName || role.roleName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{role.roleDisplayName || role.roleName}</span>
                    </div>
                </Select.Option>
            ))}
        </Select>
    );
};

export default RolePicker;
