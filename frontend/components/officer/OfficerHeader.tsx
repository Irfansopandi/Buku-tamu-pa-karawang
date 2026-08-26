"use client";

import { useActionState } from "react";
import { logoutOfficerAction } from "../../lib/auth-actions";

export default function OfficerHeader() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [state, formAction, isPending] = useActionState(logoutOfficerAction, null);

    return (
        <header className="bg-white shadow-sm z-10 relative">
            <div className="flex-1 flex justify-between px-4 sm:px-6 lg:px-8 h-16">
                <div className="flex-1 flex items-center">
                    <h2 className="text-xl font-bold text-gray-800 leading-tight">
                        Officer Dashboard
                    </h2>
                </div>
                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                    <div className="text-sm font-medium text-gray-700">
                        Officer Portal
                    </div>
                    <form action={formAction}>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-50 transition-colors"
                        >
                            {isPending ? "Logging out..." : "Logout"}
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
}
