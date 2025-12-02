document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = 'https://blogy-java-module4-blogy-java-md4.onrender.com/api';
  const ENDPOINT = '/blog';

  const overlayer = document.getElementById('overlayer');
  const loader = document.querySelector('.loader');

  const coverEl = document.querySelector('.site-cover');
  const titleEl = document.querySelector('.post-entry h1');
  const authorFigureImg = document.querySelector('.post-meta figure img');
  const authorNameSpan = document.querySelector('.post-meta span.d-inline-block');
  const dateSpan = document.querySelector('.post-meta .timeSpan');
  const contentEl = document.querySelector('.post-content-body');
  const commentsContainer = document.querySelector('.comment-list');
  const bio = document.querySelector('.bio');

  // comment DOM refs
  const commentForm = document.getElementById('commentForm');
  const commentTextarea = document.getElementById('message');
  const commentSubmitBtn = document.getElementById('commentSubmit');
  const authOpenBtn = document.getElementById('openAuthModal'); // optional

  // small helpers for loader
  function showLoader(message) {
    if (overlayer) overlayer.style.display = 'block';
    if (loader) loader.style.display = 'block';
    if (loader && message) loader.setAttribute('data-msg', message);
  }
  function hideLoader() {
    if (overlayer) overlayer.style.display = 'none';
    if (loader) loader.style.display = 'none';
    if (loader) loader.removeAttribute('data-msg');
  }

  function showError(message = 'Không tìm thấy bài viết') {
    if (contentEl) {
      contentEl.innerHTML = `<div class="alert alert-danger">${escapeHtml(message)}</div>`;
    }
    if (titleEl) titleEl.textContent = 'Bài viết không tìm thấy';
    if (authorNameSpan) authorNameSpan.textContent = '';
    if (dateSpan) dateSpan.textContent = '';
  }

  const avatarCache = new Map();

  async function getUserAvatar(userId) {
    if (!userId) return 'images/person_1.jpg';
    if (avatarCache.has(userId)) return avatarCache.get(userId);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Accept': 'application/json' };
      if (token) headers['Authorization'] = 'Bearer ' + token;

      // try singular then plural
      let res = await fetch(`${API_BASE}/user/${encodeURIComponent(userId)}`, { method: 'GET', headers });
      if (res.status === 404) {
        res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}`, { method: 'GET', headers });
      }
      if (!res.ok) {
        console.warn('getUserAvatar: fetch returned', res.status);
        return 'images/person_1.jpg';
      }
      const json = await res.json();
      const avatar = json.avatar || json.data?.avatar || json.user?.avatar || json.data?.user?.avatar || 'images/person_1.jpg';
      avatarCache.set(userId, avatar);
      return avatar;
    } catch (err) {
      console.error('getUserAvatar error', err);
      return 'images/person_1.jpg';
    }
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return isNaN(d.getTime()) ? '' : d.toLocaleString();
    } catch {
      return iso || '';
    }
  }

  function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe).replace(/[&<"'>]/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m];
    });
  }

  // --- Post loading & rendering ---
  async function loadPostById(id) {
    if (!id) {
      showError('Thiếu id bài viết trong url');
      return null;
    }
    showLoader();
    try {
      const resp = await fetch(`${API_BASE}${ENDPOINT}/${encodeURIComponent(id)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!resp.ok) {
        if (resp.status === 404) {
          const altResp = await fetch(`${API_BASE}/blog/${encodeURIComponent(id)}`);
          if (altResp.ok) {
            const altJson = await altResp.json();
            const post = normalizeResponse(altJson);
            return post;
          }
        }
        throw new Error(`Fetch failed: ${resp.status}`);
      }
      const json = await resp.json();
      return normalizeResponse(json);
    } catch (err) {
      console.error(err);
      showError('Lỗi khi tải bài viết');
      return null;
    } finally {
      hideLoader();
    }
  }

  function normalizeResponse(res) {
    if (!res) return null;
    if (res.data && !Array.isArray(res.data)) return res.data;
    if (res.post) return res.post;
    if (res.blog) return res.blog;
    if (res.item) return res.item;
    if (res.doc) return res.doc;
    if (res.payload) return res.payload;
    if (res._id || res.id) return res;
    if (Array.isArray(res.content) && res.content.length) return res.content[0];
    if (Array.isArray(res.docs) && res.docs.length) return res.docs[0];
    if (Array.isArray(res.items) && res.items.length) return res.items[0];
    if (Array.isArray(res.data) && res.data.length) return res.data[0];
    return null;
  }

  async function renderPost(post) {
    if (!post) {
      showError('Không có dữ liệu bài viết');
      return;
    }

    const title = post.title || '';
    const authorName = post.authorName || post.author || "Unknown";
    const createdAt = post.createdAt || post.createdAtAt || post.created_at;
    const image = post.img || post.image || post.cover || '';
    const content = post.content || post.body || '';

    if (titleEl) titleEl.textContent = title;
    if (coverEl && image) coverEl.style.backgroundImage = `url('${escapeHtml(image)}')`;

    if (authorFigureImg) {
      // try to set avatar, but don't await blocking UI (we can set later)
      getUserAvatar(post.authorId || post.author || post.author_id).then(av => authorFigureImg.src = av).catch(()=>{});
    }
    if (authorNameSpan) authorNameSpan.textContent = `By ${authorName}`;
    if (dateSpan) dateSpan.textContent = formatDate(createdAt);

    if (bio) {
      const bioH2 = bio.querySelector('h2');
      if (bioH2) bioH2.textContent = authorName;
      const bioImg = bio.querySelector('img');
      if (bioImg) {
        const authorAvatar = await getUserAvatar(post.authorId);
        bioImg.src = authorAvatar;
      }
    }

    if (contentEl) {
      contentEl.innerHTML = content
        ? `
          <p>${content}</p>
          ${image ? `
            <div class="row my-4">
              <div class="col-md-12 mb-4">
                <img src="${escapeHtml(image)}" alt="Image placeholder" class="img-fluid rounded blog-image">
              </div>
            </div>` : ''
        }`
        : '<p>Không có nội dung hiển thị</p>';
    }

    // update title tag
    if (title) document.title = `${title} — Blogy`;
  }

  // --- Comments: fetch, render, post ---
  async function fetchComments(postId) {
    if (!postId) return [];
    showLoader();
  
      try {
        const res = await fetch(`${API_BASE}/comment/${postId}`, { method: 'GET', headers: { 'Accept': 'application/json' } });
        const json = await res.json();
        // normalize comment list: try different shapes
        if (Array.isArray(json)) return json;
        if (Array.isArray(json.data)) return json.data;
        if (Array.isArray(json.comments)) return json.comments;
        if (Array.isArray(json.items)) return json.items;
        if (Array.isArray(json.docs)) return json.docs;
  
        if (json.data && Array.isArray(json.data.docs)) return json.data.docs;
        if (json.payload && Array.isArray(json.payload)) return json.payload;
  
        if (json && (json.content || json.body || json._id)) return [json];
      } catch (err) {
        console.warn('fetchComments try failed', err);
      } finally {
        hideLoader();
      }
    hideLoader();
    return [];
  }

  // render a tree of comments into commentsContainer
  async function renderComments(comments = []) {
    document.querySelector('.commnent-count').textContent = `${Array.isArray(comments) ? comments.length : 0} Comments`;
    document.querySelector('.comment-list').innerHTML = ''; 

    if (!Array.isArray(comments) || comments.length === 0) {
      document.querySelector('.comment-list').innerHTML = '<p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>';
      return;
    }

    let commentHtml = '';
    for (const comment of comments) {
       commentHtml += `
       <li class="comment">
        <div class="vcard">
            <img src="${comment.userAvatar}" alt="Image placeholder">
        </div>
        <div class="comment-body">
            <h3>${comment.userName}</h3>
            <div class="meta">${formatDate(comment.createdAt)}</div>
            <p>${comment.content}</p>
        </div>
        </li>
       `; 
    }

    commentsContainer.innerHTML = commentHtml;
  }

  // post comment
  async function postComment(postId, message) {
    if (!postId || !message) return false;
    const token = localStorage.getItem('token');
    if (!token) {
      if (authOpenBtn) authOpenBtn.click();
      else alert('Please sign in to post a comment');
      return false;
    }

    setCommentSubmitting(true);
    showLoader('Posting comment...');

    const body = {
        blogId: postId,
        content: message 
    };
    let lastError;

    try {
    const res = await fetch(`${API_BASE}/comment`, {
        method: 'POST',
        headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        lastError = new Error(`Fetch failed: ${res.status}`);
    }

    // success
    await res.json().catch(() => {});
    // refresh comments
    const rootComments = await fetchComments(postId);
    await renderComments(rootComments);
    if (commentTextarea) commentTextarea.value = '';
    setCommentSubmitting(false);
    hideLoader();
    return true;
    } catch (err) {
    lastError = err;
    }

    console.error('postComment failed', lastError);
    alert('Posting comment failed. Try again.');
    setCommentSubmitting(false);
    hideLoader();
    return false;
  }

  function setCommentSubmitting(submitting = true) {
    if (!commentSubmitBtn) return;
    commentSubmitBtn.disabled = submitting;
    if (submitting) {
      commentSubmitBtn.dataset.orig = commentSubmitBtn.textContent || 'Post Comment';
      commentSubmitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Posting...`;
    } else {
      commentSubmitBtn.innerHTML = commentSubmitBtn.dataset.orig || 'Post Comment';
    }
  }

  // attach form events (uses postComment defined above)
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = (commentTextarea?.value || '').trim();
      if (!message) return;
      const params = new URLSearchParams(window.location.search);
      const postId = params.get('id') || params.get('postId') || params.get('_id');
      await postComment(postId, message);
    });
  }

  if (commentSubmitBtn) {
    commentSubmitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const message = (commentTextarea?.value || '').trim();
      if (!message) return;
      const params = new URLSearchParams(window.location.search);
      const postId = params.get('id') || params.get('postId') || params.get('_id');
      await postComment(postId, message);
    });
  }

  // init flow
  (async function init() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || params.get('postId') || params.get('_id');

    if (!id) {
      showError('Thiếu id bài viết trong url (ví dụ ?id=xxxxx)');
      return;
    }

    const post = await loadPostById(id);
    if (!post) return;
    await renderPost(post);

    // load comments after post rendered
    const comments = await fetchComments(id);
    await renderComments(comments);
  })();

}); // DOMContentLoaded end
