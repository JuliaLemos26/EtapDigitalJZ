/* 
   CORE LOGIC - ETAP Digital
   Lógica Global, Integrações (Tidio) e Variáveis de Sistema
*/

// Tidio Chat Integration Logic
document.addEventListener('tidioChat-ready', function() {
    if (window.userData) {
        window.tidioChatApi.setVisitorData({
            name: window.userData.username,
            email: window.userData.email
        });
    }
});

// Utility to get CSRF Token from cookie if needed
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Global points synchronization (Example)
function updateGlobalPoints(points) {
    const pointsDisplay = document.getElementById('js-global-points');
    if (pointsDisplay) {
        pointsDisplay.innerHTML = `<i class='bx bx-star'></i> ${points}`;
    }
}
