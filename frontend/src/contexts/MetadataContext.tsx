import axios from "axios";
import { createContext, ReactNode, useEffect, useState } from "react";
import { User } from "src/@types/types";
import { MAIN_API } from "src/config";
import useAuth from "src/hooks/useAuth";
import { isValidToken, processTokens } from "src/utils/jwt";

type Props = { children: ReactNode };

export const MetadataContext = createContext<{
    isMobile: boolean;
    currentUser: User | undefined;
    getCurrentUser: () => void;
}>
({
    isMobile: true,
    currentUser: undefined,
    getCurrentUser: () => {},
});

export default function MetadataProvider({ children }: Props) {
    const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) && window.innerWidth < 600;

    const { isAuthenticated } = useAuth();

    let user = undefined;
    const local_user = localStorage.getItem('currentUser') ?? '';
    if (local_user !== 'undefined' && local_user !== '') { user = JSON.parse(local_user) };
    const [currentUser, setCurrentUser] = useState<User | undefined>(user);

    const getCurrentUser = async () => {
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}current_user/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            setCurrentUser(response.data.response);
            localStorage.setItem('currentUser', JSON.stringify(response.data.response));
        }).catch((error) => {
            console.error(error);
        })
    };

    useEffect(() => {
        if (checkTokenStatus()) { processTokens(getCurrentUser) };
    }, [isAuthenticated]);

    return (
        <MetadataContext.Provider
            value={{
                isMobile,
                currentUser,
                getCurrentUser
            }}
        >
            {children}
        </MetadataContext.Provider>
    );
}

// ----------------------------------------------------------------------

const checkTokenStatus = () => {
    let token = localStorage.getItem('accessToken') ?? '';
    let refreshToken = localStorage.getItem('refreshToken') ?? '';
    if (token && isValidToken(token)) {
        return true;
    } else if (refreshToken && isValidToken(refreshToken)) {
        return true;
    } else { return false };
}