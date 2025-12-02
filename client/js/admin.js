const btnLogout = document.getElementById('btn-logout');

btnLogout?.addEventListener('click', (e) => {
  e.preventDefault();
  if (!confirm('Log out from admin?')) return;
  if (typeof window.logout === 'function') {
    window.logout('login.html');
    return;
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
  window.location.href = 'index.html';
});

const API_BASE = 'https://blogy-java-module4-blogy-java-md4.onrender.com/api';
const usersTableBody = document.querySelector('#usersTable tbody');

async function loadUsers() {
  showLoader();
  try {
    const token = localStorage.getItem('token');
    const resp = await fetch(`${API_BASE}/user/all`, {
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    });

    if (resp.status === 401 || resp.status === 403) {
      // unauthorized or not admin
      alert('Unauthorized. Please login again.');
      logout?.('index.html');
      return;
    }

    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

    const json = await resp.json();

    // Normalize to array: support common shapes: [..], {data: [...]}, {users: [...]}, {items: [...]} etc.
    let users = [];
    if (Array.isArray(json)) users = json;
    else if (Array.isArray(json.data)) users = json.data;
    else if (Array.isArray(json.users)) users = json.users;
    else if (Array.isArray(json.items)) users = json.items;
    else if (Array.isArray(json.docs)) users = json.docs;
    else if (json && json.result && Array.isArray(json.result)) users = json.result;
    else if (json && json.user) users = Array.isArray(json.user) ? json.user : [json.user];
    else users = [];

    renderUsers(users);
  } catch (err) {
    console.error('loadUsers error', err);
    if (usersTableBody) {
      usersTableBody.innerHTML = `<tr><td colspan="6" class="text-danger">Failed to load users</td></tr>`;
    }
  } finally {
    hideLoader();
  }
}

function renderUsers(users) {
  if (!usersTableBody) return;
  usersTableBody.innerHTML = '';

  if (!users || users.length === 0) {
    usersTableBody.innerHTML = `<tr><td colspan="6" class="text-muted">No users found</td></tr>`;
    return;
  }

  users.forEach((u, idx) => {
    const id = u._id || u.id || '';
    const email = u.email || '';
    const name = u.displayName || u.fullName || u.username || '';
    const avatar = u.avatar || u.avatarUrl || u.image || 'images/person_1.jpg';
    const role = Array.isArray(u.roles) ? u.roles.join(', ') : (u.role || 'user');
    const createdAt = u.createdAt || u.created_at || u.created || '';

    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${email}</td>
      <td>${name}</td>
      <td><img src="${avatar}" alt="avatar" style="width:36px;height:36px;border-radius:50%;object-fit:cover;"></td>
      <td>${role}</td>
      <td>${createdAt ? new Date(createdAt).toLocaleString() : ''}</td>
    `;
    usersTableBody.appendChild(tr);
  });
}

(async () => {
  await loadUsers();
})();

function showLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'block';
}

function hideLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'none';
}

(function () {
        const API_BASE = 'https://blogy-java-module4-blogy-java-md4.onrender.com/api';
        const token = localStorage.getItem('token');
        const postsListEl = document.getElementById('postsList');
        const noPostsEl = document.getElementById('noPosts');
        const refreshBtn = document.getElementById('btn-refresh-posts');
        const postsInfo = document.getElementById('postsInfo');
        const postsPagination = document.getElementById('postsPagination');
        const perPageSelect = document.getElementById('perPageSelect');

        // pagination state
        let currentPage = 0;
        let totalPages = 1;
        let totalItems = 0;
        let limit = parseInt(perPageSelect.value || '10', 10);

        // modal elements
        const editModalEl = new bootstrap.Modal(document.getElementById('editPostModal'));
        const editForm = document.getElementById('editPostForm');
        const editPostId = document.getElementById('editPostId');
        const editTitle = document.getElementById('editTitle');
        const editDescription = document.getElementById('editDescription');
        const editContent = document.getElementById('editContent');
        const editLocation = document.getElementById('editLocation');
        const editStatus = document.getElementById('editStatus');
        const editImagePreview = document.getElementById('editImagePreview');
        const editImageFile = document.getElementById('editImageFile');
        const removeImageBtn = document.getElementById('removeImageBtn');

        // events
        refreshBtn.addEventListener('click', () => loadPosts(currentPage));
        perPageSelect.addEventListener('change', () => {
          limit = parseInt(perPageSelect.value, 10);
          currentPage = 0;
          loadPosts(currentPage);
        });

        async function loadPosts(page = 0) {
          postsListEl.innerHTML = '';
          noPostsEl.style.display = 'none';
          postsPagination.innerHTML = '';
          postsInfo.textContent = 'Loading...';

          try {
            const resp = await fetch(`${API_BASE}/blog/all?page=${page}&size=${limit}&sort=createdDate,desc`, {
              headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!resp.ok) throw new Error('Failed to load posts');
            const res = await resp.json();
            const data = res.content;
            console.lo
            // normalize posts array
            let posts;
            if (Array.isArray(data)) posts = data;
            else if (Array.isArray(data.items)) posts = data.items;
            else if (Array.isArray(data.content)) posts = data.content;
            else if (Array.isArray(data.data)) posts = data.data;
            else if (Array.isArray(data.posts)) posts = data.posts;
            else if (Array.isArray(data.docs)) posts = data.docs;
            else if (data && (data._id || data.id)) posts = [data];
            else posts = [];

            // parse pagination info
            // different backend shapes: { total, page, limit, totalPages } or { totalItems, page, pageSize } or Spring-style { content, totalPages, number, size }
            const metaTotal = data.total ?? data.totalItems ?? data.totalDocs ?? data.count ?? (Array.isArray(data.items) ? (data.items.length) : null);
            const metaPage = data.page ?? data.currentPage ?? data.number ?? page;
            const metaLimit = data.limit ?? data.pageSize ?? data.size ?? limit;
            const metaTotalPages = data.totalPages ?? data.pages ?? (metaTotal && metaLimit ? Math.ceil(metaTotal / metaLimit) : null);

            totalItems = metaTotal ?? res.totalElements;
            currentPage = Number(metaPage ?? page);
            totalPages = res.totalPages-1;

            console.log({ totalItems, currentPage, totalPages });

            if (!posts || posts.length === 0) {
              noPostsEl.style.display = 'block';
              postsInfo.textContent = `No posts`;
              return;
            }

            posts.forEach(p => renderPostCard(p));
            renderPagination();
            updatePostsInfo();
          } catch (err) {
            console.error(err);
            noPostsEl.textContent = 'Không thể tải bài viết';
            noPostsEl.style.display = 'block';
            postsInfo.textContent = '';
          }
        }

        function updatePostsInfo() {
          const start = currentPage  * limit + 1;
          const end = Math.min(totalItems, currentPage * limit + limit);
          postsInfo.textContent = `Showing ${start}-${end} of ${totalItems}`;
        }

        function renderPagination() {
          postsPagination.innerHTML = '';
          if (totalPages <= 0) return;

          const createPageItem = (label, page, disabled = false, active = false) => {
            const li = document.createElement('li');
            li.className = `page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-page="${page}">${label}</a>`;
            li.querySelector('a').addEventListener('click', (e) => {
              e.preventDefault();
              if (disabled || active) return;
              loadPosts(page);
            });
            return li;
          };


          postsPagination.appendChild(createPageItem('Prev', Math.max(1, currentPage - 1), currentPage === 1));

          const maxButtons = 7;
          let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
          let endPage = startPage + maxButtons - 1;
          if (endPage > totalPages) {
            endPage = totalPages;
            startPage = Math.max(1, endPage - maxButtons + 1);
          }

          if (startPage > 0) {
            postsPagination.appendChild(createPageItem('0', 0, false, currentPage === 0));
            if (startPage > 1) {
              const li = document.createElement('li');
              li.className = 'page-item disabled';
              li.innerHTML = `<span class="page-link">…</span>`;
              postsPagination.appendChild(li);
            }
          }

          for (let p = startPage; p <= endPage; p++) {
            postsPagination.appendChild(createPageItem(p, p, false, p === currentPage));
          }

          if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
              const li = document.createElement('li');
              li.className = 'page-item disabled';
              li.innerHTML = `<span class="page-link">…</span>`;
              postsPagination.appendChild(li);
            }
            postsPagination.appendChild(createPageItem(totalPages, totalPages, false, currentPage === totalPages));
          }

          // Next
          postsPagination.appendChild(createPageItem('Next', Math.min(totalPages, currentPage + 1), currentPage === totalPages));
        }

        // render, open edit modal etc.
        function renderPostCard(post) {
          const col = document.createElement('div');
          col.className = 'col-12';

          const card = document.createElement('div');
          card.className = 'card post-card shadow-sm p-2';
          card.dataset.id = post._id || post.id;

          card.innerHTML = `
            <div class="row g-2 align-items-center">
              <div class="col-md-2">
                <img src="${post.img || 'images/img_1_sq.jpg'}" class="post-thumb" alt="thumb">
              </div>
              <div class="col-md-7">
                <h5 class="mb-1">${escapeHtml(post.title)}</h5>
                <p class="mb-1 text-muted small">${escapeHtml(post.shortDescription || (post.content || '').slice(0,120))}</p>
                <div class="small text-muted">${post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</div>
              </div>
              <div class="col-md-3 text-end post-actions">
                <div class="d-flex justify-content-end gap-2">
                  <button class="btn btn-sm btn-outline-danger btn-delete">Delete</button>
                </div>
                <div class="mt-2">
                  <select class="form-select form-select-sm status-select">
                    <option value="true"  ${post.isPublic ? 'selected' : ''}>Published</option>
                    <option value="false" ${!post.isPublic ? 'selected' : ''}>Private</option>
                </select>
                </div>
              </div>
            </div>
          `;

          // set initial select value
          const statusSelect = card.querySelector('.status-select');
          statusSelect.value = String(Boolean(post.isPublic));

          // button handlers
          card.querySelector('.btn-delete').addEventListener('click', () => deletePost(post._id || post.id, card));
         statusSelect.addEventListener('change', (e) => updateStatus(post._id || post.id, e.target.value === 'true'));

          col.appendChild(card);
          postsListEl.appendChild(col);
        }

        editImageFile.addEventListener('change', () => {
          const f = editImageFile.files[0];
          if (f) {
            editImagePreview.src = URL.createObjectURL(f);
            editImagePreview.style.display = 'block';
            removeImageBtn.style.display = 'inline-block';
          }
        });

        removeImageBtn.addEventListener('click', () => {
          editImagePreview.src = '';
          editImagePreview.style.display = 'none';
          removeImageBtn.style.display = 'none';
          editImageFile.value = '';
          editImageFile.dataset.remove = '1';
        });

        editForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const id = editPostId.value;
          const formData = new FormData();
          formData.append('title', editTitle.value);
          formData.append('shortDes', editDescription.value);
          formData.append('content', editContent.value);
          formData.append('location', editLocation.value);
          formData.append('isPublic', editStatus.value);
          const file = editImageFile.files[0];
          if (file) formData.append('file', file);

          try {
            const resp = await fetch(`${API_BASE}/blog/${id}`, {
              method: 'PUT',
              headers: { 'Authorization': 'Bearer ' + token },
              body: formData
            });
            if (!resp.ok) {
              const text = await resp.text();
              throw new Error(text || 'Update failed');
            }
            editModalEl.hide();
            await loadPosts(currentPage);
          } catch (err) {
            console.error(err);
            alert('Cập nhật thất bại: ' + (err.message || ''));
          }
        });

        async function deletePost(id, cardEl) {
          if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
          try {
            const resp = await fetch(`${API_BASE}/blog/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!resp.ok) throw new Error('Delete failed');
            // reload current page to update counts
            await loadPosts(currentPage);
          } catch (err) {
            console.error(err);
            alert('Xóa thất bại');
          }
        }

        async function updateStatus(id, newIsPublic) {
            try {
                const resp = await fetch(`${API_BASE}/blog/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    id: id,
                    status: newIsPublic 
                })
                });
                if (!resp.ok) throw new Error('Update status failed');
                await loadPosts(currentPage);
            } catch (err) {
                console.error(err);
                alert('Chưa cập nhật trạng thái, thử lại');
                loadPosts(currentPage);
            }
        }

        // simple escape
        function escapeHtml(unsafe) {
          if (!unsafe) return '';
          return unsafe.replace(/[&<"'>]/g, function (m) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m];
          });
        }

        // initial load
        loadPosts(currentPage);

      })();