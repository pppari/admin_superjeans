import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axios from "../lib/axios";
import Cover from "../assets/pexels-fotoaibe-1643383.jpg";
import { Link } from "react-router-dom";


const Forgot = () => {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();


  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/admin/forgot", values);
      messageApi.open({
        type: 'success',
        content: res.data.message,
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
          <h2 className="text-3xl font-semibold mb-8">ส่งคำขอรีเซ็ตรหัสผ่าน</h2>
          <Form
            name="forgot"
            layout="vertical"
            onFinish={onFinish}
            initialValues={{ remember: true }}
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full mb-4"
                loading={loading}
              >
                ส่งคำขอ
              </Button>
              <div className="flex justify-center mt-2">
                <Link to="/signin">กลับสู่หน้าเข้าสู่ระบบ</Link>
              </div>
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

export default Forgot;
