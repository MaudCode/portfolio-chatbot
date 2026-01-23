import { useState, useRef, useEffect } from "react"

export default function ChatBot() {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [isButtonHovered, setIsButtonHovered] = useState(false)
    const [isInputFocused, setIsInputFocused] = useState(false)
    const [loadingScale, setLoadingScale] = useState(1)
    const messagesContainerRef = useRef(null)

    const quickQuestions = [
        "Who are you?",
        "What's your design process?",
        "What services do you offer?",
    ]

    // Auto-scroll to bottom when messages change or loading state changes
    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop =
                messagesContainerRef.current.scrollHeight
        }
    }, [messages, loading])

    // Pulsing animation for loading dot
    useEffect(() => {
        if (!loading) return

        const interval = setInterval(() => {
            setLoadingScale((prev) => (prev === 1 ? 0.7 : 1))
        }, 400)

        return () => clearInterval(interval)
    }, [loading])

    const sendMessage = async (text) => {
        const userMessage = text || input
        if (!userMessage.trim() || loading) return

        setInput("")
        setMessages((prev) => [...prev, { role: "user", text: userMessage }])
        setLoading(true)

        const startTime = Date.now()

        try {
            const response = await fetch(
                "https://portfolio-chatbot.hi-59c.workers.dev/",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: userMessage }),
                }
            )
            const data = await response.json()

            // Ensure loading shows for at least 1.5 seconds
            const elapsed = Date.now() - startTime
            const minDelay = 1500
            if (elapsed < minDelay) {
                await new Promise((resolve) =>
                    setTimeout(resolve, minDelay - elapsed)
                )
            }

            setMessages((prev) => [...prev, { role: "bot", text: data.reply }])
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: "bot", text: "Sorry, something went wrong." },
            ])
        }

        setLoading(false)
    }

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <div style={greenDotStyle} />
                <span style={headerTitleStyle}>Ask Emsie</span>
            </div>

            {/* Messages Area */}
            <div style={messagesStyle} ref={messagesContainerRef}>
                {/* Welcome message */}
                <div style={welcomeMessageStyle}>
                    Hi! I am Emsie, Maud's portfolio assistant. Ask me anything
                    about her work, background, or services.
                </div>

                {/* Quick suggestions - only show if no messages yet */}
                {messages.length === 0 && (
                    <div style={suggestionsContainerStyle}>
                        <div style={suggestionsRowStyle}>
                            <button
                                style={suggestionButtonStyle}
                                onClick={() => sendMessage(quickQuestions[0])}
                            >
                                {quickQuestions[0]}
                            </button>
                            <button
                                style={suggestionButtonStyle}
                                onClick={() => sendMessage(quickQuestions[1])}
                            >
                                {quickQuestions[1]}
                            </button>
                        </div>
                        <div style={suggestionsRowStyle}>
                            <button
                                style={suggestionButtonStyle}
                                onClick={() => sendMessage(quickQuestions[2])}
                            >
                                {quickQuestions[2]}
                            </button>
                        </div>
                    </div>
                )}

                {/* Chat messages */}
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        style={{
                            ...messageContainerStyle,
                            alignItems:
                                msg.role === "user" ? "flex-end" : "flex-start",
                        }}
                    >
                        <div
                            style={{
                                ...messageStyle,
                                backgroundColor:
                                    msg.role === "user" ? "#000" : "#F4FFC0",
                                color: msg.role === "user" ? "#fff" : "#000",
                            }}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                    <div style={loadingContainerStyle}>
                        <div
                            style={{
                                ...loadingDotStyle,
                                transform: `scale(${loadingScale})`,
                                opacity: loadingScale === 1 ? 1 : 0.6,
                                transition:
                                    "transform 0.4s ease-in-out, opacity 0.4s ease-in-out",
                            }}
                        />
                        <span style={loadingTextStyle}>Thinking...</span>
                    </div>
                )}
            </div>

            {/* Bottom input area */}
            <div style={bottomStyle}>
                <div
                    style={{
                        ...inputContainerStyle,
                        border: isInputFocused
                            ? "1px solid #D2FF03"
                            : "1px solid transparent",
                    }}
                >
                    <input
                        style={inputStyle}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                        placeholder="How can I help you?"
                    />
                    <button
                        style={{
                            ...sendButtonStyle,
                            backgroundColor: isButtonHovered
                                ? "#D2FF03"
                                : "#000",
                        }}
                        onClick={() => sendMessage()}
                        onMouseEnter={() => setIsButtonHovered(true)}
                        onMouseLeave={() => setIsButtonHovered(false)}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            style={{ marginRight: "2px", marginTop: "1px" }}
                        >
                            <path
                                d="M22 2L11 13"
                                stroke={isButtonHovered ? "black" : "white"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M22 2L15 22L11 13L2 9L22 2Z"
                                stroke={isButtonHovered ? "black" : "white"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
                <div style={disclaimerStyle}>
                    This assistant is AI-powered and can make mistakes.
                    <br />
                    When in doubt, check with Maud.
                </div>
            </div>
        </div>
    )
}

// Styles
const containerStyle = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    fontFamily: "Inter, sans-serif",
    backgroundColor: "#F4F5F6",
    boxSizing: "border-box",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
}

const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "20px 30px",
    backgroundColor: "#F4F5F6",
    borderBottom: "1px solid #C5CACF",
}

const greenDotStyle = {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#D2FF03",
    border: "2px solid #000",
    boxSizing: "border-box",
}

const headerTitleStyle = {
    fontSize: "20px",
    fontWeight: 600,
    color: "#000",
}

const messagesStyle = {
    flex: 1,
    overflowY: "auto",
    padding: "20px 30px 16px 30px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
}

const welcomeMessageStyle = {
    backgroundColor: "#F4FFC0",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    lineHeight: "1.4",
    color: "#000",
    maxWidth: "335px",
}

const suggestionsContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "auto",
}

const suggestionsRowStyle = {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
}

const suggestionButtonStyle = {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #000",
    backgroundColor: "transparent",
    fontSize: "14px",
    cursor: "pointer",
    color: "#000",
    fontFamily: "Inter, sans-serif",
}

const messageContainerStyle = {
    display: "flex",
    flexDirection: "column",
    width: "100%",
}

const messageStyle = {
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    lineHeight: "1.4",
    maxWidth: "80%",
}

const loadingContainerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px",
}

const loadingDotStyle = {
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    backgroundColor: "#000",
}

const loadingTextStyle = {
    fontSize: "14px",
    color: "#000",
}

const bottomStyle = {
    padding: "0 30px 16px 30px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
}

const inputContainerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: "16px",
    gap: "16px",
    boxSizing: "border-box",
}

const inputStyle = {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    color: "#000",
    backgroundColor: "transparent",
}

const sendButtonStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    flexShrink: 0,
    transition: "background-color 0.2s ease",
}

const disclaimerStyle = {
    fontSize: "12px",
    color: "#000",
    textAlign: "center",
    lineHeight: "1.4",
}
