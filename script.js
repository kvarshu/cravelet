const currentPage = window.location.pathname.split('/').pop();
let users = JSON.parse(localStorage.getItem("users")) || {};
let recipes = JSON.parse(localStorage.getItem("recipes")) || [];

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

function showRegister() {
    document.getElementById("login-container").style.display = "none";
    document.getElementById("register-container").style.display = "block";
}

async function register() {
    const username = document.getElementById("new-username").value;
    const password = document.getElementById("new-password").value;
    if (username && password) {
        if (!users[username]) {
            const hashedPassword = await hashPassword(password);
            users[username] = hashedPassword;
            localStorage.setItem("users", JSON.stringify(users));
            alert("Registration successful! Please login.");
            document.getElementById("register-container").style.display = "none";
            document.getElementById("login-container").style.display = "block";
        } else {
            alert("Username already exists.");
        }
    } else {
        alert("Enter valid details.");
    }
}

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    if (users[username] && await hashPassword(password) === users[username]) {
        localStorage.setItem("loggedInUser", username);
        // → redirect instead of in-page show/hide
        window.location.href = 'recipes.html';
        return;
    }
    alert("Invalid username or password.");
}


function logout() {
    localStorage.removeItem("loggedInUser");
    // → redirect back to login
    window.location.href = 'login.html';
}


function displayRecipes() {
    const recipeList = document.getElementById("recipe-list");
    recipeList.innerHTML = "";
    recipes.forEach((recipe, index) => {
        recipeList.innerHTML += `
            <div class="recipe">
                <h3>${recipe.name}</h3>
                <p>${recipe.details}</p>
                <button onclick="editRecipe(${index})">Edit</button>
                <button onclick="deleteRecipe(${index})">Delete</button>
            </div>
        `;
    });
}

function addRecipe() {
    const name = document.getElementById("recipe-name").value;
    const details = document.getElementById("recipe-details").value;
    if (name && details) {
        recipes.push({ name, details });
        localStorage.setItem("recipes", JSON.stringify(recipes));
        displayRecipes();
        document.getElementById("recipe-name").value = "";
        document.getElementById("recipe-details").value = "";
    }
}

function editRecipe(index) {
    const nameInput = document.createElement("input");
    nameInput.value = recipes[index].name;

    const detailsInput = document.createElement("textarea");
    detailsInput.value = recipes[index].details;

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.onclick = () => {
        recipes[index] = { name: nameInput.value, details: detailsInput.value };
        localStorage.setItem("recipes", JSON.stringify(recipes));
        displayRecipes();
    };

    const recipeDiv = document.querySelectorAll(".recipe")[index];
    recipeDiv.innerHTML = "";
    recipeDiv.appendChild(nameInput);
    recipeDiv.appendChild(detailsInput);
    recipeDiv.appendChild(saveButton);
}

function deleteRecipe(index) {
    recipes.splice(index, 1);
    localStorage.setItem("recipes", JSON.stringify(recipes));
    displayRecipes();
}

document.addEventListener("DOMContentLoaded", () => {
    if (currentPage === 'recipes.html') {
        // if not logged in, bounce back
        if (!localStorage.getItem("loggedInUser")) {
            return window.location.href = 'login.html';
        }
        displayRecipes();
    }
});
