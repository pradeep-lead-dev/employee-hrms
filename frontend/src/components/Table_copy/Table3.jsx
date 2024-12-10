import React, { useState, useMemo, useRef } from 'react';
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';

// Register AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const Table3 = ({ rowData, columns, onEdit }) => {
    const gridRef = useRef();
    const [editableRowIndex, setEditableRowIndex] = useState(null); // Track the row being edited

    // Logic to check if the current cell is editable
    const isCellEditable = (params) => {
        return params.node.rowIndex === editableRowIndex && 
               (params.colDef.field === 'colour' || params.colDef.field === 'weight');
    };

    // Memoize column definitions to avoid unnecessary re-renders
    const columnDefs = useMemo(() => [
        ...columns.map(col => ({
            ...col,
            editable: (params) => isCellEditable(params), // Only editable if conditions are met (2nd and 3rd column)
        })),
        {
            field: "Actions",
            headerName: "Actions",
            width: 120,
            sortable: false,
            cellRenderer: (params) => {
                const isRowEditable = params.node.rowIndex === editableRowIndex;
                return (
                    <IconButton
                        onClick={() => {
                            if (isRowEditable) {
                                setEditableRowIndex(null); // Save and disable editing
                                gridRef.current.api.stopEditing(); // Stop AG Grid editing
                            } else {
                                setEditableRowIndex(params.node.rowIndex); // Enable editing for the selected row
                                gridRef.current.api.startEditingCell({
                                    rowIndex: params.node.rowIndex,
                                    colKey: 'colour', // Start editing at the 'colour' field
                                });
                            }
                        }}
                        color={isRowEditable ? 'success' : 'info'}
                    >
                        {isRowEditable ? <DoneIcon /> : <EditIcon />}
                    </IconButton>
                );
            },
        },
    ], [columns, editableRowIndex]);

    const defaultColDef = useMemo(() => ({
        filter: true,
        flex: 1,
    }), []);

    const onCellValueChanged = (event) => {
        const updatedRowData = [...rowData];
        updatedRowData[event.node.rowIndex] = event.data; // Update the edited row data
        onEdit(updatedRowData); // Trigger the parent component's onEdit function
    };

    return (
        <div className="ag-theme-quartz" style={{ height: 400, width: '100%' }}>
            <AgGridReact
                ref={gridRef}
                rowData={rowData} // Table data
                columnDefs={columnDefs} // Column definitions with editable logic
                defaultColDef={defaultColDef}
                onCellValueChanged={onCellValueChanged} // Handle cell value changes
                pagination={true}
                paginationPageSize={10}
                noRowsOverlayComponentFramework={() => (
                    <div>No Records</div>
                )}
                />
        </div>
    );
};

export default Table3;
