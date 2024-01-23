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
        if (!currentUser?.moderator) { return };
        const handleBeforeInstallPrompt = (e: any) => {
            console.log('beforeinstallprompt event fired');
            console.log(e);
            e.preventDefault();
            setInstallPrompt(e);
        };
        
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        console.log('beforeinstallprompt event listener added');
        
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            console.log('beforeinstallprompt event listener removed');
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