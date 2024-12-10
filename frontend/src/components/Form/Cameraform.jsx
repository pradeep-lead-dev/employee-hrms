import React, { useEffect } from 'react';
import { Form, Input, Select, Button } from 'antd';

const { Option } = Select;

const CameraForm = ({ 
    formFields = [], 
    formData = {}, 
    onChange, 
    errors = {}, 
    onSave, 
    axes = [], 
    onAxisChange, 
    onAxisAdd, 
    onAxisRemove, 
    isEditing // Add isEditing prop
}) => {
    const [form] = Form.useForm();

    // Populate the form fields when a row is selected for editing
    useEffect(() => {
        form.setFieldsValue(formData);
    }, [formData, form]);

    // Function to handle changes in the form fields
    const handleFieldChange = (name, value) => {
        onChange({ [name]: value });
    };

    return (
        <Form form={form} layout="vertical" onFinish={onSave}>
            {formFields.map(field => (
                <Form.Item
                    key={field.name}
                    label={field.label}
                    validateStatus={errors[field.name] ? 'error' : ''}
                    help={errors[field.name] && field.rules?.message}
                >
                    {field.type === 'input' ? (
                        <Input
                            value={formData[field.name]}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                        />
                    ) : field.type === 'select' ? (
                        <Select
                            value={formData[field.name]}
                            onChange={(value) => handleFieldChange(field.name, value)}
                            placeholder={field.placeholder}
                        >
                            {field.options.map(option => (
                                <Option key={option} value={option}>{option}</Option>
                            ))}
                        </Select>
                    ) : null}
                </Form.Item>
            ))}

            {/* Line Axes Section */}
            <Form.Item label="Line Axes">
                {axes.map((axis, index) => (
                    <div key={index} style={{ display: 'flex', marginBottom: '8px' }}>
                        <Input
                            value={axis.x}
                            onChange={(e) => onAxisChange(index, 'x', e.target.value)}
                            placeholder={`X${index + 1}`}
                            style={{ width: '45%', marginRight: '10px' }}
                        />
                        <Input
                            value={axis.y}
                            onChange={(e) => onAxisChange(index, 'y', e.target.value)}
                            placeholder={`Y${index + 1}`}
                            style={{ width: '45%' }}
                        />
                    </div>
                ))}

                {/* Container for buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <Button type="dashed" onClick={onAxisAdd} style={{ width: '40%' }}>
                        Add Axis
                    </Button>
                    {axes.length > 1 && (
                        <Button type="dashed" onClick={onAxisRemove} style={{ width: '40%' }}>
                            Remove Axis
                        </Button>
                    )}
                </div>
            </Form.Item>

            {/* Conditional Button Text */}
            <Button type="primary" htmlType="submit" block>
                {isEditing ? 'Update Record' : 'Save Camera'}
            </Button>
        </Form>
    );
};

export default CameraForm;
