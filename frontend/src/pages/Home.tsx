import { useEffect, useState } from "react";

function Home() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/ping")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  useEffect(() => {
    window.location.replace("/admin");
  }, []);

  return (
    <div className="">
      <h1 className="">Welcome to the Home Page</h1>
      <p className="">
        <div className="p-4">TEST message: {message}</div>
      </p>
    </div>
  );
}

export default Home;
