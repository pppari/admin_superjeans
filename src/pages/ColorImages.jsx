import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Upload,
  message,
  Popconfirm,
  Card,
  Image,
  Spin,
  Checkbox,
  Modal,
  Alert,
} from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import axios from "../lib/axios";
import baseUrl from "../lib/baseUrl";
import { colorImgs } from "../lib/imagePath";

const ColorImages = () => {
  const { productId, colorId } = useParams();
  const [data, setData] = useState(null);
  const [color, setColor] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [allSelected, setAllSelected] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchData = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/products/${productId}`);
      setData(data);
    } catch (error) {
      console.error(error);
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    }
  }, [productId]);

  const fetchProduct = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/productColor/getById/${colorId}`);
      setColor(data);
    } catch (error) {
      console.error(error);
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    }
  }, [colorId]);

  const fetchImages = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/productColorImg/${colorId}`);
      setImages(data);
      setSelectedImages([]); // reset selection on fetch
    } catch (error) {
      console.error(error);
      messageApi.open({
        type: 'error',
        content: 'มีบางอย่างผิดพลาด',
      });
    }
  }, [colorId]);

  useEffect(() => {
    if (!colorId) return;
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProduct(), fetchImages(), fetchData()]);
      setLoading(false);
    };
    init();
  }, [productId, colorId, fetchProduct, fetchImages]);

  const handleUpload = async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });
    setUploading(true);

    try {
      await axios.post(`/api/productColorImg/${productId}/${colorId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      messageApi.open({
        type: 'success',
        content: 'สร้างข้อมูลสำเร็จ',
      });

      await fetchImages();
    } catch (error) {
      console.error(error);
      messageApi.open({
        type: 'error',
        content: 'สร้างข้อมูลล้มเหลว',
      });

      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    try {
      await axios.delete(`/api/productColorImg/${productId}/${colorId}/${imageId}`);
      messageApi.open({
        type: 'success',
        content: 'ลบข้อมูลสำเร็จ',
      });

      await fetchImages();
    } catch (error) {
      console.error(error);
      messageApi.open({
        type: 'error',
        content: 'ลบข้อมูลล้มเหลว',
      });

    }
  };

  const handleDeleteSelected = async () => {
    try {
      await axios.post(`/api/productColorImg/${productId}/${colorId}/batch-delete`, {
        ids: selectedImages,
      });
      messageApi.open({
        type: 'success',
        content: 'ลบข้อมูลสำเร็จ',
      });

      await fetchImages();
      setDeleteModal(false);
    } catch (error) {
      console.error(error);
      messageApi.open({
        type: 'error',
        content: 'ลบข้อมูลล้มเหลว',
      });

    }
  };
  const toggleSelectAll = () => {
    if (selectedImages.length === images.length) {
      // Unselect all
      setSelectedImages([]);
    } else {
      // Select all
      const allIds = images.map((img) => img._id);
      setSelectedImages(allIds);
    }
  };
  const toggleSelect = (id) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (loading) {
    return <Spin size="large" className="mt-16 w-full flex justify-center" />;
  }

  return (
    <div className="space-y-8">
      {contextHolder}
      <h1 className="text-xl font-bold">จัดการรูปภาพ</h1>

      {color && (
        <Card title={data?.name} className="shadow-md">
          <p className="font-semibold text-base">
            สี {color?.name}
          </p>
        </Card>
      )}

      <div className="flex items-center justify-between my-8">
        <Upload
          multiple
          customRequest={({ file, onSuccess, onError }) => {
            handleUpload([file])
              .then(() => onSuccess && onSuccess("ok"))
              .catch(onError);
          }}
          showUploadList={false}
          disabled={uploading}
        >
          <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
            {uploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปภาพ"}
          </Button>
        </Upload>

        <div className="flex items-center gap-4">
          <Button onClick={toggleSelectAll} disabled={!images.length}>
            {allSelected ? "ยกเลิกทั้งหมด" : "เลือกทั้งหมด"}
          </Button>

          <Button
            type="primary"
            danger
            disabled={!selectedImages.length}
            onClick={() => setDeleteModal(true)}
          >
            ลบ ({selectedImages.length})
          </Button>
        </div>
      </div>

      {images.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {images.map(({ _id, fileName }) => (
            <div className="relative group" key={_id}>
              <Checkbox
                checked={selectedImages.includes(_id)}
                onChange={() => toggleSelect(_id)}
                className="absolute top-2 left-2 z-10 bg-white bg-opacity-70 p-0"
              />
              <Image
                src={colorImgs(productId, colorId, fileName)}
                alt={fileName}
                className="w-full h-auto rounded-lg transition-transform transform group-hover:scale-105 shadow-lg"
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Popconfirm
                  title="คุณแน่ใจว่าต้องการลบภาพนี้หรือไม่?"
                  onConfirm={() => handleDelete(_id)}
                  okText="ใช่"
                  cancelText="ไม่"
                >
                  <Button type="primary" icon={<DeleteOutlined />} danger />
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Alert
          message="คำเตือน"
          description="ยังไม่มีรูปภาพที่อัพโหลด กรุณาอัพโหลดรูปภาพเพื่อเริ่มต้น"
          type="warning"
          showIcon
        />
      )}

      <Modal
        open={deleteModal}
        onCancel={() => setDeleteModal(false)}
        footer={null}
      >
        <p>คุณแน่ใจว่าต้องการลบรูปภาพที่เลือกหรือไม่?</p>
        <div className="flex justify-end mt-4">
          <Button onClick={() => setDeleteModal(false)} className="mr-2">
            ไม่ใช่
          </Button>
          <Button type="primary" danger onClick={handleDeleteSelected}>
            ใช่
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ColorImages;
