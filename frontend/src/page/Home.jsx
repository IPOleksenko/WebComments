import { useState } from "react";
import PostForm from "../components/postForm.jsx";

function Home() {
  const [message, setMessage] = useState("");

  return (
    <>
      <PostForm onMessage={setMessage} />
      {message && <p>{message}</p>}
    </>
  );
}

export default Home;
