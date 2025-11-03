// src/pages/Product.js
import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from '../lib/axios';
import toPrice from '../lib/toPrice';

const { Search } = Input;
const { Option } = Select;

const Product = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // โหลดข้อมูลเริ่มต้น
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchRooms();
  }, []);

  // -----------------------
  // ฟังก์ชันดึงข้อมูล
  // -----------------------
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/products');
      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      console.error(err);
      messageApi.open({ type: 'error', content: 'โหลดสินค้าล้มเหลว' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      const data = Array.isArray(res.data) ? res.data : [];
      setCategories(data);
    } catch (err) {
      console.error(err);
      messageApi.open({ type: 'error', content: 'โหลดประเภทหลักล้มเหลว' });
    }
  };

  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) return setSubCategories([]);
    try {
      const res = await axios.get(`/api/sub-categories/category/${categoryId}`);
      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];
      setSubCategories(data);
      return data;
    } catch (err) {
      console.error(err);
      messageApi.open({ type: 'error', content: 'โหลดประเภทย่อยล้มเหลว' });
      setSubCategories([]);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/rooms');
      const data = Array.isArray(res.data) ? res.data : [];
      setRooms(data);
    } catch (err) {
      console.error(err);
      messageApi.open({ type: 'error', content: 'โหลดห้องล้มเหลว' });
    }
  };

  // -----------------------
  // ฟังก์ชันจัดการ
  // -----------------------
  const handleSearch = (value) => {
    const searchVal = value?.toLowerCase() || '';
    const filtered = products.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(searchVal) ||
        (p.categoryId?.name || '').toLowerCase().includes(searchVal) ||
        (p.subCategoryId?.name || '').toLowerCase().includes(searchVal) ||
        (p.sku || '').toLowerCase().includes(searchVal)
    );
    setFilteredProducts(filtered);
  };

  const handleFormSubmit = async (values) => {
    try {
      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, values);
        messageApi.open({ type: 'success', content: 'แก้ไขข้อมูลสำเร็จ' });
      } else {
        await axios.post('/api/products/create', values);
        messageApi.open({ type: 'success', content: 'สร้างข้อมูลสำเร็จ' });
      }
      setModalVisible(false);
      form.resetFields();
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      messageApi.open({ type: 'error', content: 'มีบางอย่างผิดพลาด' });
    }
  };

  const handleEdit = async (product) => {
    setEditingProduct(product);
    setModalVisible(true);

    if (product.categoryId?._id) {
      await fetchSubCategories(product.categoryId._id);
    }

    form.setFieldsValue({
      ...product,
      categoryId: product.categoryId?._id || null,
      subCategoryId: product.subCategoryId?._id || null,
      roomId: product.roomId?._id || null,
    });
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`/api/products/${id}`);
      messageApi.open({ type: 'success', content: 'ลบข้อมูลสำเร็จ' });
      fetchProducts();
      setIsDeleteModalVisible(false);
    } catch (err) {
      console.error(err);
      messageApi.open({ type: 'error', content: 'ลบข้อมูลล้มเหลว' });
    }
  };

  // -----------------------
  // ตารางสินค้า
  // -----------------------
  const columns = [
    { title: 'ชื่อ', dataIndex: 'name', key: 'name', render: (v) => v || '-' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (v) => v || '-' },
    { title: 'ราคา', dataIndex: 'price', key: 'price', render: (v) => (v != null ? toPrice(v) : '-') },
    { title: 'ประเภท', key: 'categoryId', render: (_, record) => record.categoryId?.name || '-' },
    { title: 'ประเภทย่อย', key: 'subCategoryId', render: (_, record) => record.subCategoryId?.name || '-' },
    { title: 'ห้อง', key: 'roomId', render: (_, record) => record.roomId?.name || '-' },
    {
      title: 'ดำเนินการ',
      key: 'action',
      render: (_, record) => (
        <>
          <Button style={{ marginRight: 8 }} onClick={() => window.open(`/product/${record._id}`, '_blank')}>ลักษณะ</Button>
          <Button style={{ marginRight: 8 }} onClick={() => handleEdit(record)}>แก้ไข</Button>
          <Button danger onClick={() => { setDeleteProductId(record._id); setIsDeleteModalVisible(true); }}>ลบ</Button>
        </>
      ),
    },
  ];

  // -----------------------
  // JSX Render
  // -----------------------
  return (
    <div className="p-4">
      {contextHolder}
      <h2 className="text-2xl font-semibold mb-4">จัดการสินค้า</h2>

      <div className="flex justify-between items-center mb-4">
        <Search placeholder="ค้นหา..." onSearch={handleSearch} className="max-w-md" allowClear />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setEditingProduct(null);
            setSubCategories([]);
            setModalVisible(true);
          }}
        >
          เพิ่มสินค้า
        </Button>
      </div>

      <Table
        dataSource={filteredProducts}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}
        open={modalVisible}
        onCancel={() => { setModalVisible(false); setEditingProduct(null); form.resetFields(); }}
        onOk={() => form.submit()}
        okText={editingProduct ? 'บันทึก' : 'เพิ่ม'}
        cancelText="ยกเลิก"
      >
        <Form layout="vertical" form={form} onFinish={handleFormSubmit}>
          <Form.Item name="name" label="ชื่อ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="คำอธิบาย">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="price" label="ราคา">
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item name="weight" label="น้ำหนัก">
            <Input />
          </Form.Item>
          <Form.Item name="material" label="วัสดุ">
            <Input />
          </Form.Item>
          <Form.Item name="dimensions" label="ขนาด">
            <Input />
          </Form.Item>

          <Form.Item name="categoryId" label="ประเภท" rules={[{ required: true }]}>
            <Select
              placeholder="เลือกประเภท"
              onChange={(value) => {
                form.setFieldsValue({ subCategoryId: null });
                fetchSubCategories(value);
              }}
              dropdownRender={(menu) => (
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>{menu}</div>
              )}
            >
              {categories.map((cat) => (
                <Option key={cat._id} value={cat._id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="subCategoryId" label="ประเภทย่อย" rules={[{ required: true }]}>
            <Select placeholder="เลือกประเภทย่อย">
              {subCategories.map((sub) => (
                <Option key={sub._id} value={sub._id}>{sub.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="roomId" label="ห้อง" rules={[{ required: true }]}>
            <Select placeholder="เลือกห้อง">
              {rooms.map((room) => (
                <Option key={room._id} value={room._id}>{room.name}</Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="ยืนยันการลบ"
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onOk={() => deleteProduct(deleteProductId)}
        okText="ลบ"
        okButtonProps={{ danger: true }}
      >
        <p>คุณแน่ใจว่าต้องการลบสินค้านี้หรือไม่?</p>
      </Modal>
    </div>
  );
};

export default Product;
