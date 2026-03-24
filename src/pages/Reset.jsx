import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "../lib/axios";
import Cover from "../assets/pexels-fotoaibe-1643383.jpg";
import { Link, useSearchParams } from "react-router-dom";


const Reset = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();



  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.put("/api/admin/reset-password", {
        ...values,
        token,
      });
      messageApi.open({
        type: 'success',
        content: 'รีเซ็ตรหัสผ่านสำเร็จ',
      });

      setTimeout(() => {
        window.location.href = "/signin";
      }, 3000);
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {contextHolder}

      {/* Left: Login Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold mb-8">รีเซ็ตรหัสผ่าน</h2>
          <Form
            name="reset"
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ remember: true }}
          >

            <Form.Item
              name="password"
              label="ตั้งรหัสผ่านใหม่"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
              />
            </Form.Item>
            <Form.Item
              name="cfPassword"
              label="ยืนยันรหัสผ่านใหม่"
              dependencies={['password']}
              rules={[
                { required: true, message: "กรุณายืนยันรหัสผ่าน" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('รหัสผ่านไม่ตรงกัน'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="ยืนยันรหัสผ่าน"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                loading={loading}
              >
                บันทึกรหัสผ่าน
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      <div className="hidden md:block relative bg-cover bg-center" style={{ backgroundImage: `url(${Cover})` }}>
        <div style={{ background: "rgba(0, 0, 0, 0.5)" }} className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
          <h2 className="text-3xl font-bold mb-2">Furniture Super Jeans</h2>
          <p className="text-lg">ระบบหลังบ้านและคลังสินค้า</p>
        </div>
      </div>
    </div>
  );
};

export default Reset;
