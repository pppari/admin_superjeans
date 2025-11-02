// src/components/DeleteCoupon.js
import React from 'react';
import { Modal } from 'antd';

const DeleteCoupon = ({ visible, onConfirm, onCancel }) => {
  return (
    <Modal
      title="Delete Coupon"
      visible={visible}
      onOk={onConfirm}
      onCancel={onCancel}
      okText="Delete"
      cancelText="Cancel"
      confirmLoading={false}
    >
      <p>Are you sure you want to delete this coupon?</p>
    </Modal>
  );
};

export default DeleteCoupon;
