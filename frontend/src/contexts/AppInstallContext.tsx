import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { MetadataContext } from "./MetadataContext";

type Props = { children: ReactNode };

export const AppInstallContext = createContext<{
    installPrompt: any;
}>
({
    installPrompt: null
});

export default function AppInstallProvider({ children }: Props) {

    const { currentUser } = useContext(MetadataContext);
    const [installPrompt, setInstallPrompt] = useState(null);

    useEffect(() => {
        if (!currentUser?.tester) { return };
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [currentUser]);

    return (
        <AppInstallContext.Provider
            value={{
                installPrompt
            }}
        >
            {children}
        </AppInstallContext.Provider>
    );
};