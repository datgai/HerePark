import { useEffect, useState } from "react";
import { BrowserRouter as Routes, Route } from "react-router-dom";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/ping")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">React + FastAPI + Docker</h1>
      <p>Backend says: {message || "Loading..."}</p>
    </div>
  );
}

export default App;
