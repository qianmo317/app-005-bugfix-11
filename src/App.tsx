import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { Provider } from "react-redux";
import { store } from "./store";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/dashboard";
import CustomerList from "./pages/customers/list";
import CustomerDetail from "./pages/customers/detail";
import ServiceList from "./pages/services/list";
import PackageList from "./pages/services/packages";
import AppointmentCalendar from "./pages/appointments/calendar";
import EmployeeSchedule from "./pages/schedules";
import EmployeeList from "./pages/employees/list";
import "./styles/global.less";

export default function App() {
  return (
    <Provider store={store}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: "#C9A86C",
            colorInfo: "#C9A86C",
            borderRadius: 8,
            fontFamily: "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          },
          components: {
            Button: {
              borderRadius: 24,
              controlHeight: 36,
            },
            Card: {
              headerBg: "transparent",
            },
            Menu: {
              itemBg: "transparent",
              subMenuItemBg: "transparent",
            },
          },
        }}
      >
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
              <Route path="/services" element={<ServiceList />} />
              <Route path="/packages" element={<PackageList />} />
              <Route path="/appointments" element={<AppointmentCalendar />} />
              <Route path="/schedules" element={<EmployeeSchedule />} />
              <Route path="/employees" element={<EmployeeList />} />
            </Routes>
          </MainLayout>
        </Router>
      </ConfigProvider>
    </Provider>
  );
}
