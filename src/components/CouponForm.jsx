import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, Switch, Button, Select, message } from "antd";
import axios from "../lib/axios";
import dayjs from "dayjs";

const CouponForm = ({ open, onCancel, isEditMode, coupon, onSuccess }) => {
  // ✅ ป้องกัน overlay ค้าง
  if (!open) return null;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // โหลดข้อมูลตอนแก้ไข
  useEffect(() => {
    if (isEditMode && coupon) {
      form.setFieldsValue({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_amount: coupon.discount_amount,
        minimum_price: coupon.minimum_price,
        valid_from: coupon.valid_from ? dayjs(coupon.valid_from) : null,
        valid_to: coupon.valid_to ? dayjs(coupon.valid_to) : null,
        isActive: coupon.isActive,
      });
    } else {
      form.resetFields();
    }
  }, [isEditMode, coupon, form]);

  // submit ฟอร์ม
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        valid_from: values.valid_from.toISOString(),
        valid_to: values.valid_to.toISOString(),
      };

      if (isEditMode) {
        await axios.put(`/api/coupon/${coupon._id}`, payload);
        message.success("แก้ไขส่วนลดสำเร็จ");
      } else {
        await axios.post("/api/coupon", payload);
        message.success("สร้างส่วนลดสำเร็จ");
      }

      onSuccess();
      onCancel();
    } catch (error) {
      console.error(error);
      message.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEditMode ? "แก้ไขส่วนลด" : "สร้างส่วนลดง"}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      centered
      zIndex={1000}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ isActive: true }}
      >
        {/* รหัสคูปอง */}
        <Form.Item
          label="รหัสส่วนลด"
          name="code"
          rules={[{ required: true, message: "กรุณากรอกรหัสส่วนลด" }]}
        >
          <Input placeholder="เช่น SALE2026" />
        </Form.Item>

        {/* ประเภทส่วนลด */}
        <Form.Item
          label="ประเภทส่วนลด"
          name="discount_type"
          rules={[{ required: true, message: "กรุณาเลือกประเภทส่วนลด" }]}
        >
          <Select placeholder="เลือกประเภทส่วนลด">
            <Select.Option value="percentage">เปอร์เซ็นต์ (%)</Select.Option>
            <Select.Option value="fixed">จำนวนเงิน (บาท)</Select.Option>
          </Select>
        </Form.Item>

        {/* จำนวนส่วนลด */}
        <Form.Item
          label="ส่วนลด"
          name="discount_amount"
          rules={[
            { required: true, message: "กรุณากรอกจำนวนส่วนลด" },
          ]}
        >
          <Input type="number" min={1} />
        </Form.Item>

        {/* ราคาขั้นต่ำ */}
        <Form.Item
          label="ราคาขั้นต่ำ"
          name="minimum_price"
          rules={[
            { required: true, message: "กรุณากรอกราคาขั้นต่ำ" },
          ]}
        >
          <Input type="number" min={0} />
        </Form.Item>

        {/* วันที่ใช้งาน */}
        <div className="flex gap-4">
          <Form.Item
            label="เริ่มใช้งาน"
            name="valid_from"
            rules={[{ required: true, message: "กรุณาเลือกวันที่เริ่มใช้งาน" }]}
            className="flex-1"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="สิ้นสุดการใช้งาน"
            name="valid_to"
            rules={[{ required: true, message: "กรุณาเลือกวันที่สิ้นสุด" }]}
            className="flex-1"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </div>

        {/* สถานะ */}
        <Form.Item
          label="เปิดใช้งาน"
          name="isActive"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        {/* ปุ่ม */}
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>ยกเลิก</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEditMode ? "บันทึกการแก้ไข" : "สร้างคูปอง"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CouponForm;
