import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Popconfirm,
  Space,
  message,
  Switch,
  Select, // ✅ เพิ่ม Select จาก antd
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import axios from "../lib/axios";

const Admin = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [form] = Form.useForm();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/admin");
      setAdmins(res.data);
    } catch (err) {
      messageApi.open({ type: "error", content: "โหลดข้อมูลล้มเหลว" });
    } finally {
      setLoading(false);
    }
  };

  // filter
  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredAdmins(
      admins.filter(
        (admin) =>
          admin.email.toLowerCase().includes(lower) ||
          admin.name.toLowerCase().includes(lower) ||
          admin.phone.toLowerCase().includes(lower)
      )
    );
    setCurrentPage(1);
  }, [search, admins]);

  const handleCreate = () => {
    setEditingAdmin(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // ✅ เปลี่ยนสถานะด้วย Switch
  const handleToggleStatus = async (admin) => {
    const newStatus = admin.status === "active" ? "inactive" : "active";
    try {
      await axios.put(`/api/admin/${admin._id}`, { status: newStatus });
      setAdmins((prev) =>
        prev.map((a) =>
          a._id === admin._id ? { ...a, status: newStatus } : a
        )
      );
      messageApi.open({
        type: "success",
        content: `เปลี่ยนสถานะเป็น ${
          newStatus === "active" ? "ปกติ" : "ระงับ"
        } แล้ว`,
      });
    } catch (err) {
      messageApi.open({ type: "error", content: "เปลี่ยนสถานะล้มเหลว" });
    }
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      await axios.post("/api/admin", values);
      messageApi.open({ type: "success", content: "สร้างข้อมูลสำเร็จ" });
      setIsModalVisible(false);
      fetchAdmins();
    } catch (err) {
      messageApi.open({ type: "error", content: "มีบางอย่างผิดพลาด" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/admin/${id}`);
      messageApi.open({ type: "success", content: "ลบข้อมูลสำเร็จ" });
      fetchAdmins();
    } catch (err) {
      messageApi.open({ type: "error", content: "ลบข้อมูลล้มเหลว" });
    }
  };

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const sortedAdmins = [...filteredAdmins].sort((a, b) => {
      if (a.status === b.status) return 0;
      return a.status === "active" ? -1 : 1;
    });
    return sortedAdmins.slice(start, start + pageSize);
  }, [filteredAdmins, currentPage]);

  return (
    <div className="p-4">
      {contextHolder}
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <h1 className="text-2xl font-semibold">จัดการแอดมิน</h1>

        <Space className="w-full justify-between">
          <Input.Search
            placeholder="ค้นหาอีเมล, ชื่อผู้ใช้, เบอร์โทร..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ maxWidth: 300 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            สร้าง
          </Button>
        </Space>

        <Table
          rowKey="_id"
          dataSource={paginatedData}
          loading={loading}
          pagination={{
            total: filteredAdmins.length,
            current: currentPage,
            pageSize,
            onChange: setCurrentPage,
          }}
        >
          <Table.Column title="ชื่อดูแลระบบ" dataIndex="name" />
          <Table.Column title="เบอร์โทร" dataIndex="phone" />
          <Table.Column title="อีเมล" dataIndex="email" />

          {/* ✅ คอลัมน์สถานะเป็น Switch */}
          <Table.Column
            title="สถานะ"
            dataIndex="status"
            render={(_, record) => (
              <Switch
                checked={record.status === "active"}
                onChange={() => handleToggleStatus(record)}
                checkedChildren="ปกติ"
                unCheckedChildren="ระงับ"
              />
            )}
          />

          <Table.Column
            title="จัดการ"
            render={(_, record) => (
              <Popconfirm
                title="คุณแน่ใจหรือไม่ว่าต้องการลบ?"
                onConfirm={() => handleDelete(record._id)}
                okText="ใช่"
                cancelText="ไม่"
              >
                <Button danger>ลบ</Button>
              </Popconfirm>
            )}
          />
        </Table>
      </Space>

      {/* ✅ Modal สำหรับ “สร้าง” เท่านั้น */}
      <Modal
        title="สร้างผู้ดูแลระบบ"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleFormSubmit}
        okText="สร้าง"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: "",
            email: "",
            password: "",
            phone: "",
            status: "active",
          }}
        >
          <Form.Item
            name="name"
            label="ชื่อดูแลระบบ"
            rules={[{ required: true, message: "กรุณาระบุชื่อผู้ใช้" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="อีเมล"
            rules={[
              { required: true, type: "email", message: "กรุณาระบุอีเมลที่ถูกต้อง" },
            ]}
          >
            <Input autoComplete="off" />
          </Form.Item>

          <Form.Item
            name="password"
            label="รหัสผ่าน"
            rules={[{ required: true, message: "กรุณาระบุรหัสผ่าน" }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="เบอร์โทร"
            rules={[{ required: true, message: "กรุณาระบุเบอร์โทร" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="status" label="สถานะ">
            <Select>
              <Select.Option value="active">ปกติ</Select.Option>
              <Select.Option value="inactive">ระงับ</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admin;
