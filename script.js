
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('customer-menu')) {
        updateCustomerMenu();
    }
    
});

const menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
let order = JSON.parse(localStorage.getItem('order')) || [];
let total = parseFloat(localStorage.getItem('total')) || 0;


function addToOrder(itemName, itemPrice) {
    const existingItem = order.find(item => item.name === itemName);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        order.push({ name: itemName, price: itemPrice, quantity: 1 });
    }
    total += itemPrice;
    saveOrder();
    updateOrderSummary();
    updateCustomerMenu();
}

function updateOrderSummary() {
    const orderList = document.getElementById('order-list');
    const totalElement = document.getElementById('total');

    orderList.innerHTML = '';
    order.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            
            ${item.name} - RM${item.price} x ${item.quantity}
            <button onclick="changeQuantity(${index}, -1)">-</button>
            <button onclick="changeQuantity(${index}, 1)">+</button>
            <button onclick="removeFromOrder(${index})">Remove</button>
        `;
        orderList.appendChild(listItem);
    });

    totalElement.textContent = total.toFixed(2);
}

function changeQuantity(index, change) {
    const item = order[index];
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
        removeFromOrder(index);
    } else {
        total += item.price * change;
        item.quantity = newQuantity;
        saveOrder();
        updateOrderSummary();
    }
}

function removeFromOrder(index) {
    const item = order[index];
    total -= item.price * item.quantity;
    order.splice(index, 1);
    saveOrder();
    updateOrderSummary();
}

function clearOrder() {
    order = [];
    total = 0;
    saveOrder();
    updateOrderSummary();
}

function saveOrder() {
    localStorage.setItem('order', JSON.stringify(order));
    localStorage.setItem('total', total.toFixed(2));
}

function submitOrder() {
    const orderId = new Date().toISOString(); // Unique identifier for the order
    const name = document.getElementById('name').value;
    const meja = document.getElementById('meja').value;
    const special = document.getElementById('special').value;
    const orderDetails = {
        id: orderId,
        Nama: name,
        Meja: meja,
        Special: special,
        items: order,
        total: total,
        timestamp: new Date().toISOString()
    };
    let allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
    allOrders.push(orderDetails);
    localStorage.setItem('allOrders', JSON.stringify(allOrders));
    clearOrder(); // Clear the order after submission
    alert(`Order submitted successfully!`);
    sendOrderToDiscord(orderDetails);
    
    localStorage.setItem('lastOrderTimestamp', orderDetails.timestamp);
    
}

// Ensure your script.js includes this update in the updateCustomerMenu function

function updateCustomerMenu() {
    if (document.getElementById('customer-menu')) {
        const customerMenu = document.getElementById('customer-menu');
        customerMenu.innerHTML = '';
        menuItems.forEach(item => {
            if (!item.outOfStock) {
                const orderItem = order.find(orderItem => orderItem.name === item.name);
                const quantity = orderItem ? orderItem.quantity : 0;

                const menuItem = document.createElement('div');
                menuItem.classList.add('item');
                menuItem.innerHTML = `
                    <img src="${item.image}" class="item-image">
                    <span class="item-details">${item.name} - RM${item.price}</span>
                    <div class="item-actions">
                        ${quantity > 0 ? `
                            <button onclick="changeQuantity(${order.findIndex(orderItem => orderItem.name === item.name)}, -1)">-</button>
                            <span>Quantity: ${quantity}</span>
                            <button onclick="changeQuantity(${order.findIndex(orderItem => orderItem.name === item.name)}, 1)">+</button>
                        ` : ''}
                        <button onclick="addToOrder('${item.name}', ${item.price})">Add</button>
                    </div>
                `;
                customerMenu.appendChild(menuItem);
            }
        });
    }
}


function saveOrder() {
    localStorage.setItem('order', JSON.stringify(order));
    localStorage.setItem('total', total.toFixed(2));
}


function toggleStock(index) {
    menuItems[index].outOfStock = !menuItems[index].outOfStock;
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    alert(`Item ${menuItems[index].outOfStock ? 'marked as out of stock' : 'marked as in stock'}`);
}
function printReceipt() {
    const receiptDetails = document.getElementById('receipt-details');
    receiptDetails.innerHTML = '';

    order.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.textContent = `${item.name} - $${item.price} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`;
        receiptDetails.appendChild(itemElement);
    });

    const totalElement = document.createElement('div');
    totalElement.textContent = `Total: $${total.toFixed(2)}`;
    receiptDetails.appendChild(totalElement);

    const receiptWindow = window.open('', '', 'width=600,height=400');
    receiptWindow.document.write('<html><head><title>Receipt</title></head><body>');
    receiptWindow.document.write('<h1>Receipt</h1>');
    receiptWindow.document.write(receiptDetails.innerHTML);
    receiptWindow.document.write('</body></html>');
    receiptWindow.document.close();
    receiptWindow.print();
}

function sendOrderToDiscord(orderDetails) {
    const webhookUrl = 'https://discordapp.com/api/webhooks/1238880021280591984/W97BnT2iGPDAaDl8624tXgy2Zfn2EbKDcdh7X5o7dJEnPkjVCCar9_NAIU2_whmxcJJM'; // Replace with your actual Discord webhook URL

    const orderSummary = orderDetails.items.map(item => `${item.name} - $${item.price} x ${item.quantity}`).join('\n');
    const message = {
        content: `**New Order Received**!!!\n\n**Order ID:** ${orderDetails.id}\n**Timestamp:** ${orderDetails.timestamp}\n**Nama:** ${orderDetails.Nama}\n**Meja:** ${orderDetails.Meja}\n**Items:**\n${orderSummary}\n**Special Request:** ${orderDetails.Special}\n**Total:** $${orderDetails.total.toFixed(2)}`
    };

    fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
    })
    .then(response => {
        if (response.ok) {
            console.log('Order details sent to Discord successfully.');
        } else {
            console.error('Failed to send order details to Discord.');
        }
    })
    .catch(error => {
        console.error('Error sending order details to Discord:', error);
    });
}

const text = "-Selamat Datang Ke Restoran Ayam Gepuk Ngences";
    const typewriterElement = document.getElementById('typewriter');
    let index = 0;

    function typeWriter() {
      if (index < text.length) {
        typewriterElement.textContent += text.charAt(index);
        index++;
        setTimeout(typeWriter, 100); // Adjust the delay for typing speed
      }
    }

    window.onload = typeWriter;


