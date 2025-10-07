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

// Update status colors for the enum values.
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


  // Use a single state for live search filtering.
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    fetchUnits();
  }, []);

  useEffect(() => {
    // Apply only the search filter
    const keyword = searchKeyword.toLowerCase();
    const result = units.filter((u) =>
      u.serialNumber.toLowerCase().includes(keyword) || u.colorId.name.toLowerCase().includes(keyword)
    );
    setFilteredUnits(result);
  }, [units, searchKeyword]);

  // Fetch product units from the API.
  const fetchUnits = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/productUnit');
      setUnits(res.data);
    } catch (err) {
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    } finally {
      setLoading(false);
    }
  };

  // Update search keyword on input change.
  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  // Open the status edit modal.
  const handleEditStatus = (unit) => {
    setCurrentUnit(unit);
    form.setFieldsValue({ status: unit.status });
    setEditModal(true);
  };

  // Submit status update.
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


  // Define table columns.
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
        <Tag color={statusColor[status] || 'default'}>{statusContext(status)}</Tag>
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

      <h2 className="text-2xl font-semibold mb-4">จัดการ Serial Number</h2>

      {/* Search Filter */}
      <div className="mb-4" style={{ maxWidth: 300 }}>
        <Search
          placeholder="ค้นหา Serial"
          allowClear
          onChange={handleSearchChange}
        />
      </div>

      {/* Data Table */}
      <Table
        dataSource={filteredUnits}
        columns={columns}
        rowKey="serialNumber"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal for updating status */}
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
