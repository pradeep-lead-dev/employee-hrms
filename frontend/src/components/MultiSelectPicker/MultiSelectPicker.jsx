import React, { useContext, useEffect, useState } from 'react';
import { Select, Spin } from 'antd';
import axios from 'axios';
import { LoadingOutlined } from '@ant-design/icons';
import { AuthContext } from '../../context/AuthContext';

const MultiSelectPicker = ({ MultiSelectList, setMultiSelectList, mode, tableName, labelName, valueName, setMultipleSelectKey, field }) => {
    const [loading, setLoading] = useState(false);
    const [selectedRoles, setSelectedRoles] = useState(MultiSelectList || []);
    const [roles, setRoles] = useState([]);
    // console.log('MultiSelectList from picker ',MultiSelectList);
    const { token, defaultToken } = useContext(AuthContext)
    if (field) {

        setMultipleSelectKey(field?.key)
    }

    useEffect(() => {
        setMultiSelectList(selectedRoles)
    }, [selectedRoles])

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        setSelectedRoles(MultiSelectList)
    }, [MultiSelectList])

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/${tableName}`, {
                headers: {
                    "Authorization": `Bearer ${defaultToken}`
                }
            });

            setRoles(response.data.data);
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
            mode={mode || 'multiple'}
            placeholder="Select Status"
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
                <Select.Option key={role[valueName]} value={role[valueName]} label={role[labelName]}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{role[labelName]}</span>
                    </div>
                </Select.Option>
            ))}
        </Select>
    );
};

export default MultiSelectPicker;
