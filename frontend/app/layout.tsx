import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "SIBUTAL - Sistem Informasi Buku Tamu Digital Pengadilan Agama Karawang",
  description: "SIBUTAL (Sistem Informasi Buku Tamu Digital) Pengadilan Agama Karawang untuk registrasi kunjungan secara online dengan mudah dan cepat.",
  keywords: ["SIBUTAL", "Sistem Informasi Buku Tamu Digital", "Buku Tamu", "Pengadilan Agama Karawang", "PA Karawang", "Digital", "Registrasi Kunjungan", "Pelayanan Publik"],
  authors: [{ name: "Pengadilan Agama Karawang" }],
  openGraph: {
    title: "SIBUTAL - Sistem Informasi Buku Tamu Digital Pengadilan Agama Karawang",
    description: "SIBUTAL (Sistem Informasi Buku Tamu Digital) Pengadilan Agama Karawang untuk registrasi kunjungan secara online dengan mudah dan cepat.",
    url: "https://pa-karawang.go.id",
    siteName: "SIBUTAL PA Karawang",
    images: [
      {
        url: "/images/gedung.jpg",
        width: 1200,
        height: 630,
        alt: "Gedung Pengadilan Agama Karawang",
      }
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIBUTAL - Buku Tamu Digital Pengadilan Agama Karawang",
    description: "Registrasi kunjungan ke Pengadilan Agama Karawang lebih mudah dengan SIBUTAL.",
    images: ["/images/gedung.jpg"],
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <div id="root-portal"></div>
      </body>
    </html>
  );
}
