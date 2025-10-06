import { usePhoneContext } from "../context/phoneChatContext";
import { randomColor, detectFileType, getInitials } from "../utils/utils";
import Sidebar from "../components/Sidebar";
import ChatInput from "../components/ChatInput";
import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";

export default function Chat() {
  const { userInfo, messages, setMessages } = usePhoneContext();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  const detectFileType = (file) => {
    if (file?.type?.startsWith("image/")) return "image";
    if (file?.type?.startsWith("audio/")) return "audio";
    return "text";
  };

  const handleSend = async () => {
    if (message === "" && file === null) return;

    const reqBody = {
      content: message || filePreview,
      sender: userInfo.username,
      type: file ? detectFileType(file) : "text",
    };

    try {
      const res = await fetch("http://localhost:3000/messages", {
        method: "POST",
        body: JSON.stringify(reqBody),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.situation === "success") {
        setMessages((prev) => [...prev, data.message]);
        setMessage("");
        setFile(null);
        setFilePreview(null);
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const groupedMessages =
    messages.length !== 0
      ? messages.reduce((acc, msg) => {
        const day = dayjs(msg.timestamp).format("DD/MM/YYYY");
        if (!acc[day]) acc[day] = [];
        acc[day].push(msg);
        return acc;
      }, {})
      : [];

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      setIsUserScrolling(distanceFromBottom > 50);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isUserScrolling]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("http://localhost:3000/messages");
        const data = await res.json();
        const sorted = data.sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(sorted);
      } catch (err) {
        console.error("Erro ao buscar mensagens:", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col lg:flex-row h-screen pt-[54px] lg:pt-0 overflow-y-auto bg-gray-100">
      <Sidebar />
      <main className="flex flex-col flex-1">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-3"
        >
          {Object.entries(groupedMessages).map(([day, msgs]) => (
            <div key={day}>
              <div className="text-center text-gray-400 my-2">
                {day === dayjs().format("DD/MM/YYYY") ? "Hoje" : day}
              </div>
              {msgs.map((msg) => {
                const isMine = msg.sender === userInfo.username;
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end ${isMine ? "justify-end" : "justify-start"
                      } mb-4`}
                  >
                    {!isMine && (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-2"
                        style={{ backgroundColor: randomColor(msg.sender) }}
                      >
                        {getInitials(msg.sender)}
                      </div>
                    )}

                    <div
                      className={`max-w-[60%] px-3 py-2 rounded-2xl ${isMine
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white text-gray-900 rounded-bl-none shadow"
                        } flex flex-col gap-2`}
                    >
                      {!isMine && (
                        <div className="font-bold">{msg.sender}</div>
                      )}

                      {msg.type === "text" && msg.content}
                      {msg.type === "image" && (
                        <img
                          src={msg.content}
                          alt="imagem"
                          className="w-48 h-auto rounded"
                        />
                      )}
                      {msg.type === "audio" && (
                        <audio controls className="h-8 max-w-full">
                          <source src={msg.content} type="audio/webm" />
                        </audio>
                      )}

                      <div className="flex justify-end w-auto font-semibold text-[10px]">
                        {dayjs(msg.timestamp).isSame(dayjs(), "day")
                          ? `Hoje ${dayjs(msg.timestamp).format("HH:mm")}`
                          : dayjs(msg.timestamp).format("DD/MM/YYYY HH:mm")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <ChatInput
          handleSend={handleSend}
          file={file}
          filePreview={filePreview}
          message={message}
          setFile={setFile}
          setFilePreview={setFilePreview}
          setMessage={setMessage}
        />
      </main>
    </div>
  )
};
