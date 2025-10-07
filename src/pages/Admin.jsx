import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Popconfirm,
  Space,
  Switch,
  message,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
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
      messageApi.open({
        type: 'error',
        content: 'โหลดข้อมูลล้มเหลว',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const lower = search.toLowerCase();
    setFilteredAdmins(
      admins.filter((admin) => admin.email.toLowerCase().includes(lower))
    );
  }, [search, admins]);

  const handleCreate = () => {
    setEditingAdmin(null);
    form.resetFields();
    form.setFieldsValue({
      isVerified: true
    });
    setIsModalVisible(true);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    form.setFieldsValue({
      email: admin.email,
      isVerified: admin.isVerified,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.patch(`/api/admin/${id}`);
      messageApi.open({
        type: 'success',
        content: 'ลบข้อมูลสำเร็จ',
      });
      fetchAdmins();
    } catch {
      messageApi.open({
        type: 'success',
        content: 'ลบข้อมูลล้มเหลว',
      });
    }
  };

  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingAdmin) {
        await axios.put(`/api/admin/${editingAdmin._id}`, values);
        messageApi.open({
          type: 'success',
          content: 'แก้ไขข้อมูลสำเร็จ',
        });
      } else {
        await axios.post("/api/admin", values);
        messageApi.open({
          type: 'success',
          content: 'สร้างข้อมูลสำเร็จ',
        });
      }
      setIsModalVisible(false);
      fetchAdmins();
    } catch (err) {
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    }
  };

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAdmins.slice(start, start + pageSize);
  }, [filteredAdmins, currentPage]);

  return (
    <div className="p-4">
      {contextHolder}
      <Space
        className="mb-4"
        direction="vertical"
        size="middle"
        style={{ width: "100%" }}
      >
        <h1 className="text-2xl font-semibold">จัดการแอดมิน</h1>
        <Space className="w-full justify-between">
          <Input.Search
            placeholder="ค้นหาอีเมล..."
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
          <Table.Column title="อีเมล" dataIndex="email" key="email" />
          <Table.Column
            title="สถานะ"
            dataIndex="isVerified"
            key="isVerified"
            render={(verified) => (
              <Tag color={verified ? "green" : "red"}>
                {verified ? "ปกติ" : "ระงับ"}
              </Tag>
            )}
          />
          <Table.Column
            title="จัดการ"
            key="actions"
            render={(_, record) => (
              <Space>
                <Button
                  onClick={() => handleEdit(record)}
                >
                  แก้ไข
                </Button>
                <Popconfirm
                  title="คุณแน่ใจหรือไม่ว่าต้องการลบ?"
                  onConfirm={() => handleDelete(record._id)}
                  okText="ใช่"
                  cancelText="ไม่"
                >
                  <Button danger>
                    ลบ
                  </Button>
                </Popconfirm>
              </Space>
            )}
          />
        </Table>
      </Space>

      <Modal
        title={editingAdmin ? "แก้ไขผู้ดูแลระบบ" : "สร้างผู้ดูแลระบบ"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleFormSubmit}
        okText={editingAdmin ? "อัพเดต" : "สร้าง"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="email"
            label="อีเมล"
            rules={[
              {
                required: true,
                type: "email",
                message: "กรุณาระบุอีเมลที่ถูกต้อง",
              },
            ]}
          >
            <Input />
          </Form.Item>

          {!editingAdmin && (
            <Form.Item
              name="password"
              label="รหัสผ่าน"
              rules={[{ required: true, message: "กรุณาระบุรหัสผ่าน" }]}
            >
              <Input.Password />
            </Form.Item>
          )}

          <Form.Item
            name="isVerified"
            label="สถานะ"
            valuePropName="checked"
          >
            <Switch checkedChildren="ปกติ" unCheckedChildren="ระงับ" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Admin;
