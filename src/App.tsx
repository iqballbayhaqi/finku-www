import { ConfigProvider, App as AntApp } from 'antd';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { theme } from './theme';

function App() {
  return (
    <ConfigProvider theme={theme}>
      <AntApp>
        <RouterProvider router={router} />
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
