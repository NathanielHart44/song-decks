import { createContext, ReactNode } from "react";

type Props = { children: ReactNode };

export const MetadataContext = createContext<{
    isMobile: boolean;
}>
({
    isMobile: true,
});

export default function MetadataProvider({ children }: Props) {
    const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    return (
        <MetadataContext.Provider
            value={{ isMobile }}
        >
            {children}
        </MetadataContext.Provider>
    );
}