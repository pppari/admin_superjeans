import React, { useEffect, useState, useMemo } from 'react';
import axios from '../lib/axios';
import { Table, Button, Popconfirm, message, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
const { Search } = Input;

const ProductBatch = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  // ดึงล็อตสินค้าทั้งหมด
  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/product-batches');
      setBatches(res.data);
    } catch (error) {
      messageApi.open({ type: 'error', content: 'มีบางอย่างผิดพลาด' });
    } finally {
      setLoading(false);
    }
  };

  // ลบล็อตสินค้า
  const deleteBatch = async (id) => {
    try {
      await axios.patch(`/api/product-batches/${id}/delete`);
      messageApi.open({ type: 'success', content: 'ลบข้อมูลสำเร็จ' });
      fetchBatches();
    } catch {
      messageApi.open({ type: 'error', content: 'ลบข้อมูลล้มเหลว' });
    }
  };

  // สร้างล็อตสินค้าใหม่ → หน้า create
  const handleCreateBatch = () => {
    navigate('/batch/create'); // batchCode จะ gen อัตโนมัติใน backend
  };

  const columns = [
    { title: 'รหัสล็อต', dataIndex: 'batchCode' },
    { title: 'จำนวนรายการทั้งหมด', dataIndex: 'totalProducts', render: text => parseFloat(text).toLocaleString() },
    { title: 'จำนวนสินค้าทั้งหมด', dataIndex: 'totalQuantity', render: text => parseFloat(text).toLocaleString() },
    {
      title: 'ดำเนินการ',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button type='primary' onClick={() => window.open(`/batch/${record._id}/print`, '_blank')}>รายละเอียด</Button>
          <Button onClick={() => navigate(`/batch/${record._id}`)}>แก้ไข</Button>
          <Popconfirm title="ต้องการลบล็อตสินค้านี้หรือไม่?" onConfirm={() => deleteBatch(record._id)}>
            <Button danger>ลบ</Button>
          </Popconfirm>
        </div>
      )
    }
  ];

  // กรองและเรียงล็อตล่าสุดขึ้นบนสุด
  const filteredBatches = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return batches
      .filter(batch =>
        batch.batchCode?.toLowerCase().includes(term) ||
        batch.batchName?.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt); // ล่าสุดขึ้นก่อน
        }
        // ถ้าไม่มี createdAt ใช้ _id ของ MongoDB
        return parseInt(b._id.substring(0, 8), 16) - parseInt(a._id.substring(0, 8), 16);
      });
  }, [batches, searchTerm]);

  useEffect(() => { fetchBatches(); }, []);

  return (
    <div className="p-6">
      {contextHolder}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">จัดการล็อตสินค้า</h1>
        <div className="flex gap-2">
          <Search
            placeholder="ค้นหาด้วยรหัสล็อตหรือชื่อล็อต"
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            style={{ width: 300 }}
          />
          <Button type="primary" onClick={handleCreateBatch}>สร้างล็อตสินค้า</Button>
        </div>
      </div>
      <Table dataSource={filteredBatches} columns={columns} rowKey="_id" loading={loading} bordered />
    </div>
  );
};

export default ProductBatch;
