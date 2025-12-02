(function () {
    const postContainer = document.querySelector('.postContainer');
    if (!postContainer) return;

    async function loadPosts() {
        try {
            const res = await fetch("http://localhost:8080/api/blog/home", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                postContainer.innerHTML = `<p>Error loading posts: ${errData.message || "Unknown error"}</p>`;
                return;
            }

            const data = await res.json();

            if (!Array.isArray(data) || data.length === 0) {
                postContainer.innerHTML = '<p>No posts found.</p>';
                return;
            }

            let sHtml = '';
            data.forEach(post => {
               sHtml += `
               <div class="col-md-6 col-lg-3">
                    <div class="blog-entry">
                        <a href="single.html?id=${post.id}" class="img-link">
                            <img src="${post.img || 'images/default.jpg'}" alt="Image" class="img-fluid">
                        </a>
                        <span class="date">${new Date(post.createdAt).toLocaleString()}</span>
                        <h2><a href="single.html?id=${post.id}">${post.title}</a></h2>
                        <p>${post.shortDescription}</p>
                        <p><a href="single.html?id=${post.id}" class="read-more">Continue Reading</a></p>
                    </div>
                </div>
               `;
            });
            postContainer.innerHTML = sHtml;

        } catch (err) {
            console.error(err);
            postContainer.innerHTML = `<p>Server error while loading posts.</p>`;
        }
    }

    loadPosts();
})();
