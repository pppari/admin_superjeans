// src/components/CouponTable.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Select, Switch, Pagination, Modal, Input, message } from 'antd';
import Fuse from 'fuse.js';
import axios from '../lib/axios';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import CouponForm from '../components/CouponForm';
import Confirmation from '../components/DeleteCoupon';

const CouponTable = () => {
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

  const fetchCoupons = async () => {
    try {
      const response = await axios.get('/api/coupon');
      setCoupons(response.data);
      setFilteredCoupons(response.data);
      setIsLoading(false);
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
      console.error(error);
    }
  };

  // Fetch coupons
  useEffect(() => {

    fetchCoupons();
  }, []);

  // Search filter with Fuse.js
  const handleSearch = (e) => {
    const { value } = e.target;
    setSearchText(value);

    const fuse = new Fuse(coupons, {
      keys: ['code', 'discount_type'], // คีย์ที่ต้องการให้ Fuse ค้นหา
    });

    const result = fuse.search(value).map((result) => result.item);
    setFilteredCoupons(result);
  };

  // Filter by status (Active/Inactive)
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    let filtered = coupons;

    if (value === 'active') {
      filtered = coupons.filter((coupon) => coupon.isActive);
    } else if (value === 'inactive') {
      filtered = coupons.filter((coupon) => !coupon.isActive);
    }

    setFilteredCoupons(filtered);
  };

  // Toggle isActive
  const handleToggleActive = async (id, isActive) => {
    try {
      await axios.put(`/api/coupon/${id}`, { isActive: !isActive });
      fetchCoupons()
      messageApi.open({
        type: 'success',
        content: 'แก้ไขข้อมูลสำเร็จ',
      });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'แก้ไขข้อมูลล้มเหลว',
      });

      console.error('Error updating status:', error);
    }
  };

  // Show modal for Create/Edit
  const handleShowModal = (coupon = null) => {
    setIsModalVisible(true);
    setIsEditMode(!!coupon);
    setCurrentCoupon(coupon);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setCurrentCoupon(null);
  };

  // Show Delete Confirmation
  const handleShowDeleteConfirmation = (id) => {
    setShowDeleteConfirmation(true);
    setSelectedCouponIdForDelete(id);
  };

  // Delete Coupon
  const handleDeleteCoupon = async () => {
    try {
      await axios.delete(`/api/coupon/${selectedCouponIdForDelete}`);
      setCoupons(coupons.filter((coupon) => coupon._id !== selectedCouponIdForDelete));
      setShowDeleteConfirmation(false);
      messageApi.open({
        type: 'success',
        content: 'ลบข้อมูลสำเร็จ',
      });
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'ลบข้อมูลล้มเหลว',
      });

      console.error('Error deleting coupon:', error);
    }
  };

  return (
    <div>
      {contextHolder}
      <div className="flex justify-between mb-4">
        <div className="flex gap-4">
          <Input
            placeholder="Search..."
            value={searchText}
            onChange={handleSearch}
            className="w-48"
          />
          <Select
            value={statusFilter}
            onChange={handleStatusFilter}
          >
            <Select.Option value="all">All</Select.Option>
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => handleShowModal()}
        >
          Create Coupon
        </Button>
      </div>

      <Table
        loading={isLoading}
        dataSource={filteredCoupons}
        rowKey="_id"
        pagination={false}
        columns={[
          { title: 'Code', dataIndex: 'code' },
          { title: 'Discount Type', dataIndex: 'discount_type' },
          { title: 'Discount Amount', dataIndex: 'discount_amount' },
          {
            title: 'Status',
            render: (_, record) => (
              <Switch
                checked={record.isActive}
                onChange={() => handleToggleActive(record._id, record.isActive)}
              />
            ),
          },
          {
            title: 'Actions',
            render: (_, record) => (
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleShowModal(record)}
                >แก้ไข</Button>
                <Button
                  danger
                  onClick={() => handleShowDeleteConfirmation(record._id)}
                >ลบ</Button>
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
        className="mt-4"
      />

      {/* Modal for Create/Edit */}
      <CouponForm
        visible={isModalVisible}
        onCancel={handleCloseModal}
        isEditMode={isEditMode}
        coupon={currentCoupon}
        onSuccess={() => {
          setIsModalVisible(false);
          setCurrentCoupon(null);
          fetchCoupons()
        }}
      />

      {/* Delete Confirmation */}
      <Confirmation
        visible={showDeleteConfirmation}
        onConfirm={handleDeleteCoupon}
        onCancel={() => setShowDeleteConfirmation(false)}
      />
    </div>
  );
};

export default CouponTable;
