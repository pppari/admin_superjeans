import { Button, Form, Input, Select, InputNumber, Space, Divider, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../lib/axios';

const { Option } = Select;

const ProductBatchForm = ({ initialValues = {} }) => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [productColors, setProductColors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const { id } = useParams();

  // Fetch the list of products.
  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchCategory = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategory(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  // Fetch colors for a product using the API endpoint.
  const fetchProductColors = useCallback(
    async (productId) => {
      if (!productId || productColors[productId]) return;
      try {
        const res = await axios.get(`/api/productColor/${productId}`);
        setProductColors((prev) => ({ ...prev, [productId]: res.data }));
      } catch (err) {
        console.error('Failed to fetch product colors:', err);
      }
    },
    [productColors]
  );

  // If editing, load batch details.
  const fetchBatchDetails = async () => {
    if (!id || id === 'create') return;
    setIsEdit(true);
    try {
      const res = await axios.get(`/api/product-batches/${id}`);
      const batch = res.data;
      // Normalize the products list.
      const normalizedProducts = batch.products.map((p) => ({
        productId: p.productId._id,
        quantity: p.quantity,
        colorId: p.colorId._id || undefined,
      }));
      form.setFieldsValue({ ...batch, products: normalizedProducts });
      // Preload colors for each product.
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

  // Handle form submission.
  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      totalProducts: values.products.length,
      totalQuantity: values.products.reduce((sum, product) => sum + product.quantity, 0),
    };
    try {
      if (isEdit) {
        await axios.put(`/api/product-batches/${id}`, payload);
        messageApi.open({
      type: 'success',
      content: 'แก้ไขข้อมูลสำเร็จ',
    });
      } else {
        await axios.post('/api/product-batches', payload);
        messageApi.open({
      type: 'success',
      content: 'สร้างข้อมูลสำเร็จ',
    });
      }
      navigate('/batch');
    } catch (err) {
      messageApi.open({
      type: 'error',
      content: 'มีบางอย่างผิดพลาด',
    });
      console.error('Form submission failed:', err);
    }
  };

  // Child component for a single product item.
  const ProductFormItem = ({ field, remove, form, products, productColors, fetchProductColors }) => {
    // Note: using the full path into the form values to correctly watch the product selection.
    const selectedProductId = Form.useWatch(['products', field.name, 'productId'], { form });

    return (
      <Space key={field.key} align="baseline" className="mb-2" wrap>
        <Form.Item
          name={[field.name, 'productId']}
          fieldKey={[field.fieldKey, 'productId']}
          rules={[{ required: true, message: 'Please select a product' }]}
        >
<Select
  showSearch
  placeholder="Select product"
  style={{ width: 250 }}
  optionFilterProp="label"
  filterOption={(input, option) =>
    option.label.toLowerCase().includes(input.toLowerCase())
  }
  onChange={(value) => {
    form.setFieldValue(['products', field.name, 'colorId'], undefined);
    fetchProductColors(value);
  }}
  options={products.map((product) => ({
    value: product._id,
    label: `${product.sku} / ${product.name}`,
  }))}
/>


        </Form.Item>

        <Form.Item
          name={[field.name, 'colorId']}
          fieldKey={[field.fieldKey, 'colorId']}
          rules={[{ required: true, message: 'Please select a color' }]}
          
        >
          <Select placeholder="Select product color" disabled={!productColors[selectedProductId] ? true : false} style={{ width: 200 }}>
            {(productColors[selectedProductId] || []).map((color) => (
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
          <InputNumber min={1} placeholder="Quantity" disabled={!productColors[selectedProductId] ? true : false} />
        </Form.Item>
            {!isEdit ? (<MinusCircleOutlined onClick={() => remove(field.name)} />) : null}
      </Space>
    );
  };

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleSubmit}>
      {contextHolder}
      <Form.Item name="batchName" label="Batch Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="batchCode" label="Batch Code" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="description" label="Description">
        <Input.TextArea rows={2} />
      </Form.Item>

      <Form.Item name="notes" label="Notes">
        <Input.TextArea rows={2} />
      </Form.Item>

      <Form.Item name="tags" label="Tags">
  <Select mode="tags" style={{ width: '100%' }} placeholder="Enter tags">
  {category.map((item) => (
              <Option key={item._id} value={item.name}>
                {item.name}
              </Option>
            ))}
  </Select>
</Form.Item>

      <Divider>Products</Divider>

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
                isEdit={isEdit}
              />
            ))}
            <Form.Item>
            {!isEdit ? (
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                Add Product
              </Button>
            ) : null}
            </Form.Item>
          </div>
        )}
      </Form.List>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {isEdit ? 'Update' : 'Create'} Batch
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProductBatchForm;
