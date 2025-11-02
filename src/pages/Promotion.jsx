import React, { useEffect, useState } from 'react';
import { Upload, Button, message, Modal, Spin, Empty, Image, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, StarOutlined } from '@ant-design/icons';
import axios from '../lib/axios';
import clsx from 'clsx';
import { promoImg } from '../lib/imagePath';

const PromotionImagePanel = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ visible: false, image: null });
  const [messageApi, contextHolder] = message.useMessage();

  // 🔸 ดึงรูปทั้งหมดจาก backend
  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/promotion-images');
      console.log('📸 รูปที่ได้จาก backend:', res.data);
      setImages(res.data?.data || []);
    } catch (err) {
      message.error('ไม่สามารถดึงข้อมูลรูปภาพได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // 🔸 อัปโหลดรูป
  const handleUpload = async ({ file }) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const res = await axios.post('/api/promotion-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.data) {
        setImages(prev => [res.data.data, ...prev]);
        messageApi.success('อัปโหลดสำเร็จ');
      } else {
        throw new Error('ไม่มีข้อมูลตอบกลับ');
      }
    } catch (err) {
      messageApi.error('อัปโหลดไม่สำเร็จ');
    } finally {
      setUploading(false);
    }
  };

  // 🔸 ฟังก์ชันตั้งภาพหลัก
  const handleSetMain = async (id) => {
    try {
      await axios.put(`/api/promotion-images/${id}/set-main`);
      messageApi.success('ตั้งเป็นภาพหลักสำเร็จ');
      fetchImages();
    } catch (err) {
      messageApi.error('ไม่สามารถตั้งภาพหลักได้');
    }
  };

  // 🔸 ฟังก์ชันลบรูป
  const handleDelete = async () => {
    if (!deleteModal.image) return;
    try {
      await axios.delete(`/api/promotion-images/${deleteModal.image._id}`);
      setImages(prev => prev.filter(img => img._id !== deleteModal.image._id));
      messageApi.success('ลบรูปภาพสำเร็จ');
      setDeleteModal({ visible: false, image: null });
    } catch (err) {
      messageApi.error('ลบรูปภาพไม่สำเร็จ');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {contextHolder}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">จัดการรูปภาพแนะนำร้าน</h2>

        <Upload
          customRequest={handleUpload}
          showUploadList={false}
          accept="image/*"
        >
          <Button
            icon={<PlusOutlined />}
            loading={uploading}
            type="primary"
          >
            อัปโหลดรูปภาพ
          </Button>
        </Upload>
      </div>

      {/* โหลดข้อมูล */}
      {loading ? (
        <div className="flex justify-center mt-10">
          {/* ✅ ใช้ nested pattern ของ Spin เพื่อไม่ให้ warning */}
          <Spin tip="กำลังโหลด...">
            <div style={{ minHeight: 120 }} />
          </Spin>
        </div>
      ) : images.length === 0 ? (
        <Empty description="ไม่พบรูปภาพ" className="mt-10" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {images.map((img) => {
            const url = promoImg(img.filename);
            console.log('🖼️ โหลดรูป:', url);
            return (
              <div
                key={img._id}
                className="relative rounded-2xl overflow-hidden shadow-md group"
              >
                {/* ✅ ถ้าเป็นภาพหลัก ให้ขึ้นป้าย */}
                {img.isMain && (
                  <div className="absolute top-2 left-2 z-10">
                    <Tag color="orange">ภาพหลัก</Tag>
                  </div>
                )}

                <Image
                  src={url}
                  alt={img.filename}
                  className="w-full h-48 object-cover"
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/AzWAiYGBgYGJgYGBQYABBgAGPwLPb1sAAAAASUVORK5CYII="
                />

                {/* ปุ่มแอ็กชัน */}
                <div
                  className={clsx(
                    'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2'
                  )}
                >
                  {/* 🔹 ปุ่มตั้งภาพหลัก */}
                  <Button
                    shape="circle"
                    type={img.isMain ? 'primary' : 'default'}
                    icon={<StarOutlined />}
                    onClick={() => handleSetMain(img._id)}
                    title="ตั้งเป็นภาพหลัก"
                  />
                  {/* 🔹 ปุ่มลบ */}
                  <Button
                    shape="circle"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setDeleteModal({ visible: true, image: img })}
                    title="ลบรูปภาพ"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* โมดัลยืนยันลบ */}
      <Modal
        title="ยืนยันการลบรูปภาพ"
        open={deleteModal.visible}
        onOk={handleDelete}
        onCancel={() => setDeleteModal({ visible: false, image: null })}
        okText="ลบรูปภาพ"
        cancelText="ยกเลิก"
        okButtonProps={{ danger: true }}
      >
        <div className="space-y-4">
          <p>คุณแน่ใจหรือไม่ที่จะลบรูปภาพนี้?</p>
          {deleteModal.image && (
            <div className="flex justify-center">
              <Image
                src={promoImg(deleteModal.image.filename)}
                alt="Preview"
                className="max-h-[200px] object-contain"
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PromotionImagePanel;
