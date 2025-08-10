import { useState, useRef } from "react";
import PostForm from "../components/postForm.jsx";
import PostsList from "../components/postsList.jsx";

function Home() {
  const [message, setMessage] = useState("");
  const postsListRef = useRef();

  const handlePostCreated = () => {
    postsListRef.current?.reload();
  };

  return (
    <>
      <PostForm onMessage={setMessage} onPostCreated={handlePostCreated} />
      {message && <p>{message}</p>}
      <PostsList ref={postsListRef} />
    </>
  );
}

export default Home;
