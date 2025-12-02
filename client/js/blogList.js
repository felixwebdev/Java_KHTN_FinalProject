(function () {
  const API_BASE = 'https://blogy-java-module4-blogy-java-md4.onrender.com/api';
  const ENDPOINT = '/blog/public'; 

  let postsContainer = document.getElementById('listItem');
  let paginationContainer = document.querySelector('.custom-pagination');
  let postsInfo = document.getElementById('postsInfo');
  const searchInput = document.getElementById('s');
  const searchForm = document.getElementById('searchForm');
  const perPageSelect = document.getElementById('perPageSelect');
  const loaderOverlay = document.getElementById('overlayer');
  const loader = document.querySelector('.loader');

  if (!postsContainer) {
    const mainCol = document.querySelector('.col-lg-8') || document.querySelector('.section.search-result-wrap .container');
    postsContainer = document.createElement('div');
    postsContainer.id = 'listItem';
    postsContainer.className = 'row g-3';
    mainCol?.appendChild(postsContainer);
  }
  if (!paginationContainer) {
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-pagination';
    const rowWrap = document.createElement('div');
    rowWrap.className = 'row text-start pt-5 border-top';
    const col = document.createElement('div');
    col.className = 'col-md-12';
    col.appendChild(wrapper);
    rowWrap.appendChild(col);
    postsContainer.parentNode?.appendChild(rowWrap);
    paginationContainer = wrapper;
  }
  if (!postsInfo) {
    postsInfo = document.createElement('div');
    postsInfo.id = 'postsInfo';
    postsInfo.className = 'text-muted small';
    const row = paginationContainer.closest('.row') || postsContainer.parentNode;
    if (row) row.insertBefore(postsInfo, row.firstChild);
  }

  let currentPage = 1; 
  let totalPages = 1;
  let totalItems = 0;
  let limit = 5;

  let currentQuery = '';

  function showLoader() {
    if (loaderOverlay) loaderOverlay.style.display = 'block';
    if (loader) loader.style.display = 'block';
  }
  function hideLoader() {
    if (loaderOverlay) loaderOverlay.style.display = 'none';
    if (loader) loader.style.display = 'none';
  }

  async function loadPosts(page = 1, q = '') {
    postsContainer.innerHTML = '';
    paginationContainer.innerHTML = '';
    if (postsInfo) postsInfo.textContent = 'Loading...';
    showLoader();

    currentPage = Number(page || 1);
    const page0 = Math.max(0, currentPage - 1); 
    const params = new URLSearchParams({
      page: page0,
      size: limit,
      limit: limit,
      query: q || ''
    });

    try {
      const resp = await fetch(`${API_BASE}${ENDPOINT}?${params.toString()}`, { method: 'GET' });
      if (!resp.ok) throw new Error(`Failed to fetch posts: ${resp.status}`);
      const res = await resp.json();

      let posts = [];
      let metaTotal = null;
      let metaPage = currentPage;
      let metaSize = limit;
      let metaTotalPages = null;

      if (res) {
        if (Array.isArray(res.content)) {
          posts = res.content;
          metaTotal = Number(res.totalElements ?? posts.length);
          metaPage = typeof res.number === 'number' ? (res.number + 1) : metaPage;
          metaSize = Number(res.size ?? metaSize);
          metaTotalPages = Number(res.totalPages ?? Math.ceil(metaTotal / metaSize));
        } else if (Array.isArray(res.docs)) {
          posts = res.docs;
          metaTotal = Number(res.totalDocs ?? posts.length);
          metaPage = Number(res.page ?? metaPage);
          metaSize = Number(res.limit ?? metaSize);
          metaTotalPages = Number(res.totalPages ?? Math.ceil(metaTotal / metaSize));
        } else if (Array.isArray(res.items) || Array.isArray(res.data)) {
          posts = res.items || res.data;
          metaTotal = Number(res.total ?? res.totalItems ?? res.totalDocs ?? posts.length);
          metaPage = Number(res.page ?? res.currentPage ?? metaPage);
          metaSize = Number(res.limit ?? res.size ?? metaSize);
          metaTotalPages = Number(res.totalPages ?? Math.ceil(metaTotal / metaSize));
        } else if (Array.isArray(res)) {
          posts = res;
          metaTotal = res.length;
          metaPage = currentPage;
          metaSize = limit;
          metaTotalPages = Math.max(1, Math.ceil(metaTotal / metaSize));
        } else if (res && (res._id || res.id)) {
          posts = [res];
          metaTotal = 1;
          metaPage = 1;
          metaSize = limit;
          metaTotalPages = 1;
        } else {
          posts = [];
        }
      }

      if (metaTotal == null) metaTotal = posts.length;
      if (!metaSize) metaSize = limit;
      if (metaTotalPages == null) metaTotalPages = Math.max(1, Math.ceil(metaTotal / metaSize));

      totalItems = Number(metaTotal);
      currentPage = Number(metaPage || currentPage);
      totalPages = Number(metaTotalPages);
      limit = Number(metaSize || limit);

      console.log('Pagination meta:', { totalItems, currentPage, totalPages, limit });

      if (!posts || posts.length === 0) {
        postsContainer.innerHTML = '<div class="text-center text-muted py-5">No posts found.</div>';
        renderPagination();
        updatePostsInfo();
        return;
      }

      posts.forEach(renderPostEntry);
      renderPagination();
      updatePostsInfo();
    } catch (err) {
      console.error(err);
      postsContainer.innerHTML = `<div class="text-center text-danger py-5">Error loading posts</div>`;
      if (postsInfo) postsInfo.textContent = '';
    } finally {
      hideLoader();
    }
  }

  function renderPostEntry(post) {
    const created = post.createdAt || post.createdDate || post.publishedAt || post.created;
    const dateStr = created ? new Date(created).toLocaleDateString() : '';
    const img = post.img || post.imageUrl || post.thumbnail || 'images/img_1_sq.jpg';
    const title = escapeHtml(post.title || post.name || 'Untitled');
    const short = escapeHtml(post.shortDescription || post.description || (post.content || '').slice(0, 140));
    const postId = post._id || post.id || '';

    const entry = document.createElement('div');
    entry.className = 'blog-entry d-flex blog-entry-search-item';
    entry.innerHTML = `
      <a href="single.html?id=${postId}" class="img-link me-4">
        <img src="${img}" alt="Image" class="img-fluid img-thumbnail">
      </a>
      <div>
        <span class="date">${dateStr}</span>
        <h2><a href="single.html?id=${postId}">${title}</a></h2>
        <p>${short}</p>
        <p><a href="single.html?id=${postId}" class="btn btn-sm btn-outline-primary">Read More</a></p>
      </div>
    `;
    postsContainer.appendChild(entry);
  }

  function updatePostsInfo() {
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(totalItems, currentPage * limit);
    if (postsInfo) postsInfo.textContent = `Showing ${start}-${end} of ${totalItems}`;
  }

  function renderPagination() {
    paginationContainer.innerHTML = '';
    if (!totalPages || totalPages <= 1) return;

    const createBtn = (label, page, className = '') => {
      const el = document.createElement('a');
      el.href = '#';
      el.className = className;
      el.textContent = label;
      el.dataset.page = page;
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const p = Number(e.currentTarget.dataset.page);
        if (!isNaN(p) && p !== currentPage) {
          loadPosts(p, searchInput?.value || '');
          window.scrollTo({ top: 120, behavior: 'smooth' });
        }
      });
      return el;
    };

    if (currentPage > 1) {
      paginationContainer.appendChild(createBtn('Prev', Math.max(1, currentPage - 1), 'page-prev'));
    } else {
      const span = document.createElement('span'); span.textContent = 'Prev'; paginationContainer.appendChild(span);
    }

    const maxButtons = 7;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      paginationContainer.appendChild(createBtn('1', 1));
      if (startPage > 2) {
        const ell = document.createElement('span'); ell.textContent = '...'; paginationContainer.appendChild(ell);
      }
    }

    for (let p = startPage; p <= endPage; p++) {
      const active = p === currentPage;
      const btn = createBtn(String(p), p, active ? 'active' : '');
      if (active) btn.classList.add('active');
      paginationContainer.appendChild(btn);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ell = document.createElement('span'); ell.textContent = '...'; paginationContainer.appendChild(ell);
      }
      paginationContainer.appendChild(createBtn(String(totalPages), totalPages));
    }

    if (currentPage < totalPages) {
      paginationContainer.appendChild(createBtn('Next', Math.min(totalPages, currentPage + 1), 'page-next'));
    } else {
      const span = document.createElement('span'); span.textContent = 'Next'; paginationContainer.appendChild(span);
    }
  }

  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe).replace(/[&<"'>]/g, function (m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[m];
    });
  }

  function debounce(fn, delay = 400) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), delay);
    };
  }

  // existing setup - add handlers for search form / input and per-page select
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = (searchInput?.value || '').trim();
      currentQuery = q;
      loadPosts(1, q);
    });
  }

  if (searchInput) {
    // keep Enter handler (existing) - optional: remove if duplicated
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = (searchInput.value || '').trim();
        currentQuery = q;
        loadPosts(1, q);
      }
    });
    // add debounced "live" search while typing
    searchInput.addEventListener('input', debounce((e) => {
      const q = (e.target.value || '').trim();
      currentQuery = q;
      loadPosts(1, q);
    }, 600));
  }

  if (perPageSelect) {
    perPageSelect.addEventListener('change', (e) => {
      limit = Number(e.target.value || limit);
      loadPosts(1, currentQuery);
    });
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return isNaN(d.getTime()) ? '' : d.toLocaleString();
    } catch {
      return iso || '';
    }
  }

  async function renderNewst() {
    try {
      const resp = await fetch(`${API_BASE}/blog/newest`);
      if (!resp.ok) throw new Error(`Failed to fetch newest posts: ${resp.status}`);
      const items = await resp.json();
      const newestContainer = document.querySelector('.newest-items');
      newestContainer.innerHTML = '';
      let contentHtml = '';
      for (const post of items) {
        contentHtml+=`
          <li>
            <a href="single.html?id=${post.id}">
              <img src="${post.img}" alt="Image placeholder" class="me-4 rounded">
              <div class="text">
                <h4>${post.title}</h4>
                <div class="post-meta">
                  <span class="mr-2">${formatDate(post.createdAt)}</span>
                </div>
              </div>
            </a>
          </li>
        `
      }
      newestContainer.innerHTML = contentHtml;
    }
    catch (err) {
      console.error(err);
    }
  }

  // Initial load
  renderNewst();
  loadPosts(1, currentQuery);
})();