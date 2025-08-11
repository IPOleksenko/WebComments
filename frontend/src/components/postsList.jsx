import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import PostForm from "./postsForm";

const API_URL = import.meta.env.VITE_API_URL;

const POSTS_PER_PAGE = 25; // Number of posts per page

function CommentsList({ comments, replyTo, setReplyTo, onReplySuccess }) {
  if (!comments || !comments.length) return null;

  return (
    <div style={{ marginLeft: 20, borderLeft: "2px solid #ccc", paddingLeft: 10 }}>
      {comments.map(({ id, username, text_html, created_at, replies, files }) => (
        <div key={id} style={{ marginBottom: 10 }}>
          <strong>{username}</strong>
          <div dangerouslySetInnerHTML={{ __html: text_html }} />
          <small>{new Date(created_at).toLocaleString()}</small>
          <br />
          <button onClick={() => setReplyTo(replyTo === id ? null : id)}>
            {replyTo === id ? "Cancel" : "Reply"}
          </button>

          {/* Render files for this comment */}
          {files && files.length > 0 && (
            <div>
              <h4>Files:</h4>
              {files.map((file, idx) => (
                <div key={idx}>
                  {file.content_type.startsWith("image") ? (
                    <img
                      src={`data:${file.content_type};base64,${file.file_base64}`}
                      alt={file.filename}
                      style={{ maxWidth: "100px", marginBottom: "10px" }}
                    />
                  ) : (
                    <div>
                      <a
                        href={`data:${file.content_type};base64,${file.file_base64}`}
                        download={file.filename}
                      >
                        Download {file.filename}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

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
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages

  const fetchPosts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/posts/get/?page=${page}&limit=${POSTS_PER_PAGE}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data.posts || []); // If data is empty, set an empty array
      setTotalPages(data.totalPages || 1); // Total number of pages
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
    fetchPosts(currentPage);
  }, [currentPage]);

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!posts.length) return <p>No posts found.</p>;

  return (
    <div>
      {posts.map(({ id, username, email, homepage_url, text_html, created_at, replies, files }) => (
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

          {/* Render files for the post */}
          {files && files.length > 0 && (
            <div>
              <h4>Files:</h4>
              {files.map((file, idx) => (
                <div key={idx}>
                  {file.content_type.startsWith("image") ? (
                    <img
                      src={`data:${file.content_type};base64,${file.file_base64}`}
                      alt={file.filename}
                      style={{ maxWidth: "100px", marginBottom: "10px" }}
                    />
                  ) : (
                    <div>
                      <a
                        href={`data:${file.content_type};base64,${file.file_base64}`}
                        download={file.filename}
                      >
                        Download {file.filename}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {replyTo === id && (
            <PostForm
              parentId={id}
              onMessage={(msg) => alert(msg)}
              onPostCreated={() => {
                fetchPosts(currentPage);
                setReplyTo(null);
              }}
            />
          )}

          <CommentsList
            comments={replies}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            onReplySuccess={() => {
              fetchPosts(currentPage);
              setReplyTo(null);
            }}
          />
        </div>
      ))}

      {/* Pagination controls */}
      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange("next")}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
});

export default PostsList;
