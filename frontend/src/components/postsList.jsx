import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import PostForm from "./postsForm";

const API_URL = import.meta.env.VITE_API_URL;
const POSTS_PER_PAGE = 25;

function CommentsList({ comments, replyTo, setReplyTo, onReplySuccess, openLightbox }) {
  if (!comments || comments.length === 0) return null;

  return (
    <div className="comments-list" style={{ marginLeft: 20 }}>
      {comments.map(({ id, username, text_html, created_at, replies = [], files = [] }) => {
        const fixedHtml = text_html.replace(/\n/g, "<br />");
        return (
          <div
            key={id}
            className="comment-item"
            style={{ borderLeft: "2px solid #ccc", paddingLeft: 10, marginBottom: 10 }}
          >
            <div className="comment-header">
              <strong>{username}</strong>
            </div>
            <div className="comment-content" dangerouslySetInnerHTML={{ __html: fixedHtml }} />
            <div className="comment-date" style={{ fontSize: 12, color: "#666" }}>
              {new Date(created_at).toLocaleString()}
            </div>

            <button
              className="button"
              onClick={() => setReplyTo(replyTo === id ? null : id)}
              style={{ marginTop: 6, marginBottom: 6 }}
            >
              {replyTo === id ? "Cancel" : "Reply"}
            </button>

            {files.length > 0 && (
              <div className="files-section" style={{ marginBottom: 8 }}>
                <h4>Files:</h4>
                {files.map((file, idx) => (
                  <div key={idx} className="file-item" style={{ marginBottom: 4 }}>
                    {file.content_type.startsWith("image") ? (
                      <img
                        src={`data:${file.content_type};base64,${file.file_base64}`}
                        alt={file.filename}
                        className="file-image"
                        style={{ maxWidth: "150px", cursor: "pointer" }}
                        onClick={() =>
                          openLightbox(`data:${file.content_type};base64,${file.file_base64}`, file.filename)
                        }
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
                  if (!msg.startsWith("Error: File")) alert(msg);
                }}
                onPostCreated={onReplySuccess}
              />
            )}

            <CommentsList
              comments={replies}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              onReplySuccess={onReplySuccess}
              openLightbox={openLightbox}
            />
          </div>
        );
      })}
    </div>
  );
}

const PostsList = forwardRef((props, ref) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lightbox, setLightbox] = useState({ isOpen: false, src: "", alt: "" });
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "desc" });
  const [expandedPosts, setExpandedPosts] = useState(new Set());

  const openLightbox = (src, alt) => setLightbox({ isOpen: true, src, alt });
  const closeLightbox = () => setLightbox({ isOpen: false, src: "", alt: "" });

  const fetchPosts = async (page = 1, sortBy = sortConfig.key, sortOrder = sortConfig.direction) => {
    setLoading(true);
    setError("");
    try {
      const url = new URL(`${API_URL}/api/posts/get/`);
      url.searchParams.append("page", page);
      url.searchParams.append("limit", POSTS_PER_PAGE);
      url.searchParams.append("sort_by", sortBy);
      url.searchParams.append("sort_order", sortOrder);

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data.posts || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    reload: () => fetchPosts(currentPage, sortConfig.key, sortConfig.direction),
  }));

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
    fetchPosts(1, key, direction);
  };

  const handlePageChange = (direction) => {
    let newPage = currentPage;
    if (direction === "next" && currentPage < totalPages) {
      newPage = currentPage + 1;
    } else if (direction === "prev" && currentPage > 1) {
      newPage = currentPage - 1;
    }
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      fetchPosts(newPage, sortConfig.key, sortConfig.direction);
    }
  };

  const toggleComments = (postId) => {
    setExpandedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
  };

  useEffect(() => {
    fetchPosts(currentPage, sortConfig.key, sortConfig.direction);
  }, [currentPage, sortConfig.key, sortConfig.direction]);

  if (loading) return <p className="loading">Loading posts...</p>;
  if (error) return <p className="error">Error: {error}</p>;
  if (!posts.length) return <p className="loading">No posts found.</p>;

  return (
    <div className="posts-list-container">
      <table className="posts-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th onClick={() => handleSort("id")} className="sortable" style={{ cursor: "pointer" }}>
              ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("username")} className="sortable" style={{ cursor: "pointer" }}>
              User Name {sortConfig.key === "username" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("email")} className="sortable" style={{ cursor: "pointer" }}>
              E-mail {sortConfig.key === "email" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => handleSort("created_at")} className="sortable" style={{ cursor: "pointer" }}>
              Date {sortConfig.key === "created_at" && (sortConfig.direction === "asc" ? "↑" : "↓")}
            </th>
            <th>Text</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {posts.map(({ id, username, email, homepage_url, text_html, created_at, replies = [], files = [] }) => {
            const isExpanded = expandedPosts.has(id);
            const fixedHtml = text_html.replace(/\n/g, "<br />");
            return (
              <React.Fragment key={id}>
                <tr>
                  <td>{id}</td>
                  <td>{username}</td>
                  <td>{email}</td>
                  <td>{new Date(created_at).toLocaleString()}</td>
                  <td>
                    <div dangerouslySetInnerHTML={{ __html: fixedHtml }} />
                    {homepage_url && (
                      <p>
                        <a href={homepage_url} target="_blank" rel="noopener noreferrer">
                          {homepage_url}
                        </a>
                      </p>
                    )}
                    {files.length > 0 && (
                      <div>
                        <h4>Files:</h4>
                        {files.map((file, idx) =>
                          file.content_type.startsWith("image") ? (
                            <img
                              key={idx}
                              src={`data:${file.content_type};base64,${file.file_base64}`}
                              alt={file.filename}
                              style={{ maxWidth: 150, cursor: "pointer", marginRight: 5 }}
                              onClick={() => openLightbox(`data:${file.content_type};base64,${file.file_base64}`, file.filename)}
                            />
                          ) : (
                            <a
                              key={idx}
                              href={`data:${file.content_type};base64,${file.file_base64}`}
                              download={file.filename}
                              style={{ display: "inline-block", marginRight: 10 }}
                            >
                              Download {file.filename}
                            </a>
                          )
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      className="button"
                      onClick={() => setReplyTo(replyTo === id ? null : id)}
                    >
                      {replyTo === id ? "Cancel" : "Reply"}
                    </button>

                    {replies.length > 0 && (
                      <button
                        className="button"
                        style={{ marginLeft: 8 }}
                        onClick={() => toggleComments(id)}
                      >
                        {isExpanded ? "Hide comments" : "Show comments"}
                      </button>
                    )}
                  </td>
                </tr>

                {replyTo === id && (
                  <tr>
                    <td colSpan={6} style={{ background: "#eef3f7", padding: "10px 20px" }}>
                      <PostForm
                        parentId={id}
                        onMessage={(msg) => {
                          if (!msg.startsWith("Error: File")) alert(msg);
                        }}
                        onPostCreated={() => {
                          fetchPosts(currentPage, sortConfig.key, sortConfig.direction);
                          setReplyTo(null);
                        }}
                      />
                    </td>
                  </tr>
                )}

                {isExpanded && (
                  <tr>
                    <td colSpan={6} style={{ background: "#f9f9f9", padding: "10px 20px" }}>
                      <CommentsList
                        comments={replies}
                        replyTo={replyTo}
                        setReplyTo={setReplyTo}
                        onReplySuccess={() => {
                          fetchPosts(currentPage, sortConfig.key, sortConfig.direction);
                          setReplyTo(null);
                        }}
                        openLightbox={openLightbox}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      <div className="pagination" style={{ marginTop: 10 }}>
        <button className="button" onClick={() => handlePageChange("prev")} disabled={currentPage === 1}>
          Previous
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button className="button" onClick={() => handlePageChange("next")} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      {lightbox.isOpen && (
        <div
          className="lightbox-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closeLightbox}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative" }}>
            <button
              onClick={closeLightbox}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                fontSize: 24,
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <img src={lightbox.src} alt={lightbox.alt} style={{ maxHeight: "80vh", maxWidth: "80vw" }} />
            <div style={{ color: "#fff", textAlign: "center", marginTop: 8 }}>{lightbox.alt}</div>
          </div>
        </div>
      )}
    </div>
  );
});

export default PostsList;
