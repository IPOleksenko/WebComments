import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import PostForm from "./postsForm";

const API_URL = import.meta.env.VITE_API_URL;

function CommentsList({ comments, replyTo, setReplyTo, onReplySuccess }) {
  if (!comments || !comments.length) return null;

  return (
    <div style={{ marginLeft: 20, borderLeft: "2px solid #ccc", paddingLeft: 10 }}>
      {comments.map(({ id, username, text_html, created_at, replies }) => (
        <div key={id} style={{ marginBottom: 10 }}>
          <strong>{username}</strong>
          <div dangerouslySetInnerHTML={{ __html: text_html }} />
          <small>{new Date(created_at).toLocaleString()}</small>
          <br />
          <button onClick={() => setReplyTo(replyTo === id ? null : id)}>
            {replyTo === id ? "Cancel" : "Reply"}
          </button>

          {replyTo === id && (
            <PostForm
              parentId={id}
              onMessage={(msg) => alert(msg)}
              onPostCreated={onReplySuccess}
            />
          )}

          {/* Recursively render nested comments */}
          <CommentsList
            comments={replies}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            onReplySuccess={onReplySuccess}
          />
        </div>
      ))}
    </div>
  );
}

const PostsList = forwardRef((props, ref) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/posts/get/`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    reload: fetchPosts,
  }));

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!posts.length) return <p>No posts found.</p>;

  return (
    <div>
      {posts.map(({ id, username, email, homepage_url, text_html, created_at, replies }) => (
        <div key={id} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}>
          <p><strong>{username}</strong> ({email})</p>
          {homepage_url && (
            <p>
              <a href={homepage_url} target="_blank" rel="noopener noreferrer">
                {homepage_url}
              </a>
            </p>
          )}
          <div dangerouslySetInnerHTML={{ __html: text_html }} />
          <small>Posted on: {new Date(created_at).toLocaleString()}</small>
          <br />
          <button onClick={() => setReplyTo(replyTo === id ? null : id)}>
            {replyTo === id ? "Cancel" : "Reply"}
          </button>

          {replyTo === id && (
            <PostForm
              parentId={id}
              onMessage={(msg) => alert(msg)}
              onPostCreated={() => {
                fetchPosts();
                setReplyTo(null);
              }}
            />
          )}

          <CommentsList
            comments={replies}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            onReplySuccess={() => {
              fetchPosts();
              setReplyTo(null);
            }}
          />
        </div>
      ))}
    </div>
  );
});

export default PostsList;
