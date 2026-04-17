// Profile Modal Logic
function openProfileModal() {
    const overlay = document.getElementById("js-profile-overlay");
    const modal = document.getElementById("js-profile-holder");

    if (!overlay || !modal) return;

    // Reset edit state
    document.getElementById("profile-display-name").style.display = "block";
    document.getElementById("btn-edit-profile-name").style.display = "block";
    document.getElementById("profile-edit-name-container").style.display = "none";

    // Fetch data
    fetch('/api/profile/', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                document.getElementById("profile-display-name").innerText = data.username;
                document.getElementById("input-profile-name").value = data.username;
                document.getElementById("profile-course").innerText = data.curso;
                document.getElementById("profile-year").innerText = data.ano;
                document.getElementById("profile-points").innerText = data.pontos;
                document.getElementById("duck-name-display").innerText = data.patinho_nome;
                document.getElementById("input-duck-name").value = data.patinho_nome === "Qual o nome do seu patinho etap?" ? "" : data.patinho_nome;

                overlay.classList.add("show");
                modal.classList.add("show");
            } else {
                alert("Erro ao carregar perfil: " + data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert("Erro de conexão ao carregar perfil.");
        });
}

function toggleEditProfileName() {
    const display = document.getElementById("profile-display-name");
    const editBtn = document.getElementById("btn-edit-profile-name");
    const container = document.getElementById("profile-edit-name-container");

    if (display.style.display === "none") {
        display.style.display = "block";
        editBtn.style.display = "block";
        container.style.display = "none";
    } else {
        display.style.display = "none";
        editBtn.style.display = "none";
        container.style.display = "flex";
        document.getElementById("input-profile-name").focus();
    }
}

function saveProfileName() {
    const newName = document.getElementById("input-profile-name").value;
    if (!newName) return;

    const formData = new FormData();
    formData.append('username', newName);

    fetch('/api/profile/update/', {
        method: 'POST',
        body: formData,
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById("profile-display-name").innerText = newName;
            toggleEditProfileName();
            // Optional: Update sidebar if name is shown there
            alert("Nome atualizado com sucesso!");
        } else {
            alert("Erro: " + data.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Erro na requisição de atualização.");
    });
}

function toggleEditDuckName() {
    const view = document.getElementById("duck-name-view");
    const edit = document.getElementById("duck-name-edit");

    if (view.style.display === "none") {
        view.style.display = "flex";
        edit.style.display = "none";
    } else {
        view.style.display = "none";
        edit.style.display = "flex";
        document.getElementById("input-duck-name").focus();
    }
}

function saveDuckName() {
    const newName = document.getElementById("input-duck-name").value;
    if (!newName) return;

    const formData = new FormData();
    formData.append('patinho_nome', newName);

    fetch('/api/profile/duck-name/update/', {
        method: 'POST',
        body: formData,
        headers: { 'X-CSRFToken': getCookie('csrftoken') }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById("duck-name-display").innerText = newName;
            toggleEditDuckName();
            alert("Nome do patinho atualizado!");
        } else {
            alert("Erro: " + data.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Erro na requisição.");
    });
}

// Close logic
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById("js-profile-overlay");
    const closeBtn = document.getElementById("js-profile-close");

    if (closeBtn) {
        closeBtn.onclick = () => {
            overlay.classList.remove("show");
            document.getElementById("js-profile-holder").classList.remove("show");
        };
    }

    if (overlay) {
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.classList.remove("show");
                document.getElementById("js-profile-holder").classList.remove("show");
            }
        };
    }
});

// Helper function (if not already globally available)
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
