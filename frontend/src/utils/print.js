import axios from "axios";
import toast from "react-hot-toast";
import { convertToNormalString } from "./StringTransformation";

// Helper function to check if a value is primitive
const isPrimitive = (value) => {
    return (typeof value !== 'object' || value === null) && !Array.isArray(value);
};

// Helper function to format data for print and omit objects, arrays
const generatePrintableContent = (fields, formValueTemp, tableDisplayName) => {
    let htmlContent = `
        <style>
            .print-container {
                font-family: 'Noto Sans', sans-serif;
                margin: 20px;
                padding: 20px;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
                border-radius: 10px;
            }
            .print-header {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
                text-align: center;
                color: #333;
            }
            .field {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #ddd;
                font-size: 16px;
                color: #555;
            }
            .field:last-child {
                border-bottom: none;
            }
            .field-label {
                font-weight: bold;
            }
            .print-footer {
                margin-top: 20px;
                text-align: center;
                font-style: italic;
                color: #777;
            }
        </style>
        <div class="print-container">
            <div class="print-header">${tableDisplayName}</div>
    `;

    // Loop through each field and add it to the HTML content if it's a primitive value
    fields.forEach(field => {
        let fieldValue = formValueTemp[field.key];
        if(typeof fieldValue == 'string'){
            fieldValue = convertToNormalString(fieldValue)
        }
        if (isPrimitive(fieldValue)) { // Only include primitive values (string, number, boolean)
            htmlContent += `
                <div class="field">
                    <div class="field-label">${field.label}:</div>
                    <div class="field-value">${fieldValue !== undefined && fieldValue !== null ? fieldValue : ''}</div>
                </div>
            `;
        }
    });

    htmlContent += `
            <div class="print-footer">Generated on ${new Date().toLocaleString()}</div>
        </div>
    `;

    return htmlContent;
};

export const handlePrintCurrent = async (id, table, token, globalRoles, tableDisplayName) => {
    let formData = {};
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/${table}/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        let formDataTemp = response.data.formData;
        let formValueTemp = response.data.data;
        let statusTemp = response.data?.data?.status || 'weighbridgeIn';

        if (formDataTemp?.tableName === 'master') {
            formDataTemp = {
                ...formDataTemp,
                fields: formDataTemp.fields?.filter(field => field?.statusToVisible?.includes(statusTemp))
            };
        }

        const fields = formDataTemp.fields.filter(field => field.formView && (globalRoles.some(element => field.rolesToVisible.includes(element))));
        formData = fields;

        // Generate printable content excluding objects, arrays, and undefined values
        const printableContent = generatePrintableContent(fields, formValueTemp, tableDisplayName);

        // Open a new window to print
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(printableContent);
        printWindow.document.close();
        // printWindow.focus();
        // printWindow.print();
        // printWindow.close();

        setTimeout(() => {
            // printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 500); 

    } catch (error) {
        console.error('Error fetching form data:', error);
        toast.error('Print Error');
    }
};
