import { Paperclip, Send, Image, Mic, StopCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ChatInput = ({ message, setMessage, file, setFile, filePreview, setFilePreview, handleSend }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [stream, setStream] = useState(null);
    const wrapperRef = useRef(null);

    const detectFileType = (file) => {
        if (file.type.startsWith("image/")) return "image";
        if (file.type.startsWith("audio/")) return "audio";
        return "text";
    };

    const handleUploadFile = async (selectedFile) => {
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await fetch("http://localhost:3000/upload", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (data.url) {
                setFile(selectedFile);
                setFilePreview(data.url);
            } else {
                console.error("Erro no upload do arquivo");
            }
        } catch (err) {
            console.error("Erro no upload:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        await handleUploadFile(selectedFile);
        setMenuOpen(false);
    };

    const convertToWav = async (blob) => {
        const arrayBuffer = await blob.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const numOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const length = audioBuffer.length * numOfChannels * 2 + 44;
        const buffer = new ArrayBuffer(length);
        const view = new DataView(buffer);

        let offset = 0;
        const writeString = (str) => {
            for (let i = 0; i < str.length; i++) {
                view.setUint8(offset++, str.charCodeAt(i));
            }
        };
        writeString("RIFF");
        view.setUint32(offset, length - 8, true); offset += 4;
        writeString("WAVE");
        writeString("fmt ");
        view.setUint32(offset, 16, true); offset += 4;
        view.setUint16(offset, 1, true); offset += 2;
        view.setUint16(offset, numOfChannels, true); offset += 2;
        view.setUint32(offset, sampleRate, true); offset += 4;
        view.setUint32(offset, sampleRate * numOfChannels * 2, true); offset += 4;
        view.setUint16(offset, numOfChannels * 2, true); offset += 2;
        view.setUint16(offset, 16, true); offset += 2;
        writeString("data");
        view.setUint32(offset, length - offset - 4, true); offset += 4;

        for (let i = 0; i < audioBuffer.length; i++) {
            for (let channel = 0; channel < numOfChannels; channel++) {
                let sample = audioBuffer.getChannelData(channel)[i];
                sample = Math.max(-1, Math.min(1, sample));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
                offset += 2;
            }
        }

        return new Blob([view], { type: "audio/wav" });
    };

    const startRecording = async () => {
        const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(userStream);

        const recorder = new MediaRecorder(userStream);
        setMediaRecorder(recorder);
        const chunks = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);

        recorder.onstop = async () => {
            const audioBlob = new Blob(chunks, { type: "audio/webm" });
            const wavBlob = await convertToWav(audioBlob);

            await handleUploadFile(wavBlob);

            setRecording(false);
            userStream.getTracks().forEach(track => track.stop());
            setStream(null);
            setMediaRecorder(null);
        };

        recorder.start();
        setRecording(true);
    };

    const stopRecording = () => {
        if (mediaRecorder && recording) {
            mediaRecorder.requestData();
            mediaRecorder.stop();
            setMenuOpen(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target) &&
                !recording
            ) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [recording]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !loading) {
            if (message || filePreview) {
                handleSend();
            }
        }
    };

    return (
        <div ref={wrapperRef} className="relative">
            {filePreview && (
                <div className="absolute bottom-full left-0 w-full bg-gray-50 border-t border-gray-200 p-3 flex items-center justify-between shadow-md z-20">
                    <div className="flex items-center gap-3">
                        {detectFileType(file) === "image" && (
                            <img
                                src={filePreview}
                                alt="preview"
                                className="w-16 h-16 object-cover rounded"
                            />
                        )}
                        {detectFileType(file) === "audio" && (
                            <audio controls className="h-8">
                                <source src={filePreview} type={file.type} />
                            </audio>
                        )}
                    </div>
                    <button
                        onClick={() => {
                            setFile(null);
                            setFilePreview(null);
                        }}
                        className="text-sm text-red-500 hover:text-red-700 cursor-pointer"
                    >
                        Remover
                    </button>
                </div>
            )}

            <div className="border-t bg-white p-3 flex items-center gap-3 relative">
                <div className="relative">
                    <button
                        disabled={message !== "" || loading}
                        className="text-gray-600 hover:text-gray-800 cursor-pointer"
                        onClick={() => setMenuOpen((prev) => !prev)}
                    >
                        <Paperclip size={22} />
                    </button>

                    {menuOpen && (
                        <div className="absolute bottom-10 left-0 w-40 bg-white border border-gray-200 shadow-lg rounded-md z-10">
                            <button
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full cursor-pointer"
                                onClick={() => {
                                    fileInputRef.current.accept = "image/*";
                                    fileInputRef.current.click();
                                }}
                            >
                                <Image size={16} /> Imagem
                            </button>
                            <button
                                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full cursor-pointer"
                                onClick={() => {
                                    fileInputRef.current.accept = "audio/*";
                                    fileInputRef.current.click();
                                }}
                            >
                                <Mic size={16} /> Áudio
                            </button>
                            {!recording ? (
                                <button
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-red-500 cursor-pointer"
                                    onClick={startRecording}
                                >
                                    <Mic size={16} /> Gravar Áudio
                                </button>
                            ) : (
                                <button
                                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-green-500 cursor-pointer"
                                    onClick={stopRecording}
                                >
                                    <StopCircle size={16} /> Parar Gravação
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                />

                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Digite sua mensagem..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={file !== null || loading}
                        maxLength={200}
                        className={`w-full border rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-400 transition ${file || loading ? "bg-gray-100 cursor-not-allowed opacity-70" : ""}`}
                    />
                    <span className="absolute right-3 bottom-1 text-[10px] text-gray-400 select-none">
                        {message.length}/200
                    </span>
                </div>

                <button
                    onClick={handleSend}
                    disabled={loading || message.length === 0 && file === null && filePreview === null}
                    className={`bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition ${(loading || message.length === 0 && file === null && filePreview === null) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                    <Send size={20} />
                </button>

                {loading && <span className="ml-2 text-gray-500 text-sm">Carregando...</span>}
            </div>
        </div>
    );
};

export default ChatInput
