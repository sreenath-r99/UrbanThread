import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <AdminSidebar />

      <main className="min-h-screen pl-64">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;