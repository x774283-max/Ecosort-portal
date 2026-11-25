
console.log("Hello Ecosort");

// Demo accounts
const demoAccounts = {
    malaysia_admin: {
        password: "MYdemo123",
        country: "Malaysia"
    },
    japan_admin: {
        password: "JPdemo123",
        country: "Japan"
    },
    singapore_admin: {
        password: "SGdemo123",
        country: "Singapore"
    }
};

// Country data
const countryData = {
    Malaysia: {
        name: "Malaysia",
        message: "Malaysia settings",
        categories: ["Paper", "Plastic", "Glass"]
    },

    Japan: {
        name: "Japan",
        message: "Japan settings",
        categories: ["Category 1", "Category 2"]
    },

    Singapore: {
        name: "Singapore",
        message: "Singapore settings",
        categories: ["Category 1", "Category 2"]
    }
};

// Default colors
const binColors = {
    Malaysia: {
        Paper: "blue",
        Plastic: "orange",
        Glass: "brown"
    },

    Japan: {
        "Category 1": "blue",
        "Category 2": "yellow"
    },

    Singapore: {
        "Category 1": "green",
        "Category 2": "blue"
    }
};

// Load saved colors
["Malaysia", "Japan", "Singapore"].forEach(function(country) {
    binColors[country] =
        JSON.parse(localStorage.getItem("binColors_" + country)) ||
        binColors[country];
});

// UI text
const uiText = {
    Malaysia: {
        title: "Negara yang disokong",
        description: "Pilih negara untuk melihat peraturan pengasingan sisa.",
        categories: "Kategori Pengasingan",
        add: "Tambah Kategori",
        edit: "Edit",
        delete: "Padam"
    },

    Japan: {
        title: "対応国",
        description: "国を選択して、分別ルールを確認してください。",
        categories: "分別カテゴリー",
        add: "カテゴリー追加",
        edit: "編集",
        delete: "削除"
    },

    Singapore: {
        title: "Supported Countries",
        description: "Select a country to view its waste classification rules.",
        categories: "Classification Categories",
        add: "Add Category",
        edit: "Edit",
        delete: "Delete"
    }
};

// Load saved categories
["Malaysia", "Japan", "Singapore"].forEach(function(country) {
    countryData[country].categories =
        JSON.parse(localStorage.getItem("categories_" + country)) ||
        countryData[country].categories;
});

// Currently logged-in account
let currentAdmin = null;


// LOGIN
function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const account = demoAccounts[username];

    if (!account || account.password !== password) {
        document.getElementById("login-message").textContent =
            "Invalid username or password.";
        return;
    }

    currentAdmin = {
        username: username,
        country: account.country
    };

    document.getElementById("login-area").style.display = "none";
    document.getElementById("portal-area").style.display = "grid";

    document.getElementById("admin-label").textContent =
        "Logged in as: " + username + " | " + account.country;

    document.getElementById("login-message").textContent = "";

    createCountryButtons(account.country);
    showMessage(account.country);
}


// COUNTRY BUTTONS
function createCountryButtons(allowedCountry) {
    const buttonArea = document.getElementById("country-buttons");

    buttonArea.innerHTML =
        "<button onclick='showMessage(\"" + allowedCountry + "\")'>" +
        allowedCountry +
        "</button>";
}


// LOGOUT
function logout() {
    currentAdmin = null;

    document.getElementById("portal-area").style.display = "none";
    document.getElementById("login-area").style.display = "block";

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    document.getElementById("config-area").innerHTML = "";
    document.getElementById("summary-area").innerHTML = "";
    document.getElementById("country-buttons").innerHTML = "";

    document.getElementById("message").textContent =
        "Please select a country.";
}


// ACCESS CHECK
function hasAccess(country) {
    return currentAdmin && currentAdmin.country === country;
}


// SHOW CONFIGURATION
function showMessage(country) {
    if (!hasAccess(country)) {
        alert("Access denied.");
        return;
    }

    const text = uiText[country];

    document.getElementById("section-title").textContent = text.title;
    document.getElementById("section-description").textContent =
        text.description;

    const categories = countryData[country].categories;
    let categoryList = "";

    categories.forEach(function(category) {
        const color = binColors[country][category] || "gray";

        const colorOptions = [
            "blue", "yellow", "green", "red",
            "brown", "orange", "gray", "custom"
        ];

        let colorSelect =
            "<select onchange='changeBinColor(\"" +
            country + "\", \"" + category + "\", this.value)'>";

        const isCustomColor =
            !colorOptions.slice(0, -1).includes(color);

        colorOptions.forEach(function(option) {
            colorSelect +=
                "<option value='" + option + "'" +
                (color === option ||
                (option === "custom" && isCustomColor)
                    ? " selected" : "") +
                ">" + option + "</option>";
        });

        colorSelect += "</select>";

        let customColorInput = "";

        if (isCustomColor) {
            customColorInput =
                "<input type='color' value='" +
                (color.startsWith("#") ? color : "#808080") +
                "' onchange='changeBinColor(\"" +
                country + "\", \"" + category + "\", this.value)'>";
        }

        categoryList +=
            "<li class='category-item' style='--bin-color:" + color + ";'>" +
            "<span style='display:inline-block; width:14px; height:14px; background-color:" +
            color + "; margin-right:8px; border-radius:3px;'></span>" +
            category +
            " " + colorSelect + customColorInput +
            " <button onclick='editCategory(\"" +
            country + "\", \"" + category + "\")'>" +
            text.edit + "</button>" +
            " <button onclick='deleteCategory(\"" +
            country + "\", \"" + category + "\")'>" +
            text.delete + "</button>" +
            "</li>";
    });

    document.getElementById("config-area").innerHTML =
        "<h2>" + country + " Configuration</h2>" +
        "<p>" + countryData[country].message + "</p>" +
        "<h3>" + text.categories + "</h3>" +
        "<ul>" + categoryList + "</ul>" +
        "<input type='text' id='new-category' placeholder='Enter category name'>" +
        "<button onclick='addCategory(\"" + country + "\")'>" +
        text.add + "</button>";

    document.getElementById("message").textContent =
        country + " Configuration";

    showSummary(country);
}


// ADD CATEGORY
function addCategory(country) {
    if (!hasAccess(country)) return;

    const newCategory =
        document.getElementById("new-category").value.trim();

    if (newCategory === "") {
        alert("Please enter a category name.");
        return;
    }

    const formattedCategory =
        newCategory.charAt(0).toUpperCase() +
        newCategory.slice(1).toLowerCase();

    if (countryData[country].categories.some(function(category) {
        return category.toLowerCase() === formattedCategory.toLowerCase();
    })) {
        alert("This category already exists.");
        return;
    }

    countryData[country].categories.push(formattedCategory);

    // Default color for a new category
    binColors[country][formattedCategory] = "gray";

    localStorage.setItem(
        "categories_" + country,
        JSON.stringify(countryData[country].categories)
    );

    localStorage.setItem(
        "binColors_" + country,
        JSON.stringify(binColors[country])
    );

    showMessage(country);
}


// DELETE CATEGORY
function deleteCategory(country, category) {
    if (!hasAccess(country)) return;

    countryData[country].categories =
        countryData[country].categories.filter(function(item) {
            return item !== category;
        });

    delete binColors[country][category];

    localStorage.setItem(
        "categories_" + country,
        JSON.stringify(countryData[country].categories)
    );

    localStorage.setItem(
        "binColors_" + country,
        JSON.stringify(binColors[country])
    );

    showMessage(country);
}


// EDIT CATEGORY
function editCategory(country, oldCategory) {
    if (!hasAccess(country)) return;

    const newCategory = prompt("Enter the new category name:");

    if (newCategory === null || newCategory.trim() === "") {
        return;
    }

    const formattedCategory =
        newCategory.trim().charAt(0).toUpperCase() +
        newCategory.trim().slice(1).toLowerCase();

    const index = countryData[country].categories.indexOf(oldCategory);

    if (countryData[country].categories.some(function(category, i) {
        return i !== index &&
            category.toLowerCase() === formattedCategory.toLowerCase();
    })) {
        alert("This category already exists.");
        return;
    }

    countryData[country].categories[index] = formattedCategory;

    // Preserve the old category's color
    binColors[country][formattedCategory] =
        binColors[country][oldCategory] || "gray";

    delete binColors[country][oldCategory];

    localStorage.setItem(
        "categories_" + country,
        JSON.stringify(countryData[country].categories)
    );

    localStorage.setItem(
        "binColors_" + country,
        JSON.stringify(binColors[country])
    );

    showMessage(country);
}


// CHANGE COLOR
function changeBinColor(country, category, newColor) {
    if (!hasAccess(country)) return;

    binColors[country][category] = newColor;

    localStorage.setItem(
        "binColors_" + country,
        JSON.stringify(binColors[country])
    );

    showMessage(country);
}


// SUMMARY
function showSummary(country) {
    if (!hasAccess(country)) return;

    const categories = countryData[country].categories;

    let summaryList = "";
    let colorCount = {};

    categories.forEach(function(category) {
        const color = binColors[country][category] || "gray";

        colorCount[color] = (colorCount[color] || 0) + 1;
    });

    let colorSummary = "<h3>Color Usage</h3><ul>";

    Object.keys(colorCount).forEach(function(color) {
        colorSummary +=
            "<li>" +
            "<span style='display:inline-block; width:14px; height:14px; background-color:" +
            color + "; margin-right:8px; border-radius:3px;'></span>" +
            color + ": " + colorCount[color] +
            "</li>";
    });

    colorSummary += "</ul>";

    categories.forEach(function(category) {
        const color = binColors[country][category] || "gray";

        summaryList +=
            "<li class='category-item' style='--bin-color:" + color + ";'>" +
            "<span style='display:inline-block; width:14px; height:14px; background-color:" +
            color + "; margin-right:8px; border-radius:3px;'></span>" +
            category +
            "</li>";
    });

    document.getElementById("summary-area").innerHTML =
        "<h2>Configuration Summary</h2>" +
        "<p>Selected Country: " + country + "</p>" +
        "<ul>" + summaryList + "</ul>" +
        colorSummary +

        "<div class='summary-stats'>" +

        "<div class='stat-card'>" +
        "<h3>" + String(categories.length).padStart(2, "0") + "</h3>" +
        "<p>Total Categories</p>" +
        "</div>" +

        "<div class='stat-card'>" +
        "<h3>" + String(Object.keys(colorCount).length).padStart(2, "0") + "</h3>" +
        "<p>Colors Used</p>" +
        "</div>" +

        "</div>";
}


// EXPORT
function exportConfiguration() {
    if (!currentAdmin) {
        alert("Please login first.");
        return;
    }

    const country = currentAdmin.country;

    if (!hasAccess(country)) {
        alert("Access denied.");
        return;
    }

    const exportColors = {};

    countryData[country].categories.forEach(function(category) {
        exportColors[category] = binColors[country][category] || "gray";
    });

    const config = {
        version: "1.0",
        exportedAt: new Date().toISOString(),
        country: country,
        categories: countryData[country].categories,
        binColors: exportColors
    };

    const json = JSON.stringify(config, null, 2);

    const blob = new Blob([json], { type: "application/json" });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = country + "_configuration.json";

    link.click();

    URL.revokeObjectURL(url);
}
