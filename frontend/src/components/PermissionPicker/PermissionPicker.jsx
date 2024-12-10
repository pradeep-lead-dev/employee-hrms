import React, { useContext, useEffect, useState } from 'react';
import { Form, Input, Checkbox, Button, Table, Typography, Card, Row, Col } from 'antd';
import { motion } from 'framer-motion';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { createStyles } from 'antd-style';
import { AuthContext } from '../../context/AuthContext';

const PermissionPicker = ({ setPermissionsList, permissionsList, disabled }) => {
    const [permissions, setPermissions] = useState(permissionsList || []);
    const [modules, setModules] = useState([]);
    const [count, setCount] = useState(0)
    const {token, defaultToken} = useContext(AuthContext)

    const useStyle = createStyles(({ css, token }) => {
        const { antCls } = token;
        return {
            customTable: css`
            ${antCls}-table {
              ${antCls}-table-container {
                ${antCls}-table-body,
                ${antCls}-table-content {
                  scrollbar-width: thin;
                  scrollbar-color: unset;
                }
              }
            }
          `,
        };
    });
    const { styles } = useStyle();

    useEffect(() => {
        const fetchFormData = async () => {
            try {
                const allCollections = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/get-all-tables`, {
                    headers: {
                        "Authorization": `Bearer ${defaultToken}`
                    }
                });
                const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/forms`,{
                    headers: {
                        "Authorization": `Bearer ${defaultToken}`
                    }
                });

                const listTables = response?.data?.data?.map(table => table.tableName);
                const combinedModules = [...modules, ...listTables, ...allCollections.data.data];
                const uniqueModules = [...new Set(combinedModules)];

                setModules(uniqueModules);
                setCount(count + 1);
            } catch (error) {
                console.error('Error fetching form data:', error);
            }
        };

        count == 0 && fetchFormData();
    }, [])
    const actions = ['create', 'read', 'update', 'delete', 'export', 'disabledEdit'];

    // Check if all permissions for all modules and actions are selected
    const isAllSelected = () => {
        return modules?.every(module => actions?.every(action => permissions.includes(`${module}.${action}`)));
    };

    useEffect(() => {
        setPermissionsList(permissions)
    }, [permissions])

    // Handle "Select All" toggle
    const handleSelectAll = () => {
        if (isAllSelected()) {
            setPermissions([]); // Deselect all
        } else {
            const allPermissions = modules.flatMap(module => actions.map(action => `${module}.${action}`));
            setPermissions(allPermissions); // Select all
        }
    };

    // Check if all permissions for a specific action (column) are selected
    const isAllSelectedForAction = (action) => {
        return modules.every(module => permissions.includes(`${module}.${action}`));
    };

    // Check if all permissions for a specific module (row) are selected
    const isAllSelectedForModule = (module) => {
        return actions.every(action => permissions.includes(`${module}.${action}`));
    };

    // Toggle all permissions for a specific action (column)
    const handleActionToggleAll = (action) => {
        const newPermissions = [...permissions];
        modules.forEach(module => {
            const permission = `${module}.${action}`;
            if (isAllSelectedForAction(action)) {
                const index = newPermissions.indexOf(permission);
                if (index > -1) newPermissions.splice(index, 1); // Deselect
            } else {
                if (!newPermissions.includes(permission)) newPermissions.push(permission); // Select
            }
        });
        setPermissions(newPermissions);
    };

    // Toggle all permissions for a specific module (row)
    const handleModuleToggleAll = (module) => {
        const newPermissions = [...permissions];
        actions.forEach(action => {
            const permission = `${module}.${action}`;
            if (isAllSelectedForModule(module)) {
                const index = newPermissions.indexOf(permission);
                if (index > -1) newPermissions.splice(index, 1); // Deselect
            } else {
                if (!newPermissions.includes(permission)) newPermissions.push(permission); // Select
            }
        });
        setPermissions(newPermissions);
    };

    // Handle individual permission checkbox change
    const handlePermissionChange = (module, action) => {
        const permissionString = `${module}.${action}`;
        setPermissions((prevPermissions) => {
            if (prevPermissions.includes(permissionString)) {
                return prevPermissions.filter(permission => permission !== permissionString);
            } else {
                return [...prevPermissions, permissionString];
            }
        });
    };

    // Handle form submission
    const handleSubmit = () => {
        const result = {
            permissions
        };
        // console.log('Submitted data:', JSON.stringify(result, null, 2));
        // Send to server or process further
    };

    // Columns configuration for the Ant Design Table
    const columns = [
        {
            title: (
                <Checkbox
                    checked={isAllSelected()}
                    onChange={handleSelectAll}
                    disabled={disabled}
                >
                    Select All
                </Checkbox>
            ),
            dataIndex: 'module',
            fixed: 'left',
            render: (module) => (
                <Checkbox
                    checked={isAllSelectedForModule(module)}
                    onChange={() => handleModuleToggleAll(module)}
                    disabled={disabled}
                >
                    {module?.charAt(0).toUpperCase() + module?.slice(1)}
                </Checkbox>
            ),
        },
        ...actions.map(action => ({
            title: (
                <div>
                    <Checkbox
                        checked={isAllSelectedForAction(action)}
                        onChange={() => handleActionToggleAll(action)}
                        disabled={disabled}
                    >
                        {action.charAt(0).toUpperCase() + action.slice(1)}
                    </Checkbox>
                </div>
            ),
            dataIndex: action,
            align: 'center',
            render: (_, { module }) => (
                <Checkbox
                    checked={permissions.includes(`${module}.${action}`)}
                    onChange={() => handlePermissionChange(module, action)}
                    disabled={disabled}
                />
            ),
        })),
    ];

    // Data configuration for the Ant Design Table
    const data = modules.map((module) => ({
        key: module,
        module,
    }));

    return (
        <Form onFinish={handleSubmit} layout="vertical">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Table
                    scroll={{ x: true }}
                    size='small'
                    columns={columns}
                    dataSource={data}
                    pagination={false}
                    bordered
                    className={styles.customTable}
                // style={{ marginBottom: '20px' }}
                />
            </motion.div>
        </Form>
    );
};

export default PermissionPicker;
