const OWNER_PASSWORD = '1';

document.addEventListener('DOMContentLoaded', () => {
    
    if (document.getElementById('owner-panel')) {
        const storedMenuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
        // menuItems.push(...storedMenuItems); store duplicate data
        updateMenuList();
        updateCustomerMenu();
    }
});

const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
let order = JSON.parse(localStorage.getItem('order')) || [];
let total = parseFloat(localStorage.getItem('total')) || 0;

function login() {
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('login-error');

    if (password === OWNER_PASSWORD) {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('owner-panel').classList.remove('hidden');
        loginError.textContent = '';
    } else {
        loginError.textContent = 'Incorrect password. Please try again.';
    }
}

function logout() {
    document.getElementById('owner-panel').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
}

function addMenuItem() {
    const name = document.getElementById('item-name').value;
    const price = parseFloat(document.getElementById('item-price').value);
    const imageFile = document.getElementById('new-item-image').files[0];

    if (name && !isNaN(price) && imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            menuItems.push({ name, price, image: imageData, outOfStock: false });
            localStorage.setItem('menuItems', JSON.stringify(menuItems));
            updateOwnerMenu();
            clearNewItemFields();
        };
        reader.readAsDataURL(imageFile);
    } else {
        alert('Please fill all fields and select an image');
    }
}
function uploadImage(event, index) {
    const imageFile = event.target.files[0];
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageData = e.target.result;
            menuItems[index].image = imageData;
            localStorage.setItem('menuItems', JSON.stringify(menuItems));
            updateOwnerMenu();
        };
        reader.readAsDataURL(imageFile);
    }
}

function updateMenuList() {
    const menuList = document.getElementById('menu-list');
    menuList.innerHTML = '';
    menuItems.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <img src="${item.image}" class="item-image">
            ${item.name} - RM${item.price}
            <button onclick="editMenuItem(${index})">Edit</button>
            <button onclick="deleteMenuItem(${index})">Delete</button>
            <input type="checkbox" ${item.outOfStock ? 'checked' : ''} onclick="toggleStock(${index})"> Out of Stock
        `;
        menuList.appendChild(listItem);
        adjustImageSize();
    });
}
function toggleStock(index) {
    menuItems[index].outOfStock = !menuItems[index].outOfStock;
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    alert(`Item ${menuItems[index].outOfStock ? 'marked as out of stock' : 'marked as in stock'}`);
}


function editMenuItem(index) {
    const item = menuItems[index];
    document.getElementById('item-name').value = item.name;
    document.getElementById('item-price').value = item.price;
    document.getElementById('item-image').value = item.image;
    
    
    // Remove the item from the array (will be re-added with updated details)
    menuItems.splice(index, 1);
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    updateMenuList();
    updateCustomerMenu();
}

function deleteMenuItem(index) {
    menuItems.splice(index, 1);
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    updateMenuList();
    updateCustomerMenu();
}

//save order history list
document.addEventListener('DOMContentLoaded', () => {
    const orderList = document.getElementById('order-list');
    const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];

    allOrders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.classList.add('order');
        orderElement.innerHTML = `
            <h3>Order ID: ${order.id}</h3>
            <p>Date: ${new Date(order.timestamp).toLocaleString()}</p>
            <ul>
                ${order.items.map(item => `<li>${item.name} - RM${item.price} x ${item.quantity}</li>`).join('')}
            </ul>
            <p>Total: RM${order.total}</p>
            <hr />
        `;
        orderList.appendChild(orderElement);
    });
});




