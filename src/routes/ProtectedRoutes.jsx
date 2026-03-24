import BatchDetailsPrint from "../components/BatchDocs";
import ProductBatchForm from "../components/ProductBatchForm";
import Admin from "../pages/Admin";
import ProductBatch from "../pages/Batch";
import Category from "../pages/Category";
import Dashboard from "../pages/Dashboard";
import Order from "../pages/Order";
import Product from "../pages/Product";
import Rooms from "../pages/Rooms";
import ProductColorPage from "../pages/ProductColor";
import ColorImages from "../pages/ColorImages";
import ProductUnit from "../pages/ProductUnit";
import ReviewPage from "../pages/Review";
import CouponTable from "../pages/Coupon";
import UserList from "../pages/UserList";
import StockTransactionPage from "../pages/Stock";
import PromotionImagePanel from "../pages/Promotion";
import SubCategory from "../pages/SubCategory";

const protectedRoutes = [
    /* admin routes */
    { path: '/', element: <Dashboard /> },
    { path: '/category', element: <Category /> },
    { path: '/product', element: <Product /> },
    { path: '/product/:productId', element: <ProductColorPage /> },
    { path: '/product/:productId/color/:colorId/images', element: <ColorImages /> },
    { path: '/product-unit', element: <ProductUnit /> },
    { path: '/order', element: <Order /> },
    { path: '/batch', element: <ProductBatch /> },
    { path: '/batch/:id', element: <ProductBatchForm /> },
    { path: '/batch/:id/print', element: <BatchDetailsPrint /> },
    { path: '/admin', element: <Admin /> },
    { path: '/rooms', element: <Rooms /> },
    { path: '/review', element: <ReviewPage /> },
    { path: '/coupon', element: <CouponTable /> },
    { path: '/user', element: <UserList /> },
    { path: '/stock', element: <StockTransactionPage /> },
    { path: '/promotion', element: <PromotionImagePanel /> },
    { path: '/sub-category', element: <SubCategory /> },
  ];

  export default protectedRoutes;