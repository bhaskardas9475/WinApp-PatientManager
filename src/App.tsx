import { useEffect } from "react";
import MainLayout from "./layout/MainLayout";
import migration from "./db/migration";
import { ToastProvider } from "./components/Toast";

export default function App() {
  useEffect(() => {
    migration.up();
  }, []);

  return (
    <ToastProvider>
      <MainLayout />
    </ToastProvider>
  );
}
