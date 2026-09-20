import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#111111] text-white">

      {/* ==========================================
          ADMIN SIDEBAR
          
          The sidebar is fixed to the left.
          All admin page content is placed beside it.
      ========================================== */}

      <AdminSidebar />

      {/* ==========================================
          ADMIN PAGE CONTENT
          
          The sidebar width is 256px (w-64).
          Therefore the content starts after 256px.
      ========================================== */}

      <main className="min-h-screen pl-64">
        {children}
      </main>

    </div>
  );
};

export default AdminLayout;