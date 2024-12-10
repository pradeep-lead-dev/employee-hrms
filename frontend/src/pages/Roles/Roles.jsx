import React, { useState } from 'react';
import { Container, Typography, TextField, Checkbox, Button, Grid, Table, TableBody, TableCell, TableHead, TableRow, Paper, FormControlLabel, Box, FormLabel, FormControl } from '@mui/material';
import { motion } from 'framer-motion';
import BackButton from '../../components/BackButton/BackButton';

const Roles = () => {
    const [roleName, setRoleName] = useState('');
    const [permissions, setPermissions] = useState([]);

    const modules = ['dashboard', 'records', 'live', 'settings'];
    const actions = ['create', 'read', 'update', 'delete'];

    // Check if all permissions for all modules and actions are selected
    const isAllSelected = () => {
        return modules.every(module => actions.every(action => permissions.includes(`${module}.${action}`)));
    };

    // Handle "Select All" toggle
    const handleSelectAll = () => {
        const newPermissions = [...permissions];
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
    const handleSubmit = (e) => {
        e.preventDefault();
        const result = {
            roleName,
            permissions
        };
        console.log('Submitted data:', JSON.stringify(result, null, 2));
        // Send to server or process further
    };

    return (
        <div>
            
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <BackButton />
                <form onSubmit={handleSubmit}>

                    <FormControl>
                        <FormLabel htmlFor="roleName" sx={{paddingTop : '20px'}}>Role Name</FormLabel>
                        <TextField
                            margin="normal"
                            variant="outlined"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            required
                        />
                    </FormControl>

                    {/* Table for permissions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {/* Select All Checkbox */}
                                    <TableCell align="left">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={isAllSelected()}
                                                    onChange={handleSelectAll}
                                                />
                                            }
                                            label="Select All"
                                        />
                                    </TableCell>

                                    {/* Two-line Column Headers */}
                                    {actions.map(action => (
                                        <TableCell key={action} align="center">
                                            <Box display="flex" flexDirection="column" alignItems="center">
                                                <Typography variant="body1">
                                                    {action.charAt(0).toUpperCase() + action.slice(1)}
                                                </Typography>
                                                <Checkbox
                                                    checked={isAllSelectedForAction(action)}
                                                    onChange={() => handleActionToggleAll(action)}
                                                />
                                            </Box>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {modules.map((module) => (
                                    <TableRow key={module}>
                                        {/* Row header for modules with "Select All" per module */}
                                        <TableCell>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={isAllSelectedForModule(module)}
                                                        onChange={() => handleModuleToggleAll(module)}
                                                    />
                                                }
                                                label={module.charAt(0).toUpperCase() + module.slice(1)}
                                            />
                                        </TableCell>

                                        {/* Permissions checkboxes for each action */}
                                        {actions.map((action) => (
                                            <TableCell key={`${module}-${action}`} align="center">
                                                <Checkbox
                                                    checked={permissions.includes(`${module}.${action}`)}
                                                    onChange={() => handlePermissionChange(module, action)}
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            // fullWidth
                            sx={{ mt: 4, minWidth:'200px' }}
                            type="submit"
                        >
                            Submit
                        </Button>
                    </motion.div>
                </form>
            </Paper>
        </div>
    );
};

export default Roles;
