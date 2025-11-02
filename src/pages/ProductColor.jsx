import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  message,
  Form,
  Modal,
  Upload,
  Input,
  Image,
  InputNumber,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "../lib/axios";
import { colorImg } from "../lib/imagePath";

const ProductColorPage = () => {
  const { productId } = useParams();
  const history = useNavigate();

  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(null);
  const [form] = Form.useForm();

  const [modalVisible, setModalVisible] = useState(false);
  const [currentColor, setCurrentColor] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();


  useEffect(() => {
    fetchProductColors();
    fetchProducts();
  }, [productId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/products/" + productId);
      setProducts(res.data);
    } catch (err) {
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductColors = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/productColor/${productId}`);
      setColors(res.data);
    } catch (err) {
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    form.resetFields();
    setImageFile(null);
    setImagePreview(null);
    setCurrentColor(null);
    setIsEditing(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    form.resetFields();
    setModalVisible(false);
    setCurrentColor(null);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      message.error("โปรดอัปโหลดไฟล์รูปภาพเท่านั้น!");
      return;
    }
    if (file.size / 1024 / 1024 >= 5) {
      message.error("รูปภาพต้องมีขนาดไม่เกิน 5MB!");
      return;
    }
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleEdit = (color) => {
    form.setFieldsValue({ name: color.name, quantity: color.quantity, color_code: color.color_code });
    setCurrentColor(color);
    setIsEditing(true);
    setImageFile(null);
    if (color.main_img) {
      setImagePreview(colorImg(color.productId, color.main_img));
    } else {
      setImagePreview(null);
    }
    setModalVisible(true);
  };

  const handleSubmit = async (values) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("color_code", values.color_code);

    if (isEditing) {
      formData.append("quantity", values.quantity);
    }
    if (imageFile) {
      formData.append("image", imageFile);
    }

    setUploadLoading(true);

    try {
      if (isEditing && currentColor) {
        await axios.put(
          `/api/productColor/${productId}/${currentColor._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        messageApi.open({
          type: 'success',
          content: 'แก้ไขห้องสำเร็จ',
        });
      } else {
        await axios.post(`/api/productColor/${productId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        messageApi.open({
          type: 'success',
          content: 'สร้างห้องสำเร็จ',
        });

      }
      fetchProductColors();
      closeModal();
    } catch (error) {
      message.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      console.error(error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await axios.patch(`/api/productColor/${deleteTargetId}`);
      messageApi.open({
        type: 'success',
        content: 'ลบสีสำเร็จ',
      });

      fetchProductColors();
    } catch (error) {
      messageApi.open({
        type: 'error',
        content: 'ลบข้อมูลล้มเหลว',
      });

      console.error("Error deleting room:", error);
    } finally {
      setDeleteConfirmVisible(false);
      setDeleteTargetId(null);
    }
  };

  const columns = [
    {
      title: "รูปภาพ",
      dataIndex: "main_img",
      key: "main_img",
      render: (img) =>
        img ? (
          <Image
            src={colorImg(productId, img)}
            alt="color"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
        ) : (
          "-"
        ),
    },
    { title: "สี", dataIndex: "name", key: "name" },
    { title: "รหัส", dataIndex: "color_code", key: "color_code" },
    { title: "จำนวน", dataIndex: "quantity", key: "quantity" },
    {
      title: "ดำเนินการ",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            onClick={() =>
              history(`/product/${productId}/color/${record._id}/images`)
            }
          >
            จัดการภาพ
          </Button>
          <Button onClick={() => handleEdit(record)}>แก้ไข</Button>
          <Button
            onClick={() => {
              setDeleteTargetId(record._id);
              setDeleteConfirmVisible(true);
            }}
          >
            ลบ
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      {contextHolder}
      <h2 className="text-2xl font-semibold mb-2">จัดการลักษณะสินค้า</h2>
      <h3 className="text-xl font-normal mb-4">{products?.name}</h3>
      <Button type="primary" className="mb-4" onClick={openCreateModal}>
        สร้าง
      </Button>
      <Table
        dataSource={colors}
        columns={columns}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      <Modal
        title={isEditing ? "แก้ไข" : "เพิ่ม"}
        open={modalVisible}
        onCancel={closeModal}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="ชื่อ"
            rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="color_code"
            label="รหัสสี"
            rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
          >
            <Input placeholder="เช่น WHT ย่อมาจาก White" />
          </Form.Item>

          {isEditing ? (
            <Form.Item
              name="quantity"
              label="จำนวน"
              rules={[{ required: true, message: "กรุณากรอกจำนวน" }]}
            >
              <InputNumber />
            </Form.Item>
          ) : null}

          <Form.Item label="รูปภาพ">
            {imagePreview && (
              <div className="mb-2">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: 200,
                    objectFit: "cover",
                  }}
                />
                <Button
                  danger
                  size="small"
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  ลบรูปภาพ
                </Button>
              </div>
            )}
            <Upload
              name="image"
              showUploadList={false}
              customRequest={({ file, onSuccess, onError }) => {
                try {
                  handleImageChange(file);
                  onSuccess("ok");
                } catch (err) {
                  onError(err);
                }
              }}
            >
              <Button icon={<UploadOutlined />}>อัปโหลดรูปภาพ</Button>
            </Upload>
            <div style={{ marginTop: 8, color: "#888" }}>
              รองรับไฟล์ภาพขนาดไม่เกิน 5MB
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={uploadLoading}
              disabled={uploadLoading}
            >
              {isEditing ? "อัปเดต" : "สร้าง"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="ยืนยันการลบ"
        open={deleteConfirmVisible}
        onCancel={() => setDeleteConfirmVisible(false)}
        onOk={handleDelete}
        okText="ลบ"
        okButtonProps={{ danger: true }}
        cancelText="ยกเลิก"
      >
        <p>คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?</p>
      </Modal>
    </div>
  );
};

export default ProductColorPage;
