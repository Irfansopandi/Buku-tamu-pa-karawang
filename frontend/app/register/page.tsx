import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import RegistrationForm from "@/components/public/RegistrationForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Registrasi Kunjungan - Pengadilan Agama Karawang",
    description: "Formulir pendaftaran layanan kunjungan Pengadilan Agama Karawang.",
};

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex flex-col font-sans relative">
            <Navbar />
            <main className="flex-grow flex flex-col bg-[#FAF7F2] relative overflow-hidden">
                {/* Subtle Batik Background */}
                <div className="absolute inset-0 w-full h-full pointer-events-none bg-repeat bg-left-top z-0" 
                     style={{ backgroundImage: 'url("/images/batik-bg-cropped.png")', backgroundSize: '250px' }}>
                </div>
                
                <div className="relative z-10 w-full">
                    <RegistrationForm />
                </div>
            </main>
            <Footer />
        </div>
    );
}
