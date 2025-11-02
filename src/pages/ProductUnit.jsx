import React, { useEffect, useState } from 'react';
import {
  Table,
  Input,
  Select,
  Tag,
  message,
  Modal,
  Form,
  Button,
} from 'antd';
import axios from '../lib/axios';

const { Search } = Input;
const { Option } = Select;

// กำหนดสีตามสถานะ
const statusColor = {
  'in-stock': 'green',
  sold: 'blue',
  returned: 'orange',
  defective: 'red',
};

const ProductUnit = () => {
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    const keyword = searchKeyword.toLowerCase();
<<<<<<< HEAD

    // กรอง + จัดเรียงล่าสุดก่อน
    const result = units
      .filter((u) =>
        u.serialNumber.toLowerCase().includes(keyword) ||
        (u.colorId && u.colorId.name.toLowerCase().includes(keyword))
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // ล่าสุดก่อน

=======
    const result = units.filter((u) =>
      u.serialNumber.toLowerCase().includes(keyword) ||
      (u.colorId && u.colorId.name.toLowerCase().includes(keyword))
    );
>>>>>>> f8c3aaf75f8b3095f106d3021b6916ea2b5c9b43
    setFilteredUnits(result);
  }, [units, searchKeyword]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/productUnit');
<<<<<<< HEAD

      // จัดเรียงล่าสุดก่อน
      const sortedUnits = res.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setUnits(sortedUnits);
=======
      setUnits(res.data);
>>>>>>> f8c3aaf75f8b3095f106d3021b6916ea2b5c9b43
    } catch (err) {
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleEditStatus = (unit) => {
    setCurrentUnit(unit);
    form.setFieldsValue({ status: unit.status });
    setEditModal(true);
  };

  const handleStatusSubmit = async ({ status }) => {
    try {
      await axios.put(`/api/productUnit/status/${currentUnit.serialNumber}`, {
        status,
      });
      messageApi.open({
        type: 'success',
        content: 'แก้ไขสถานะสำเร็จ',
      });
      setEditModal(false);
      fetchUnits();
    } catch (err) {
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    }
  };

  const statusContext = (status) => {
    switch (status) {
      case "in-stock":
        return "พร้อมจำหน่าย";
      case "sold":
        return "ขายแล้ว";
      case "returned":
        return "ตีกลับ";
      case "defective":
        return "มีตำหนิ";
      default:
        return "ไม่ทราบสถานะ";
    }
  };

  const columns = [
    { title: 'รหัส', dataIndex: 'serialNumber', key: 'serialNumber' },
    {
      title: 'สินค้า',
      dataIndex: 'productId',
      key: 'productId',
      render: (product) =>
        product && typeof product === 'object' ? product.name : product,
    },
    {
      title: 'สี',
      dataIndex: 'colorId',
      key: 'colorId',
      render: (color) =>
        color && typeof color === 'object' ? color.name : color,
    },
    {
      title: 'รอบ',
      dataIndex: 'batchId',
      key: 'batchId',
      render: (batch) =>
        batch && typeof batch === 'object' ? batch.batchCode : batch,
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={statusColor[status] || 'default'}>
          {statusContext(status)}
        </Tag>
      ),
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Button onClick={() => handleEditStatus(record)}>แก้ไขสถานะ</Button>
      ),
    },
  ];

  return (
    <div className="p-4">
      {contextHolder}

      <h2 className="text-2xl font-semibold mb-4">จัดการรายการสินค้า</h2>

      <div className="mb-4" style={{ maxWidth: 300 }}>
        <Search
          placeholder="ค้นหารายการสินค้า"
          allowClear
          onChange={handleSearchChange}
        />
      </div>

      <Table
        dataSource={filteredUnits}
        columns={columns}
        rowKey="serialNumber"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="อัปเดตสถานะสินค้า"
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={() => form.submit()}
        okText="บันทึก"
      >
        <Form layout="vertical" form={form} onFinish={handleStatusSubmit}>
          <Form.Item name="status" label="สถานะ" rules={[{ required: true }]}>
            <Select>
              <Option value="in-stock">พร้อมจำหน่าย</Option>
              <Option value="sold">ขายแล้ว</Option>
              <Option value="returned">ตีกลับ</Option>
              <Option value="defective">มีตำหนิ</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductUnit;
