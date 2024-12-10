import { FileExcelOutlined, FilePdfOutlined, PrinterOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import jsPDF from 'jspdf'
import React, { useContext, useEffect, useState } from 'react'
import { camelCaseToNormal, convertToNormalString } from '../../utils/StringTransformation'
import * as XLSX from 'xlsx';
import { AuthContext } from '../../context/AuthContext'

const ExportOne = ({ pdf, excel, print, table, data_id }) => {
    const now = new Date();
    const date = now.toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
    const time = now.toLocaleTimeString('en-GB'); // Format: HH:MM:SS
    const dateString = `${date} ${time}`;
    const isUpdate = true
    const { globalPermissions, token, defaultToken } = useContext(AuthContext)
    const [formData, setFormData] = useState(null)
    const [status, setStatus] = useState()
    const [canCreate, setCanCreate] = useState(false)
    const [canRead, setCanRead] = useState(false)
    const [canUpdate, setCanUpdate] = useState(false)

    useEffect(() => {

        const entity = table;

        const hasCreatePermission = globalPermissions.includes(`${entity}.create`);
        const hasReadPermission = globalPermissions.includes(`${entity}.read`);
        const hasUpdatePermission = globalPermissions.includes(`${entity}.update`);
        const hasDisabledEditPermission = globalPermissions.includes(`${entity}.disabledEdit`);

        setCanCreate(hasCreatePermission);
        setCanRead(hasReadPermission);
        setCanUpdate(hasUpdatePermission)


        const fetchFormData = async () => {
            const apiUri = import.meta.env.VITE_API_URI; // Extract API URI
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/${table}/${data_id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                let formDataTemp = response.data.formData
                let formValueTemp = response.data.data
                let statusTemp = response.data?.data?.status || 'weighbridgeIn'
                // setFormData(response.data?.formData)
                // console.log(statusTemp)                

                isUpdate && setFormValues(formValueTemp);
                setStatus(statusTemp)

                // console.log('start-->',formDataTemp);

                if (formDataTemp?.tableName == 'master') {
                    formDataTemp = {
                        ...formDataTemp,
                        fields: formDataTemp.fields?.filter(field => field?.statusToVisible?.includes(statusTemp))
                    }
                }

                const fields = formDataTemp.fields.filter(field => field.formView && (globalRoles.some(element => field.rolesToVisible.includes(element))));

                setFormData({ ...formDataTemp, fields });
                // console.log('last-->',formDataTemp);

                // formValueTemp?.roles && setRoleList(formValueTemp.roles)
                // formValueTemp?.permissions && setPermissionsList(formValueTemp.permissions.split(','))

            } catch (error) {
                console.error('Error fetching form data:', error);
            } 
        };

        fetchFormData();
    }, [table, data_id]);

    console.log(formData);
    

    const exportData = {
        excelExport: (data) => {
            // const columnFields = data.columns.map(col => col.field);
            // const filteredRows = data.rows.map(row => {
            //     let filteredRow = {};
            //     columnFields.forEach(field => {
            //         if (field !== 'actions') {
            //             filteredRow[convertToNormalString(field || '')] = convertToNormalString(row[field] || '');
            //         }
            //     });
            //     return filteredRow;
            // });

            // const ws = XLSX.utils.json_to_sheet(filteredRows);
            // const wb = XLSX.utils.book_new();

            // XLSX.utils.book_append_sheet(wb, ws, tableName);
            // XLSX.writeFile(wb, `${tableName}_${dateString}.xlsx`);
        },

        pdfExport: (data) => {
            // const doc = new jsPDF();
            // doc.text(`${tableName}`, 10, 10);
            // doc.autoTable({
            //     head: [data.columns.filter(d => d.headerName !== 'Actions').map(col => col.headerName)],
            //     body: data.rows.map(row => data.columns.filter(col => col.headerName !== 'Actions').map(col => convertToNormalString(row[col.field]))),
            //     startY: 20,
            // });

            doc.save(`${tableName}_${dateString}.pdf`);
        },

        print: (data) => {
            // Create a new window for printing
            const printWindow = window.open('', '_blank');
            const tableHeader = data.columns
                .filter(col => col.headerName !== 'Actions')
                .map(col => `<th>${col.headerName}</th>`)
                .join('');

            const tableRows = data.rows
                .map(row => {
                    const rowData = data.columns
                        .filter(col => col.headerName !== 'Actions')
                        .map(col => `<td>${convertToNormalString(row[col.field] || '')}</td>`)
                        .join('');
                    return `<tr>${rowData}</tr>`;
                })
                .join('');

            const tableHTML = `
                <html>
                <head>
                    <title>${tableName} - ${dateString}</title>
                    <style>
                    *{
                        font-family: 'Noto Sans', sans-serif;
                    }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                            font-size: 16px;
                            text-align: left;
                        }
                        th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                        }
                        th {
                            background-color: #f2f2f2;
                        }
                    </style>
                </head>
                <body>
                    <h1>${tableName} - ${dateString}</h1>
                    <table>
                        <thead>
                            <tr>${tableHeader}</tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </body>
                </html>
            `;

            // Write the HTML content into the new window
            printWindow.document.write(tableHTML);
            printWindow.document.close();

            // Print the content
            printWindow.focus();
            printWindow.print();

            // Close the print window after printing
            printWindow.onafterprint = () => {
                printWindow.close();
            };
        },
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            {excel && (<Tooltip title="Export to Excel" placement="bottomRight">
                <Button
                    shape="circle"
                    icon={<FileExcelOutlined style={{ color: '#1D6F42' }} />} // Excel green
                    onClick={() => exportData.excelExport(data)}
                />
            </Tooltip>)}

            {pdf && (
                <Tooltip title="Export to PDF">
                    <Button
                        shape="circle"
                        icon={<FilePdfOutlined style={{ color: '#E53935' }} placement="bottomRight" />} // PDF red
                        onClick={() => exportData.pdfExport(data)}
                    />
                </Tooltip>
            )}

            {print && (
                <Tooltip title="Print">
                    <Button
                        shape="circle"
                        icon={<PrinterOutlined style={{ color: '#000' }} placement="bottomRight" />} // Black for print
                    // onClick={() => exportData.print(data)}
                    />
                </Tooltip>
            )}
        </div>
    );
};

export default ExportOne;
