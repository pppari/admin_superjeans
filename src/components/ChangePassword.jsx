import { message, Modal, Form, Input, Alert, Button } from 'antd'
import React, { useState } from 'react'
import axios from '../lib/axios'

function ChangePassword({decodedToken, open, onCancel}) {
    const userId = decodedToken.id;
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [form] = Form.useForm();
    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/signin";
      };
    const [messageApi, contextHolder] = message.useMessage();
    const handleChangePassword = async (values) => {
        try {
            const res = await axios.put(`/api/admin/change-password/${userId}`, values);
            setSuccess(res.data.message);
            setError(null);
            form.resetFields();
            messageApi.open({
      type: 'success',
      content: 'เปลี่ยนรหัสผ่านสำเร็จ',
    });
            onCancel();
            handleLogout();
        } catch (error) {
            setError(error.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
            setSuccess(null);
            console.error(error);
        }
    }

    const validateConfirmPassword = (_, value) => {
        const newPassword = form.getFieldValue('newPassword');
        if (!value || newPassword === value) {
            return Promise.resolve();
        }
        return Promise.reject('รหัสผ่านไม่ตรงกัน');
    };

    return (
        <Modal 
            title="เปลี่ยนรหัสผ่าน"
            open={open} 
            onCancel={onCancel} 
            footer={false}
        >
            <Form 
                form={form}
                onFinish={handleChangePassword}
                layout="vertical"
            >
                {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}
                {success && <Alert message={success} type="success" style={{ marginBottom: 16 }} />}
                
                <Form.Item 
                    name="oldPassword" 
                    label="รหัสผ่านเดิม"
                    rules={[
                        { required: true, message: 'กรุณากรอกรหัสผ่านเดิม' },
                        { min: 6, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' }
                    ]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item 
                    name="newPassword" 
                    label="รหัสผ่านใหม่"
                    rules={[
                        { required: true, message: 'กรุณากรอกรหัสผ่านใหม่' },
                        { min: 6, message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' }
                    ]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item 
                    name="cfPassword" 
                    label="ยืนยันรหัสผ่านใหม่"
                    rules={[
                        { required: true, message: 'กรุณายืนยันรหัสผ่านใหม่' },
                        { validator: validateConfirmPassword }
                    ]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                    <Button type="default" onClick={onCancel} style={{ marginRight: 8 }}>
                        ยกเลิก
                    </Button>
                    <Button type="primary" htmlType="submit">
                        ยืนยัน
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ChangePassword