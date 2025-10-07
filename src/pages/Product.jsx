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
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchRooms();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data || []);
      setFilteredProducts(res.data || []);
    } catch (err) {
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data || []);
    } catch (err) {
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    }
  };

  const fetchSubCategories = async (categoryId) => {
    if (!categoryId) {
      setSubCategories([]);
      return;
    }
    try {
      const res = await axios.get(`/api/sub-categories/category/${categoryId}`);
      setSubCategories(res.data.data || []);
    } catch (err) {
      messageApi.open({
        type: 'error',
        content: 'โหลดประเภทย่อยล้มเหลว',
      });
      setSubCategories([]);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await axios.get('/api/rooms');
      setRooms(res.data || []);
    } catch (err) {
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
      setRooms([]);
    }
  };

  const handleSearch = (value) => {
    const searchVal = value?.toLowerCase() || '';
    const filtered = products.filter(
      (p) =>
        p.name?.toLowerCase().includes(searchVal) ||
        p.categoryId?.name?.toLowerCase().includes(searchVal) ||
        p.subCategoryId?.name?.toLowerCase().includes(searchVal) ||
        p.sku?.toLowerCase().includes(searchVal)
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
      messageApi.open({ type: 'error', content: 'มีบางอย่างผิดพลาด' });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalVisible(true);
    form.setFieldsValue({
      ...product,
      categoryId: product.categoryId?._id || null,
      subCategoryId: product.subCategoryId?._id || null,
      roomId: product.roomId?._id || null,
    });
    if (product.categoryId?._id) {
      fetchSubCategories(product.categoryId._id);
    } else {
      setSubCategories([]);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.patch(`/api/products/${id}`);
      messageApi.open({ type: 'success', content: 'ลบข้อมูลสำเร็จ' });
      fetchProducts();
      setIsDeleteModalVisible(false);
    } catch (error) {
      messageApi.open({ type: 'error', content: 'ลบข้อมูลล้มเหลว' });
    }
  };

  const handleImages = (product) => {
    window.open(`/product/${product._id}`, '_blank');
  };

  const columns = [
    { title: 'ชื่อ', dataIndex: 'name', key: 'name', render: (v) => v || '-' },
    { title: 'SKU', dataIndex: 'sku', key: 'sku', render: (v) => v || '-' },
    {
      title: 'ราคา',
      dataIndex: 'price',
      key: 'price',
      render: (v) => (v != null ? toPrice(v) : '-'),
    },
    {
      title: 'ประเภท',
      dataIndex: ['categoryId', 'name'],
      key: 'categoryId',
      render: (v) => v || '-',
    },
    {
      title: 'ประเภทย่อย',
      dataIndex: ['subCategoryId', 'name'],
      key: 'subCategoryId',
      render: (v) => v || '-',
    },
    {
      title: 'ห้อง',
      dataIndex: ['roomId', 'name'],
      key: 'roomId',
      render: (v) => v || '-',
    },
    {
      title: 'ดำเนินการ',
      key: 'action',
      render: (_, record) => (
        <>
          <Button style={{ marginRight: 8 }} onClick={() => handleImages(record)}>
            ลักษณะ
          </Button>
          <Button style={{ marginRight: 8 }} onClick={() => handleEdit(record)}>
            แก้ไข
          </Button>
          <Button
            danger
            onClick={() => {
              setDeleteCategoryId(record._id);
              setIsDeleteModalVisible(true);
            }}
          >
            ลบ
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="p-4">
      {contextHolder}
      <h2 className="text-2xl font-semibold mb-4">จัดการสินค้า</h2>

      <div className="flex justify-between items-center mb-4">
        <Search
          placeholder="ค้นหา..."
          onSearch={handleSearch}
          className="max-w-md"
          allowClear
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalVisible(true)}
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
        onCancel={() => {
          setModalVisible(false);
          setEditingProduct(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText={editingProduct ? 'บันทึก' : 'เพิ่ม'}
      >
        <Form layout="vertical" form={form} onFinish={handleFormSubmit}>
          <Form.Item name="name" label="ชื่อ" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="sku" label="รหัสสินค้า">
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

          <Form.Item
            name="categoryId"
            label="ประเภท"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="เลือกประเภท"
              onChange={(value) => {
                form.setFieldsValue({ subCategoryId: null });
                fetchSubCategories(value);
              }}
            >
              {categories.length > 0 &&
                categories.map((cat) => (
                  <Option key={cat._id} value={cat._id}>
                    {cat.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subCategoryId"
            label="ประเภทย่อย"
            rules={[{ required: true }]}
          >
            <Select placeholder="เลือกประเภทย่อย">
              {subCategories.length > 0 &&
                subCategories.map((sub) => (
                  <Option key={sub._id} value={sub._id}>
                    {sub.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item name="roomId" label="ห้อง" rules={[{ required: true }]}>
            <Select placeholder="เลือกห้อง">
              {rooms.length > 0 &&
                rooms.map((room) => (
                  <Option key={room._id} value={room._id}>
                    {room.name}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="ยืนยันการลบ"
        open={isDeleteModalVisible}
        onCancel={() => setIsDeleteModalVisible(false)}
        onOk={() => deleteCategory(deleteCategoryId)}
        okText="ลบ"
        okButtonProps={{ danger: true }}
      >
        <p>คุณแน่ใจว่าต้องการลบสินค้านี้หรือไม่?</p>
      </Modal>
    </div>
  );
};

export default Product;
