import { Metadata } from "next";
import ScannerClient from "../../../components/officer/ScannerClient";

export const metadata: Metadata = {
    title: 'Buku Tamu Digital - Halaman Petugas PA Karawang',
    description: 'Buku Tamu Digital - Halaman Petugas PA Karawang',
};

export default function OfficerDashboardPage() {
    return (
        <ScannerClient />
    );
}
