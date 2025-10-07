import Login from "../pages/Login";
import Forgot from "../pages/Forgot";
import Reset from "../pages/Reset";
const publicRoutes = [

    { path: '/signin', element: <Login /> },
    { path: '/forgot', element: <Forgot /> },
    { path: '/reset', element: <Reset /> },

  ];

  export default publicRoutes;