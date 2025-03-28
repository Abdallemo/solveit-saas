"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClockFadingIcon } from "lucide-react";
import { useState } from "react";

export default function ChatPage() {
    const [message, setMessage] = useState("");
    const [response, setResponse] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [show, setShow] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResponse(null);
        setError(null);

        try {
            const res = await fetch("/api/openai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });

            const data = await res.json();

            if (res.ok) {
                setResponse(data.answer);
            } else {
                setError(data.error || "Something went wrong");
            }
        } catch (err) {
            setError("Failed to fetch response");
            console.log(err);
        } finally {
            setLoading(false);
        }
    };
    function resetAll() {
        setResponse(null);
    }
    return (
        <>
            <Button onClick={() => setShow(prev => !prev)}>{`AI integration Test - Click to`} <span className="text-green-500"> {show ? "Hide" : "Show"}</span> </Button>
            {show && (

                <div className="max-w-md mx-auto p-4">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-2 ">
                        <Input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter ai test prompt"
                            className="border p-2 rounded"
                            required
                        />
                        <div className=" flex max-w-100  ">
                            <Button type="submit" className="bg-blue-500 text-white p-2 rounded w-80">
                                {loading ? "Loading..." : "Send"}
                            </Button>
                            <Button onClick={resetAll} type="reset" className="bg-gray-700 text-white p-2 rounded w-24">
                                <ClockFadingIcon />reset
                            </Button>
                        </div>
                    </form>

                    {error && <p className="text-red-500 mt-4">{error}</p>}

                    {response && (
                        <div className="mt-4 p-2 border rounded bg-background text-black">
                            <p className="font-semibold">AI Response:</p>
                            <p>{response}</p>
                        </div>
                    )}
                </div>

            )}
        </>
    );
}
