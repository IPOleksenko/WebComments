import { useState, useRef } from "react";
import PostForm from "../components/postsForm.jsx";
import PostsList from "../components/postsList.jsx";

function Home() {
  const [message, setMessage] = useState("");
  const postsListRef = useRef();

  const handlePostCreated = () => {
    postsListRef.current?.reload();
  };

  return (
    <div className="home-page">
      <div className="home-container">
        <PostForm onMessage={setMessage} onPostCreated={handlePostCreated} />
        {message && <div className="message success">{message}</div>}
        <PostsList ref={postsListRef} />
      </div>
    </div>
  );
}

export default Home;
