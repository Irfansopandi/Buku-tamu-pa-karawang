import OfficerHeader from "../../../components/officer/OfficerHeader";
import LoginToast from "../../../components/officer/LoginToast";
import { Suspense } from "react";
export default function OfficerDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
            <OfficerHeader />
            <main className="flex-1 relative overflow-y-auto focus:outline-none">
                <div className="py-6 sm:py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                        <Suspense fallback={null}>
                            <LoginToast />
                        </Suspense>
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
