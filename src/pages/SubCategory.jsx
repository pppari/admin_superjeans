import { Button, message, Modal, Form, Input, Table, Select } from 'antd';
import axios from '../lib/axios';
import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import dateFormat from '../lib/dateFormat';

const { Option } = Select;

const SubCategory = () => {
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]); // ✅ category หลัก
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingSubCategory, setEditingSubCategory] = useState(null);
    const [form] = Form.useForm();
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteId, setDeleteId] = useState(null);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        fetchSubCategories();
        fetchCategories(); // ✅ ดึง category หลัก
    }, []);

    const fetchSubCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/sub-categories');
            setSubCategories(response.data.data || response.data);
        } catch (error) {
            messageApi.error('โหลดข้อมูลล้มเหลว');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            setCategories(response.data.data || response.data);
        } catch (error) {
            messageApi.error('โหลด Category หลักล้มเหลว');
        }
    };

    const deleteSubCategory = async (id) => {
        try {
            await axios.delete(`/api/sub-categories/${id}`);
            messageApi.success('ลบข้อมูลสำเร็จ');
            fetchSubCategories();
            setIsDeleteModalVisible(false);
        } catch (error) {
            messageApi.error('ลบข้อมูลล้มเหลว');
        }
    };

    const createSubCategory = async (values) => {
        try {
            await axios.post('/api/sub-categories', values);
            messageApi.success('สร้างข้อมูลสำเร็จ');
            fetchSubCategories();
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            messageApi.error('สร้างข้อมูลล้มเหลว');
        }
    };

    const updateSubCategory = async (values) => {
        if (editingSubCategory) {
            try {
                await axios.put(`/api/sub-categories/${editingSubCategory._id}`, values);
                messageApi.success('แก้ไขข้อมูลสำเร็จ');
                fetchSubCategories();
                setIsModalVisible(false);
                setEditingSubCategory(null);
                form.resetFields();
            } catch (error) {
                messageApi.error('แก้ไขข้อมูลล้มเหลว');
            }
        }
    };

    const handleCreateOrEdit = async (values) => {
        if (isEditMode && editingSubCategory) {
            await updateSubCategory(values);
        } else {
            await createSubCategory(values);
        }
    };

    const openEditModal = (subCategory) => {
        setEditingSubCategory(subCategory);
        setIsEditMode(true);
        form.setFieldsValue({
            name: subCategory.name,
            description: subCategory.description,
            categoryId: subCategory.categoryId?._id || subCategory.categoryId
        });
        setIsModalVisible(true);
    };

    const handleSearchChange = (e) => setSearchQuery(e.target.value);

    const filteredSubCategories = subCategories.filter(
        (sub) =>
            sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (sub.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const columns = [
        {
            title: 'ชื่อ',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'คำอธิบาย',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'หมวดหมู่หลัก',
            dataIndex: 'categoryId',
            key: 'categoryId',
            render: (cat) => (cat?.name || '-'),
        },
        {
            title: 'สร้าง',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => dateFormat(text),
        },
        {
            title: 'อัพเดทล่าสุด',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (text) => dateFormat(text),
        },
        {
            title: 'ดำเนินการ',
            key: 'action',
            render: (_, record) => (
                <>
                    <Button onClick={() => openEditModal(record)} style={{ marginRight: 8 }}>
                        แก้ไข
                    </Button>
                    <Button danger onClick={() => { setDeleteId(record._id); setIsDeleteModalVisible(true); }}>
                        ลบ
                    </Button>
                </>
            ),
        },
    ];

    return (
        <div className="container mx-auto p-4">
            {contextHolder}
            <h2 className="text-2xl font-semibold mb-4">จัดการหมวดหมู่ย่อย</h2>

            <div className="flex justify-between items-center">
                <Input
                    placeholder="ค้นหาหมวดหมู่ย่อย..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="mb-4"
                    style={{ width: 300 }}
                />

                <Button
                    type="primary"
                    icon={<FaPlus />}
                    onClick={() => {
                        setIsModalVisible(true);
                        setIsEditMode(false);
                        form.resetFields();
                    }}
                    className="mb-4"
                >
                    เพิ่ม
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredSubCategories}
                rowKey="_id"
                loading={loading}
            />

            {/* Modal for Create/Edit */}
            <Modal
                title={isEditMode ? 'แก้ไขหมวดหมู่ย่อย' : 'สร้างหมวดหมู่ย่อย'}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form form={form} onFinish={handleCreateOrEdit} layout="vertical">
                    <Form.Item
                        name="name"
                        label="ชื่อหมวดหมู่ย่อย"
                        rules={[{ required: true, message: 'กรุณากรอกชื่อ!' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item name="description" label="คำอธิบาย">
                        <Input.TextArea />
                    </Form.Item>

                    {/* ✅ Select Category หลัก */}
                    <Form.Item
                        name="categoryId"
                        label="หมวดหมู่หลัก"
                        rules={[{ required: true, message: 'กรุณาเลือกหมวดหมู่หลัก!' }]}
                    >
                        <Select placeholder="เลือกหมวดหมู่หลัก">
                            {categories.map((cat) => (
                                <Option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {isEditMode ? 'บันทึก' : 'สร้าง'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                title="ต้องการลบข้อมูลใช่หรือไม่?"
                visible={isDeleteModalVisible}
                onCancel={() => setIsDeleteModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsDeleteModalVisible(false)}>
                        ยกเลิก
                    </Button>,
                    <Button
                        key="delete"
                        type="primary"
                        danger
                        onClick={() => deleteId && deleteSubCategory(deleteId)}
                    >
                        ลบ
                    </Button>,
                ]}
            >
                <p>การลบจะไม่สามารถย้อนกลับได้</p>
            </Modal>
        </div>
    );
};

export default SubCategory;
