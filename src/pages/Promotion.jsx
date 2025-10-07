import React, { useEffect, useState } from 'react';
import { Upload, Button, message, Modal, Spin, Empty, Image } from 'antd';
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from '../lib/axios';
import clsx from 'clsx';
import { promoImg } from '../lib/imagePath';

const { confirm } = Modal;

const PromotionImagePanel = () => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ visible: false, image: null });
  const [messageApi, contextHolder] = message.useMessage();


  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/promotion-images');
      setImages(res.data?.data || []); // Handle potential undefined response data
    } catch (err) {
      message.error('ไม่สามารถดึงข้อมูลรูปภาพได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

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
        messageApi.open({
          type: 'success',
          content: 'อัพโหลดสำเร็จ',
        });

      } else {
        throw new Error('ไม่มีข้อมูลตอบกลับ');
      }
    } catch (err) {
      messageApi.open({
        type: 'error',
        content: 'อัพโหลดไม่สำเร็จ',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.image) return;

    try {
      await axios.delete(`/api/promotion-images/${deleteModal.image._id}`);
      setImages(prev => prev.filter(img => img._id !== deleteModal.image._id));
      messageApi.open({
        type: 'success',
        content: 'ลบรูปภาพสำเร็จ',
      });
      setDeleteModal({ visible: false, image: null });
    } catch (err) {
      messageApi.open({
        type: 'error',
        content: 'ลบรูปภาพไม่สำเร็จ',
      });
    }
  };

  const showDeleteModal = (image) => {
    setDeleteModal({ visible: true, image });
  };

  return (
    <div className="p-6 space-y-6">
      {contextHolder}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">รูปภาพโปรโมชั่น</h2>

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
            อัพโหลดรูปภาพ
          </Button>
        </Upload>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
          <Spin tip="กำลังโหลด..." />
        </div>
      ) : images.length === 0 ? (
        <Empty
          description="ไม่พบรูปภาพ"
          className="mt-10"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {images.map((img) => (
            <div
              key={img._id}
              className="relative rounded-2xl overflow-hidden shadow-md group"
            >
              <Image
                src={promoImg(img.filename)}
                alt=""
                className="w-full h-48 object-cover"
              />

              <div
                className={clsx(
                  'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
                )}
              >
                <Button
                  shape="circle"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => showDeleteModal(img)}
                  title="ลบรูปภาพ"
                />
              </div>
            </div>
          ))}
        </div>
      )}

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
