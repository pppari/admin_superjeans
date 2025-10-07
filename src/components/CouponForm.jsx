// src/components/CouponForm.js
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Switch, Button, Select } from "antd";
import axios from "../lib/axios";
import dayjs from "dayjs";

const CouponForm = ({ visible, onCancel, isEditMode, coupon, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && coupon) {
      form.setFieldsValue({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_amount: coupon.discount_amount,
        minimum_price: coupon.minimum_price,
        valid_from: dayjs(coupon.valid_from),
        valid_to: dayjs(coupon.valid_to),
        isActive: coupon.isActive,
      });
    }
  }, [isEditMode, coupon, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await axios.put(`/api/coupon/${coupon._id}`, values);
      } else {
        await axios.post("/api/coupon/", values);
      }
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditMode ? "Edit Coupon" : "Create Coupon"}
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        form={form}
        onFinish={handleSubmit}
        initialValues={{ isActive: true }}
        layout="vertical"
      >
        <Form.Item label="Coupon Code" name="code" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Discount Type"
          name="discount_type"
          rules={[{ required: true }]}
        >
          <Select>
            <Select.Option value="percentage">Percentage</Select.Option>
            <Select.Option value="fixed">Fixed Amount</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Discount Amount"
          name="discount_amount"
          rules={[{ required: true }]}
        >
          <Input type="number" />
        </Form.Item>
        <Form.Item
          label="Minimum Price"
          name="minimum_price"
          rules={[{ required: true }]}
        >
          <Input type="number" />
        </Form.Item>
        <div className="flex justify-between">
          <Form.Item
            label="Valid From"
            name="valid_from"
            rules={[{ required: true }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
          <Form.Item
            label="Valid To"
            name="valid_to"
            rules={[{ required: true }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>
        </div>
        <Form.Item label="Activation" name="isActive" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditMode ? "Update" : "Create"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CouponForm;
