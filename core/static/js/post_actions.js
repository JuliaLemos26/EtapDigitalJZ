document.addEventListener('click', function(e) {
    const postItem = e.target.closest('.js-post-item');
    if (postItem && !e.target.closest('.post-actions')) {
        openPostModal(postItem);
    }

    const editBtn = e.target.closest('.js-edit-btn');
    if (editBtn) {
        e.stopPropagation();
        const type = editBtn.dataset.type;
        const id = editBtn.dataset.id;
        openEditModal(type, id);
    }

    const deleteBtn = e.target.closest('.js-delete-btn');
    if (deleteBtn) {
        e.stopPropagation();
        const type = deleteBtn.dataset.type;
        const id = deleteBtn.dataset.id;
        confirmDelete(type, id);
    }
});
