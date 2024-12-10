import React, { useMemo, useRef, useState } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
import { MenuModule } from "@ag-grid-enterprise/menu";
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

const Table2 = ({ rowData, columns, onEdit, onDelete }) => {
    const gridRef = useRef();
    const [editableRowIndex, setEditableRowIndex] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const columnDefs = useMemo(() => {
        return [
            ...columns.map(col => ({
                ...col,
                editable: (params) => col.field === 'colour' || col.field === 'weight'
                    ? params.node.rowIndex === editableRowIndex // Editable only if this is the selected row
                    : false,
                onCellValueChanged: (params) => {
                    if (params.node.rowIndex === editableRowIndex) {
                        onEdit({ ...params.data, [col.field]: params.newValue }); // Update parent with new value
                    }
                }
            })),
            {
                field: "Actions",
                headerName: "Actions",
                width: 120,
                sortable: false,
                cellRenderer: (params) => (
                    <>
                        <IconButton
                            onClick={() => {
                                setEditableRowIndex(params.node.rowIndex); // Make row editable
                                onEdit(params.data); // Populate form fields with row data
                            }}
                            color="info"
                        >
                            <EditIcon />
                        </IconButton>

                        <IconButton
                            onClick={() => {
                                setSelectedRow(params.data); // Select row to delete
                                setOpenDeleteDialog(true); // Open delete confirmation dialog
                            }}
                            color="error"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </>
                ),
            },
        ];
    }, [columns, editableRowIndex, onEdit]);

    const defaultColDef = useMemo(() => ({
        filter: true,
        flex: 1,
    }), []);

    const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
    const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

    const handleDeleteConfirm = () => {
        if (selectedRow) {
            onDelete(selectedRow); // Trigger parent component to delete the row
        }
        setOpenDeleteDialog(false); // Close dialog
        setSelectedRow(null); // Reset selected row
    };

    const handleDeleteCancel = () => {
        setOpenDeleteDialog(false); // Close dialog
        setSelectedRow(null); // Reset selected row
    };

    return (
        <div style={containerStyle}>
            <div className="container">
                <div className="grid-wrapper">
                    <div style={{ ...gridStyle, overflowX: 'auto' }} className="ag-theme-quartz">
                        <style>
                            {`.ag-icon.ag-icon-filter, 
                              .ag-icon.ag-icon-menu-alt, 
                              .ag-paging-row-summary-panel {
                                display: none;
                            }`}
                        </style>
                        <AgGridReact
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            pagination={true}
                            paginationPageSize={10}
                            noRowsOverlayComponentFramework={() => (
                                <div>No Records</div>
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this record?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteConfirm} color="primary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Table2;
