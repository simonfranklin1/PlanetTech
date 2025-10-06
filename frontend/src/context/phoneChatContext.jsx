import { createContext, useContext, useState } from "react";

const PhoneContext = createContext();

export const PhoneContextProvider = ({ children }) => {

    const storedUser = JSON.parse(localStorage.getItem("userInfo"));
    const [authenticated, setAuthenticated] = useState(!!storedUser);
    const [userInfo, setUserInfo] = useState(storedUser || {});
    const [messages, setMessages] = useState([]);

    const value = {
        authenticated,
        setAuthenticated,
        userInfo,
        setUserInfo,
        messages,
        setMessages
    };

    return (
        <PhoneContext.Provider value={value}>
            {children}
        </PhoneContext.Provider>
    )
};

export const usePhoneContext = () => {
    const context = useContext(PhoneContext);
    if (!context) {
        throw new Error("usePhoneContext deve ser usado dentro de um PhoneContextProvider");
    }
    return context;
};