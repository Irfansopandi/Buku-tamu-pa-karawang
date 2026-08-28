"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Swal from "sweetalert2";

export default function AdminToast() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const hasShownLogin = useRef(false);
    const hasShownLogout = useRef(false);

    useEffect(() => {
        if (searchParams.get("login") === "success" && !hasShownLogin.current) {
            hasShownLogin.current = true;
            
            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });

            Toast.fire({
                icon: "success",
                title: "Berhasil masuk ke Dashboard Admin",
                iconColor: "#D29C29",
                customClass: {
                    popup: "border-l-4 border-[#D29C29]",
                    title: "text-[#1A1A1A] font-semibold text-sm"
                }
            });

            const params = new URLSearchParams(searchParams.toString());
            params.delete("login");
            const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            router.replace(newUrl, { scroll: false });
        }
        
        if (searchParams.get("logout") === "success" && !hasShownLogout.current) {
            hasShownLogout.current = true;
            
            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });

            Toast.fire({
                icon: "success",
                title: "Berhasil keluar dari Admin",
                iconColor: "#085C3B",
                customClass: {
                    popup: "border-l-4 border-[#085C3B]",
                    title: "text-[#1A1A1A] font-semibold text-sm"
                }
            });

            const params = new URLSearchParams(searchParams.toString());
            params.delete("logout");
            const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            router.replace(newUrl, { scroll: false });
        }
    }, [searchParams, router, pathname]);

    return null;
}
