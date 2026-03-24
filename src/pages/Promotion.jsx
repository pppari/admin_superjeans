import React, { useEffect, useState } from "react";
import { Card, Spin, Image, Empty } from "antd";
import axios from "../lib/axios";

/* ===============================
    Auto Color Mapping
=============================== */
const COLOR_NAME_MAP = {
  black: "#000000",
  white: "#ffffff",
  red: "#ff0000",
  blue: "#0000ff",
  green: "#008000",
  yellow: "#ffff00",
  brown: "#8b4513",
  gray: "#808080",
  grey: "#808080",

  darkgray: "#a9a9a9",
  darkgrey: "#a9a9a9",
  lightgray: "#d3d3d3",

  navy: "#001f3f",
  denim: "#1f3a5f",
  charcoal: "#36454f",
  beige: "#f5f5dc",
  cream: "#fffdd0",
  khaki: "#c3b091",
  olive: "#808000",

  oak: "#c19a6b",
  walnut: "#773f1a",
  teak: "#b5651d",
};

/* ===============================
    Get color from name / hex
=============================== */
const getColorFromName = (name = "") => {
  if (!name) return "#ccc";

  const key = name.toLowerCase().replace(/\s/g, "");

  // สีที่รู้จัก
  if (COLOR_NAME_MAP[key]) {
    return COLOR_NAME_MAP[key];
  }

  // hex color
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(name)) {
    return name;
  }

  // สีอื่น
  return "#bdbdbd";
};

const ProductListWithColors = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===============================
      Fetch Products
  =============================== */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/products/with-colors");
        setProducts(res.data || []);
      } catch (error) {
        console.error("โหลดสินค้าไม่สำเร็จ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  /* ===============================
      Loading / Empty
  =============================== */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  const productsWithColors = products.filter(
    (product) =>
      Array.isArray(product.colors) && product.colors.length > 0
  );

  if (!productsWithColors.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Empty description="ไม่พบสินค้าที่มีสี" />
      </div>
    );
  }

  /* ===============================
      Render
  =============================== */
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {productsWithColors.map((product) => {
        const coverImage =
          product.colors?.[0]?.main_img || "/no-image.png";

        return (
          <Card
            key={product._id}
            hoverable
            cover={
              <Image
                src={coverImage}
                alt={product.name}
                height={200}
                style={{ objectFit: "cover" }}
                preview={false}
              />
            }
          >
            <h3 className="text-lg font-semibold mb-1">
              {product.name}
            </h3>

            <p className="text-gray-500 mb-3">
              ราคา {product.price?.toLocaleString()} บาท
            </p>

            {/* สีสินค้า */}
            <div className="flex flex-wrap gap-3">
              {product.colors.map((color) => {
                const colorKey = color.name
                  ?.toLowerCase()
                  .replace(/\s/g, "");

                const isKnownColor =
                  !!COLOR_NAME_MAP[colorKey];

                return (
                  <div
                    key={color._id}
                    className="flex flex-col items-center text-xs"
                  >
                    <div
                      className="w-5 h-5 rounded-full border"
                      style={{
                        backgroundColor: getColorFromName(
                          color.color_code || color.name
                        ),
                      }}
                    />
                    <span>
                      {isKnownColor ? color.name : "อื่น"}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default ProductListWithColors;
