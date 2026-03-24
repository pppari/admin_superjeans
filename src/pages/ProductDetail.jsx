import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Spin, Image, Tag, Button } from "antd";
import axios from "../lib/axios";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data);

        // ตั้งรูปหลักเริ่มต้น
        setActiveImage(
          res.data?.colors?.[0]?.main_img || "/no-image.png"
        );
      } catch (err) {
        console.error("โหลดสินค้าไม่สำเร็จ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /* ===============================
      Loading
  =============================== */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return <p className="text-center">ไม่พบสินค้า</p>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* ปุ่มย้อนกลับ */}
      <Button onClick={() => navigate(-1)}>← กลับ</Button>

      <Card>
        {/* รูปหลัก */}
        <Image
          src={activeImage}
          width="100%"
          height={400}
          style={{ objectFit: "cover" }}
        />

        <div className="mt-4">
          {/* หมวดหมู่ */}
          <Tag color="blue">
            {product.category?.name || "ไม่ระบุหมวดหมู่"}
          </Tag>

          {/* ชื่อสินค้า */}
          <h1 className="text-2xl font-bold mt-2">
            {product.name}
          </h1>

          {/* ราคา */}
          <p className="text-lg text-green-600 mt-2">
            ราคา {product.price?.toLocaleString()} บาท
          </p>

          {/* รายละเอียด */}
          <p className="mt-4 text-gray-600">
            {product.description || "ไม่มีรายละเอียดสินค้า"}
          </p>

          {/* สีสินค้า */}
          {product.colors?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">สีสินค้า</h3>
              <div className="flex gap-4">
                {product.colors.map((color) => (
                  <div
                    key={color._id}
                    className="text-center cursor-pointer"
                    onClick={() =>
                      setActiveImage(
                        color.main_img || activeImage
                      )
                    }
                  >
                    <Image
                      src={color.main_img}
                      width={80}
                      height={80}
                      preview={false}
                      style={{ objectFit: "cover" }}
                    />
                    <p className="text-sm mt-1">{color.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProductDetail;
