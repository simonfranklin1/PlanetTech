import React, { useEffect, useState } from "react"
import Logo from "../assets/Logo.png"
import Background from "../assets/bg.png"
import { usePhoneContext } from "../context/phoneChatContext";

const Login = () => {
    const [name, setName] = useState("");
    const { setAuthenticated } = usePhoneContext();
    const [error, setError] = useState(false);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        setAnimate(true);
    }, []);


    const signIn = (e) => {
        e.preventDefault();

        if (name === "") {
            setError(true);
            return;
        }

        const data = {
            username: name
        };

        localStorage.setItem("userInfo", JSON.stringify(data));

        setAuthenticated(true);

    };

    return (
        <div className="w-screen h-screen bg-gray-200 relative flex items-center justify-start" style={{ backgroundImage: `url(${Background})`, backgroundSize: "cover" }}>

            <div className="lg:bg-white/90 bg-white h-screen w-full lg:w-[50%] flex justify-center items-center">

                <form
                    onSubmit={signIn}
                    className={`w-[70%] sm:w-[50%] lg:w-[40%] mx-auto transition-all duration-500 ease-out
        ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                >
                    <img
                        src={Logo}
                        alt="Logo"
                        className="w-[150px] sm:w-[200px] h-[100px] sm:h-[150px] object-contain sm:mb-2 mx-auto"
                    />
                    {error && (
                        <span className="text-red-500 text-sm mt-1 self-start">
                            Informe um nome
                        </span>
                    )}
                    <input
                        autoComplete="off"
                        type="text"
                        name="name"
                        placeholder="Usuário"
                        className={`w-full h-[50px] ${error ? "bg-red-300" : "bg-[#ececec]"
                            } text-gray-700 px-4 py-2 outline-none mb-5 focus:ring-1 focus:ring-gray-800`}
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError(false);
                        }}
                    />
                    <button
                        type="submit"
                        className="bg-[#354545] hover:bg-[#2f3d3d] font-medium w-full h-[50px] flex justify-center items-center text-white cursor-pointer rounded-sm"
                    >
                        Entrar
                    </button>
                </form>

            </div>

        </div>
    )
}

export default Login