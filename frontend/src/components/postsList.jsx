import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import PostForm from "./postsForm";

const API_URL = import.meta.env.VITE_API_URL;

const POSTS_PER_PAGE = 25; // Number of posts per page

function CommentsList({ comments, replyTo, setReplyTo, onReplySuccess, openLightbox }) {
  if (!comments || !comments.length) return null;

  return (
    <div className="comments-list">
      {comments.map(({ id, username, text_html, created_at, replies, files }) => (
        <div key={id} className="comment-item">
          <div className="comment-header">
            <span className="comment-username">{username}</span>
          </div>
          <div className="comment-content" dangerouslySetInnerHTML={{ __html: text_html }} />
          <div className="comment-date">{new Date(created_at).toLocaleString()}</div>
          <button className="reply-button" onClick={() => setReplyTo(replyTo === id ? null : id)}>
            {replyTo === id ? "Cancel" : "Reply"}
          </button>

          {/* Render files for this comment */}
          {files && files.length > 0 && (
            <div className="files-section">
              <h4>Files:</h4>
              {files.map((file, idx) => (
                <div key={idx} className="file-item">
                  {file.content_type.startsWith("image") ? (
                    <img
                      src={`data:${file.content_type};base64,${file.file_base64}`}
                      alt={file.filename}
                      className="file-image"
                      onClick={() => openLightbox(`data:${file.content_type};base64,${file.file_base64}`, file.filename)}
                    />
                  ) : (
                    <div>
                      <a
                        href={`data:${file.content_type};base64,${file.file_base64}`}
                        download={file.filename}
                        className="file-download"
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
              onMessage={(msg) => {
                // Don't show alerts for file errors as they're displayed in the form
                if (!msg.startsWith("Error: File")) {
                  alert(msg);
                }
              }}
              onPostCreated={onReplySuccess}
            />
          )}

          {/* Recursively render nested comments */}
          <CommentsList
            comments={replies}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            onReplySuccess={onReplySuccess}
            openLightbox={openLightbox}
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
  const [lightbox, setLightbox] = useState({ isOpen: false, src: "", alt: "" });

  const openLightbox = (src, alt) => {
    setLightbox({ isOpen: true, src, alt });
  };

  const closeLightbox = () => {
    setLightbox({ isOpen: false, src: "", alt: "" });
  };

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

  if (loading) return <p className="loading">Loading posts...</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (!posts.length) return <p className="loading">No posts found.</p>;

  return (
    <div className="posts-list-container">
      {posts.map(({ id, username, email, homepage_url, text_html, created_at, replies, files }) => (
        <div key={id} className="post-item">
          <div className="post-header">
            <span className="post-username">{username}</span>
            <span className="post-email">{email}</span>
          </div>
          {homepage_url && (
            <p className="post-homepage">
              <a href={homepage_url} target="_blank" rel="noopener noreferrer">
                {homepage_url}
              </a>
            </p>
          )}
          <div className="post-content" dangerouslySetInnerHTML={{ __html: text_html }} />
          <div className="post-date">Posted on: {new Date(created_at).toLocaleString()}</div>
          <button className="reply-button" onClick={() => setReplyTo(replyTo === id ? null : id)}>
            {replyTo === id ? "Cancel" : "Reply"}
          </button>

          {/* Render files for the post */}
          {files && files.length > 0 && (
            <div className="files-section">
              <h4>Files:</h4>
              {files.map((file, idx) => (
                <div key={idx} className="file-item">
                  {file.content_type.startsWith("image") ? (
                    <img
                      src={`data:${file.content_type};base64,${file.file_base64}`}
                      alt={file.filename}
                      className="file-image"
                      onClick={() => openLightbox(`data:${file.content_type};base64,${file.file_base64}`, file.filename)}
                    />
                  ) : (
                    <div>
                      <a
                        href={`data:${file.content_type};base64,${file.file_base64}`}
                        download={file.filename}
                        className="file-download"
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
              onMessage={(msg) => {
                if (!msg.startsWith("Error: File")) {
                  alert(msg);
                }
              }}
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
            openLightbox={openLightbox}
          />
        </div>
      ))}

      {/* Pagination controls */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange("prev")}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange("next")}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      
      {/* Lightbox */}
      {lightbox.isOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <span className="lightbox-close" onClick={closeLightbox}>&times;</span>
            <img src={lightbox.src} alt={lightbox.alt} className="lightbox-image" />
            <div className="lightbox-caption">{lightbox.alt}</div>
          </div>
        </div>
      )}
    </div>
  );
});

export default PostsList;
