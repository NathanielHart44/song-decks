import axios from "axios";
import { createContext, ReactNode, useEffect, useState } from "react";
import { Profile, User } from "src/@types/types";
import { MAIN_API } from "src/config";
import useAuth from "src/hooks/useAuth";
import { isValidToken, processTokens } from "src/utils/jwt";

type Props = { children: ReactNode };

export const MetadataContext = createContext<{
    isMobile: boolean;
    isIOS: boolean;
    isPWA: boolean;
    currentUser: Profile | undefined;
    getCurrentUser: () => void;
}>
({
    isMobile: true,
    isIOS: false,
    isPWA: false,
    currentUser: undefined,
    getCurrentUser: () => {},
});

export default function MetadataProvider({ children }: Props) {
    const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) && window.innerWidth < 600;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isPWA = Boolean(window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && window.navigator.standalone));

    const { isAuthenticated } = useAuth();

    let user = undefined;
    const local_user = localStorage.getItem('currentUser') ?? '';
    if (local_user !== 'undefined' && local_user !== '') { 
        const parsedUser = JSON.parse(local_user);
        if (isValidProfile(parsedUser)) {
            user = parsedUser;
        };
    };
    const [currentUser, setCurrentUser] = useState<Profile | undefined>(user);

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
                isIOS,
                isPWA,
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

function isValidUser(user: any): user is User {
    return typeof user === 'object' &&
           typeof user.id === 'number' &&
           typeof user.username === 'string' &&
           typeof user.first_name === 'string' &&
           typeof user.last_name === 'string' &&
           typeof user.email === 'string';
}

function isValidProfile(profile: any): profile is Profile {
    return typeof profile === 'object' &&
           typeof profile.id === 'number' &&
           isValidUser(profile.user) &&
           typeof profile.tester === 'boolean' &&
           typeof profile.moderator === 'boolean' &&
           typeof profile.admin === 'boolean';
}