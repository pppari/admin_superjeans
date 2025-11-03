import { useState } from "react";
import {
  FaBars,
  FaBoxOpen,
  FaChartBar,
  FaDollarSign,
  FaSignOutAlt,
  FaKey,
} from "react-icons/fa";
import { Avatar, Button, Layout, Menu, Popover, Typography } from "antd";
import { Link, useLocation } from "react-router-dom";
import { TbCategoryPlus } from "react-icons/tb";
import { RiAdminLine } from "react-icons/ri";
import { UserOutlined } from "@ant-design/icons";
import ChangePassword from "../components/ChangePassword";
import logo from "../assets/logo.png";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const Main = ({ children, decodedToken }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const { pathname } = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/signin";
  };

  const pathToKeyMap = {
    "/": "1",
    "/category": "2",
    "/product": "3",
    "/order": "4",
    "/batch": "5",
    "/admin": "6",
    "/rooms": "7",
    "/product-unit": "8",
    "/review": "9",
    "/user": "10",
    "/stock": "11",
    "/promotion": "12",
    "/coupon": "13",
    "/sub-category": "14"
  };

  const defaultSelectedKey = pathToKeyMap[pathname] || "1";

  const popoverContent = (
    <div className="flex flex-col items-center gap-4">
      <Button
        type="text"
        icon={<FaKey />}
        onClick={() => setOpenChangePassword(true)}
        className="flex items-center"
      >
        เปลี่ยนรหัสผ่าน
      </Button>
      <Button
        type="text"
        danger
        icon={<FaSignOutAlt />}
        onClick={handleLogout}
      >
        ออกจากระบบ
      </Button>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="border-r border-gray-200"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            {!collapsed && (
              <img src={logo} alt="logo" className="w-full" />
            )}
          </div>

          <Menu
            mode="inline"
            defaultSelectedKeys={[defaultSelectedKey]}
            className="flex-1 border-none"
            items={[
              {
                key: "1",
                icon: <FaChartBar />,
                label: <Link to="/">Dashboard</Link>,
              },
              {
                key: "sub1",
                icon: <TbCategoryPlus />,
                label: "ประเภทสินค้า",
                children: [
                  {
                    key: "14",
                    label: <Link to="/sub-category">จัดการประเภทย่อย</Link>,
                  },
                  {
                    key: "2",
                    label: <Link to="/category">จัดการประเภท</Link>,
                  },
                  {
                    key: "7",
                    label: <Link to="/rooms">จัดการห้อง</Link>,
                  },
                ],
              },
              {
                key: "sub2",
                icon: <FaBoxOpen />,
                label: "สินค้าและล็อตสินค้า",
                children: [
                  {
                    key: "3",
                    label: <Link to="/product">จัดการสินค้า</Link>,
                  },
                  {
                    key: "5",
                    label: <Link to="/batch">จัดการล็อตสินค้า</Link>,
                  },
                  {
                    key: "8",
                    label: <Link to="/product-unit">รายการสินค้า</Link>,
                  },
                  {
                    key: "11",
                    label: <Link to="/stock">รายงานคลังสินค้า</Link>,
                  },
                ],
              },
              {
                key: "sub3",
                icon: <FaDollarSign />,
                label: "ออเดอร์",
                children: [
                  {
                    key: "4",
                    label: <Link to="/order">จัดการออเดอร์</Link>,
                  },
                  {
                    key: "9",
                    label: <Link to="/review">จัดการรีวิว</Link>,
                  },
                ],
              },
              {
                key: "sub4",
                icon: <RiAdminLine />,
                label: "การจัดการระบบ",
                children: [
                  // {
                  //   key: "12",
                  //   label: <Link to="/promotion">จัดการภาพโปรโมชั่น</Link>,
                  // },
                  {
                    key: "13",
                    label: <Link to="/coupon">จัดการส่วนลด</Link>,
                  },
                  {
                    key: "6",
                    label: <Link to="/admin">จัดการแอดมิน</Link>,
                  },
                  {
                    key: "10",
                    label: <Link to="/user">จัดการผู้ใช้งาน</Link>,
                  },
                ],
              },
            ]}
          />
        </div>
      </Sider>

      <Layout 
        style={{ 
          marginLeft: collapsed ? 80 : 200, 
          transition: 'all 0.2s',
        }}
      >
        <Header
          style={{
            padding: "0 24px",
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: 'sticky',
            top: 0,
            zIndex: 1,
            width: '100%',
          }}
        >
          <Button
            type="text"
            icon={<FaBars />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: "16px" }}
          />
          <div className="flex items-center gap-4">
            <Avatar icon={<UserOutlined />} />
            <Popover
              content={popoverContent}
              trigger="click"
              placement="bottomRight"
            >
              <Button type="text">
                {decodedToken?.email || 'User'}
              </Button>
            </Popover>
          </div>
          <ChangePassword
            decodedToken={decodedToken}
            open={openChangePassword}
            onCancel={() => setOpenChangePassword(false)}
          />
        </Header>

        <Content
          style={{
            margin: "24px",
            padding: 24,
            borderRadius: 8,
            minHeight: 280,
          }}
          className="bg-white"
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Main;
