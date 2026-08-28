import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminHeader from "../../../components/admin/AdminHeader";
import AdminToast from "../../../components/admin/AdminToast";
import { SidebarProvider } from "../../../components/admin/SidebarContext";
import { Suspense } from "react";
import { cookies } from "next/headers";

export default async function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const adminName = cookieStore.get("admin_name")?.value || "Admin";

    return (
        <SidebarProvider>
            <div className="h-screen flex overflow-hidden bg-gray-50">
                <Suspense fallback={null}>
                    <AdminToast />
                </Suspense>
                <AdminSidebar />
                <div className="flex flex-col w-0 flex-1 overflow-hidden">
                    <AdminHeader adminName={adminName} />
                    <main className="flex-1 relative overflow-y-auto focus:outline-none">
                        <div className="py-6">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
