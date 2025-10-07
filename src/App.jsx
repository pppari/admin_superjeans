import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Main from './layout/main';
import ProtectedRouter from './routes/RoutesGuard';
import protectedRoutes from './routes/ProtectedRoutes';
import publicRoutes from './routes/PublicRoutes';
import { ConfigProvider, theme as antTheme } from 'antd';

const App = () => {
  const getDecodedToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const decodedToken = getDecodedToken();

  // ใช้เฉพาะ Light Theme + สีส้มเป็นหลัก
  const customTheme = {
    algorithm: antTheme.defaultAlgorithm,
    token: {
      fontFamily: 'IBM Plex Sans Thai, sans-serif',
    },
    components: {
      Layout: {
        bodyBg: '#f2f8fc',
        headerBg: '#ffffff',
        siderBg: '#ffffff', // Sidebar สีส้ม
      },
      Menu: {
        itemBg: 'transparent',
        itemColor: '#000000',
        itemHoverBg: 'rgba(255,255,255,0.15)',
        itemSelectedBg: '#f4f1f8',
        itemSelectedColor: '#000000',
        subMenuItemBg: 'transparent',
      },
    },
  };

  return (
    <ConfigProvider theme={customTheme}>
      <Routes>
        {publicRoutes.map(({ path, element }, index) => (
          <Route key={index} path={path} element={element} />
        ))}
        {protectedRoutes.map(({ path, element }, index) => (
          <Route
            key={index}
            path={path}
            element={
              <ProtectedRouter decodedToken={decodedToken}>
                <Main decodedToken={decodedToken}>{element}</Main>
              </ProtectedRouter>
            }
          />
        ))}
      </Routes>
    </ConfigProvider>
  );
};

export default App;
