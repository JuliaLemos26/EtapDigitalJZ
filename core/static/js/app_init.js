document.addEventListener('DOMContentLoaded', function() {
    const config = document.body.dataset;
    window.currentUserId = config.userId;
    window.userRole = config.userRole;

    const closeBtn = document.getElementById('js-close-button');
    if (closeBtn) closeBtn.addEventListener('click', () => closePostModal());

    const crudClose = document.getElementById('js-crud-close');
    if (crudClose) crudClose.addEventListener('click', () => closeCRUDModal());

    const crudCancel = document.getElementById('js-crud-cancel');
    if (crudCancel) crudCancel.addEventListener('click', () => closeCRUDModal());

    const insClose = document.getElementById('js-inscription-close');
    if (insClose) insClose.addEventListener('click', () => closeInscriptionModal());

    const manageClose = document.getElementById('js-manage-close');
    if (manageClose) manageClose.addEventListener('click', () => closeManageModal());

    const insDetailClose = document.getElementById('js-ins-detail-close');
    if (insDetailClose) insDetailClose.addEventListener('click', () => closeInsDetailModal());

    const wardrobeClose = document.getElementById('js-wardrobe-close');
    if (wardrobeClose) wardrobeClose.addEventListener('click', () => closeWardrobeModal());

    const profileTrigger = document.querySelector('.profile-details');
    if (profileTrigger && window.userRole === 'aluno') {
        profileTrigger.addEventListener('click', () => openProfileModal());
    }

    const editDuckBtn = document.getElementById('btn-edit-duck-name');
    if (editDuckBtn) editDuckBtn.addEventListener('click', () => toggleEditDuckName());

    const saveDuckBtn = document.getElementById('btn-save-duck-name');
    if (saveDuckBtn) saveDuckBtn.addEventListener('click', () => saveDuckName());

    const cancelDuckBtn = document.getElementById('btn-cancel-duck-name');
    if (cancelDuckBtn) cancelDuckBtn.addEventListener('click', () => toggleEditDuckName());

    const editProfileBtn = document.getElementById('btn-edit-profile-name');
    if (editProfileBtn) editProfileBtn.addEventListener('click', () => toggleEditProfileName());

    const saveProfileBtn = document.getElementById('btn-save-profile-name');
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', () => saveProfileName());

    const cancelProfileBtn = document.getElementById('btn-cancel-profile-name');
    if (cancelProfileBtn) cancelProfileBtn.addEventListener('click', () => toggleEditProfileName());

    const editYearBtn = document.getElementById('btn-edit-year');
    if (editYearBtn) editYearBtn.addEventListener('click', () => toggleEditYear());

    const saveYearBtn = document.getElementById('btn-save-year');
    if (saveYearBtn) saveYearBtn.addEventListener('click', () => saveYear());

    const cancelYearBtn = document.getElementById('btn-cancel-year');
    if (cancelYearBtn) cancelYearBtn.addEventListener('click', () => toggleEditYear());

    const openWardrobeBtn = document.getElementById('btn-open-wardrobe');
    if (openWardrobeBtn) openWardrobeBtn.addEventListener('click', () => openWardrobeModal());
});
