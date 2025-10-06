import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { usePhoneContext } from "../context/phoneChatContext";
import { getInitials } from "../utils/utils";

const Sidebar = () => {
    const { userInfo, setAuthenticated, setUserInfo } = usePhoneContext();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("userInfo");
        setAuthenticated(false);
        setUserInfo({});
    };

    return (
        <>
            <aside className="hidden sm:flex w-[300px] bg-slate-800 text-white flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
                        <h1 className="text-lg font-bold tracking-wide">PlanetTech</h1>
                        <div className="relative">
                            <button
                                className="p-1 rounded hover:bg-slate-700 transition cursor-pointer"
                                onClick={() => setMenuOpen((prev) => !prev)}
                            >
                                <MoreVertical size={20} />
                            </button>

                            {menuOpen && (
                                <div
                                    ref={menuRef}
                                    className="absolute right-0 mt-2 w-40 bg-white text-gray-800 shadow-lg rounded-md z-50"
                                >
                                    <button
                                        onClick={handleLogout}
                                        onMouseDown={handleLogout}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md transition cursor-pointer"
                                    >
                                        Sair
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-700 flex items-center gap-3 px-5 py-3">
                    <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold">
                        {userInfo.username && getInitials(userInfo.username)}
                    </div>
                    <span className="font-medium">{userInfo.username}</span>
                </div>
            </aside>

            <header className="flex sm:hidden w-full bg-slate-800 text-white items-center justify-between px-4 py-3 fixed top-0 left-0 shadow-sm z-10">
                <h1 className="text-lg font-bold tracking-wide">PlanetTech</h1>
                <div className="relative">
                    <button
                        className="p-1 rounded hover:bg-slate-700 transition cursor-pointer"
                        onClick={() => setMenuOpen((prev) => !prev)}
                    >
                        <MoreVertical size={20} />
                    </button>

                    {menuOpen && (
                        <div
                            ref={menuRef}
                            className="absolute right-0 mt-2 w-40 bg-white text-gray-800 shadow-lg rounded-md z-50"
                        >
                            <button
                                onClick={handleLogout}
                                onMouseDown={handleLogout}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md transition cursor-pointer"
                            >
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </header>
        </>
    );
};

export default Sidebar;
