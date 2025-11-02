import { Button, Form, Input, Select, InputNumber, Space, Divider, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../lib/axios';

const { Option } = Select;

const ProductBatchForm = ({ initialValues = {} }) => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]); // เริ่มต้นเป็น array
  const [category, setCategory] = useState([]); // เริ่มต้นเป็น array
  const [productColors, setProductColors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();

  // --------------------------
  // Fetch functions
  // --------------------------
  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    }
  };

  const fetchCategory = async () => {
    try {
      const res = await axios.get('/api/categories');
      const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setCategory(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategory([]);
    }
  };

  const fetchProductColors = useCallback(
    async (productId) => {
      if (!productId || productColors[productId]) return;
      try {
        const res = await axios.get(`/api/productColor/${productId}`);
        const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
        setProductColors((prev) => ({ ...prev, [productId]: data }));
      } catch (err) {
        console.error('Failed to fetch product colors:', err);
        setProductColors((prev) => ({ ...prev, [productId]: [] }));
      }
    },
    [productColors]
  );

  const fetchBatchDetails = async () => {
    if (!id || id === 'create') return;
    setIsEdit(true);
    try {
      const res = await axios.get(`/api/product-batches/${id}`);
      const batch = res.data;
      const normalizedProducts = Array.isArray(batch.products) ? batch.products.map((p) => ({
        productId: p.productId._id,
        quantity: p.quantity,
        colorId: p.colorId?._id || undefined,
      })) : [];
      form.setFieldsValue({ ...batch, products: normalizedProducts });

      for (const product of normalizedProducts) {
        await fetchProductColors(product.productId);
      }
    } catch (err) {
      console.error('Failed to fetch batch details:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBatchDetails();
    fetchCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // --------------------------
  // Submit
  // --------------------------
  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      totalProducts: Array.isArray(values.products) ? values.products.length : 0,
      totalQuantity: Array.isArray(values.products)
        ? values.products.reduce((sum, product) => sum + (product.quantity || 0), 0)
        : 0,
    };
    try {
      if (isEdit) {
        await axios.put(`/api/product-batches/${id}`, payload);
        messageApi.open({ type: 'success', content: 'แก้ไขข้อมูลสำเร็จ' });
      } else {
        await axios.post('/api/product-batches', payload);
        messageApi.open({ type: 'success', content: 'สร้างข้อมูลสำเร็จ' });
      }
      navigate('/batch');
    } catch (err) {
      messageApi.open({ type: 'error', content: 'มีบางอย่างผิดพลาด' });
      console.error('Form submission failed:', err);
    }
  };

  // --------------------------
  // Product item component
  // --------------------------
  const ProductFormItem = ({ field, remove, form, products, productColors, fetchProductColors }) => {
    const selectedProductId = Form.useWatch(['products', field.name, 'productId'], { form });
    const colorsForProduct = Array.isArray(productColors[selectedProductId])
      ? productColors[selectedProductId]
      : [];

    return (
      <Space key={field.key} align="baseline" className="mb-2" wrap>
        <Form.Item
          name={[field.name, 'productId']}
          fieldKey={[field.fieldKey, 'productId']}
          rules={[{ required: true, message: 'Please select a product' }]}
        >
          <Select
            showSearch
            placeholder="เลือกสินค้า"
            style={{ width: 250 }}
            optionFilterProp="label"
            filterOption={(input, option) =>
              option.label.toLowerCase().includes(input.toLowerCase())
            }
            onChange={(value) => {
              form.setFieldValue(['products', field.name, 'colorId'], undefined);
              fetchProductColors(value);
            }}
            options={Array.isArray(products) ? products.map((product) => ({
              value: product._id,
              label: `${product.sku} / ${product.name}`,
            })) : []}
          />
        </Form.Item>

        <Form.Item
          name={[field.name, 'colorId']}
          fieldKey={[field.fieldKey, 'colorId']}
          rules={[{ required: true, message: 'Please select a color' }]}
        >
          <Select
            placeholder="เลือกสีสินค้า"
            disabled={colorsForProduct.length === 0}
            style={{ width: 200 }}
          >
            {colorsForProduct.map((color) => (
              <Option key={color._id} value={color._id}>
                {color.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name={[field.name, 'quantity']}
          fieldKey={[field.fieldKey, 'quantity']}
          rules={[{ required: true, message: 'Please enter quantity' }]}
        >
          <InputNumber
            min={1}
            placeholder="จำนวน"
            disabled={colorsForProduct.length === 0}
          />
        </Form.Item>

        {!isEdit ? (<MinusCircleOutlined onClick={() => remove(field.name)} />) : null}
      </Space>
    );
  };

  // --------------------------
  // Render
  // --------------------------
  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleSubmit}>
      {contextHolder}
      <Form.Item name="batchName" label="ชื่อล็อตสินค้า" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="description" label="คำอธิบาย">
        <Input.TextArea rows={2} />
      </Form.Item>

      <Form.Item name="tags" label="แท็ก">
        <Select mode="tags" style={{ width: '100%' }} placeholder="ป้อนแท็ก">
          {(Array.isArray(category) ? category : []).map((item) => (
            <Option key={item._id} value={item.name}>
              {item.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Divider>สินค้า</Divider>

      <Form.List name="products">
        {(fields, { add, remove }) => (
          <div className="flex flex-col gap-2">
            {fields.map((field) => (
              <ProductFormItem
                key={field.key}
                field={field}
                remove={remove}
                form={form}
                products={products}
                productColors={productColors}
                fetchProductColors={fetchProductColors}
              />
            ))}
            <Form.Item>
              {!isEdit ? (
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                  เพิ่มสินค้า
                </Button>
              ) : null}
            </Form.Item>
          </div>
        )}
      </Form.List>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {isEdit ? 'แก้ไขล็อตสินค้า' : 'สร้างล็อตสินค้า'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProductBatchForm;
