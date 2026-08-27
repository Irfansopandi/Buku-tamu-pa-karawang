"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Swal from "sweetalert2";

export default function LoginToast() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const hasShown = useRef(false);

    useEffect(() => {
        if (searchParams.get("login") === "success" && !hasShown.current) {
            hasShown.current = true;
            
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
                title: "Berhasil masuk ke Halaman Petugas",
                iconColor: "#085C3B",
                customClass: {
                    popup: "border-l-4 border-[#085C3B]",
                    title: "text-[#1A1A1A] font-semibold text-sm"
                }
            });

            // Clean up the URL without triggering a full page reload
            const params = new URLSearchParams(searchParams.toString());
            params.delete("login");
            const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
            router.replace(newUrl, { scroll: false });
        }
    }, [searchParams, router, pathname]);

    return null;
}
