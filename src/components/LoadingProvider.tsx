"use client";

import { createContext, useContext, useState, useEffect, ReactNode, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

interface LoadingContextType {
    isLoading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
    isLoading: false,
    startLoading: () => { },
    stopLoading: () => { },
});

export const useLoading = () => useContext(LoadingContext);

function RouteListener() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { stopLoading } = useLoading();

    useEffect(() => {
        // Stop loading whenever the route changes
        stopLoading();
    }, [pathname, searchParams, stopLoading]);

    return null;
}

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    const startLoading = () => setIsLoading(true);
    const stopLoading = () => setIsLoading(false);

    return (
        <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
            <Suspense fallback={null}>
                <RouteListener />
            </Suspense>
            {isLoading && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    zIndex: 9999,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backdropFilter: "blur(2px)"
                }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                        <LoadingSpinner size={50} color="#2563eb" />
                        <p style={{ color: "#374151", fontWeight: 600 }}>Loading...</p>
                    </div>
                </div>
            )}
            {children}
        </LoadingContext.Provider>
    );
}
