// src/components/CouponTable.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Switch, Pagination, Input, message, Tag } from 'antd';
import Fuse from 'fuse.js';
import axios from '../lib/axios';
import { PlusOutlined } from '@ant-design/icons';
import CouponForm from "../components/CouponForm";
import Confirmation from "../components/DeleteCoupon";

const CouponTable = () => {
  const discountTypeLabels = {
    percentage: 'เปอร์เซ็นต์',
    fixed: 'ลดราคา(บาท)',
  };

  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedCouponIdForDelete, setSelectedCouponIdForDelete] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  // ดึงข้อมูลคูปองจาก backend
  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/coupon');
      const allCoupons = response.data.filter(c => !c.isDeleted);

      // คำนวณสถานะ isActive ตามวันเริ่ม-วันหมดอายุ
      const now = new Date();
      const updatedCoupons = allCoupons.map(c => {
        const validFrom = c.valid_from ? new Date(c.valid_from) : null;
        const validTo = c.valid_to ? new Date(c.valid_to) : null;
        let active = c.isActive;

        if (validFrom && validTo) {
          active = now >= validFrom && now <= validTo;
        } else if (validFrom && !validTo) {
          active = now >= validFrom;
        } else if (!validFrom && validTo) {
          active = now <= validTo;
        }

        return { ...c, isActive: active };
      });

      setCoupons(updatedCoupons);
      setFilteredCoupons(updatedCoupons);
    } catch (error) {
      messageApi.open({ type: 'error', content: 'มีบางอย่างผิดพลาด' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // ฟิลเตอร์และค้นหา
  const applyFilters = (data = coupons) => {
    let filtered = [...data];

    // กรองสถานะ
    if (statusFilter === 'active') filtered = filtered.filter(c => c.isActive);
    else if (statusFilter === 'inactive') filtered = filtered.filter(c => !c.isActive);

    // ค้นหาจากข้อความ
    if (searchText) {
      const fuse = new Fuse(filtered, { keys: ['code', 'discount_type'] });
      filtered = fuse.search(searchText).map(r => r.item);
    }

    setFilteredCoupons(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [statusFilter, searchText, coupons]);

  const handleSearch = (e) => setSearchText(e.target.value);
  const handleStatusFilter = (value) => setStatusFilter(value);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`/api/coupon/${id}`, { isActive: !currentStatus });
      setCoupons(prev => prev.map(c => (c._id === id ? { ...c, isActive: !currentStatus } : c)));
    } catch (error) {
      messageApi.open({ type: 'error', content: 'แก้ไขสถานะล้มเหลว' });
      console.error(error);
    }
  };

  const handleShowModal = (coupon = null) => {
    setIsModalVisible(true);
    setIsEditMode(!!coupon);
    setCurrentCoupon(coupon);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setCurrentCoupon(null);
  };

  const handleShowDeleteConfirmation = (id) => {
    setShowDeleteConfirmation(true);
    setSelectedCouponIdForDelete(id);
  };

  const handleDeleteCoupon = async () => {
    try {
      await axios.delete(`/api/coupon/${selectedCouponIdForDelete}`);
      const updatedCoupons = coupons.filter(c => c._id !== selectedCouponIdForDelete);
      setCoupons(updatedCoupons);
      setShowDeleteConfirmation(false);
      messageApi.open({ type: 'success', content: 'ลบคูปองสำเร็จ' });
    } catch (error) {
      messageApi.open({ type: 'error', content: 'ลบคูปองล้มเหลว' });
      console.error(error);
    }
  };

  return (
    <div>
      {contextHolder}

      <h2 className="text-2xl font-semibold mb-4">จัดการส่วนลด</h2>

      <div className="flex justify-between mb-4">
        <div className="flex gap-4">
          <Input
            placeholder="ค้นหา..."
            value={searchText}
            onChange={handleSearch}
            className="w-48"
          />
          <Select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="w-64"
          >
            <Select.Option value="all">ทั้งหมด</Select.Option>
            <Select.Option value="active">กำลังใช้งาน</Select.Option>
            <Select.Option value="inactive">ไม่ได้ใช้งาน</Select.Option>
          </Select>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleShowModal()}
        >
          เพิ่มคูปอง
        </Button>
      </div>

      <Table
        loading={isLoading}
        dataSource={filteredCoupons.slice(
          (pagination.current - 1) * pagination.pageSize,
          pagination.current * pagination.pageSize
        )}
        rowKey="_id"
        pagination={false}
        columns={[
          { title: 'ชื่อส่วนลด', dataIndex: 'code' },
          {
            title: "ประเภทส่วนลด",
            dataIndex: "discount_type",
            render: (value) => discountTypeLabels[value] || value,
          },
          {
            title: 'มูลค่าส่วนลด',
            render: (_, record) => {
              if (record.discount_type === 'percentage') {
                return <Tag color="blue">{record.discount_amount}%</Tag>;
              } else if (record.discount_type === 'fixed') {
                return <Tag color="green">{record.discount_amount} บาท</Tag>;
              }
              return '-';
            },
          },
          {
            title: 'วันเริ่ม',
            dataIndex: 'valid_from',
            render: (value) => value ? new Date(value).toLocaleDateString('th-TH') : '-',
          },
          {
            title: 'วันหมดอายุ',
            dataIndex: 'valid_to',
            render: (value) => value ? new Date(value).toLocaleDateString('th-TH') : 'ไม่มีกำหนด',
          },
          {
            title: 'สถานะ',
            render: (_, record) => (
              <Switch
                checked={record.isActive}
                onChange={() => handleToggleActive(record._id, record.isActive)}
              />
            ),
          },
          {
            title: 'การจัดการ',
            render: (_, record) => (
              <div className="flex space-x-2">
                <Button onClick={() => handleShowModal(record)}>แก้ไข</Button>
                <Button danger onClick={() => handleShowDeleteConfirmation(record._id)}>ลบ</Button>
              </div>
            ),
          },
        ]}
      />

      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={filteredCoupons.length}
        onChange={(page, pageSize) => setPagination({ current: page, pageSize })}
        style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}
      />

      <CouponForm
        open={isModalVisible}
        onCancel={handleCloseModal}
        isEditMode={isEditMode}
        coupon={currentCoupon}
        onSuccess={() => {
          setIsModalVisible(false);
          setCurrentCoupon(null);
          fetchCoupons();
        }}
      />

      <Confirmation
        open={showDeleteConfirmation}
        onConfirm={handleDeleteCoupon}
        onCancel={() => setShowDeleteConfirmation(false)}
      />
    </div>
  );
};

export default CouponTable;
