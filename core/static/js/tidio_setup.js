document.addEventListener('tidioChat-ready', function() {
    if (window.tidioChatApi) {
        window.tidioChatApi.setVisitorData({
            name: document.body.dataset.userName,
            email: document.body.dataset.userEmail
        });
    }
});
