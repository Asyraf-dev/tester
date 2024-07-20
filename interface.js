
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
                ${order.items.map(item => `<li>${item.name} - $${item.price} x ${item.quantity}</li>`).join('')}
            </ul>
            <p>Total: $${order.total}</p>
            <hr />
        `;
        orderList.appendChild(orderElement);
    });
});
function checkForNewOrders() {
    const lastOrderTimestamp = localStorage.getItem('lastOrderTimestamp');
    const currentTimestamp = new Date().toISOString();

    fetchOrders().then(orders => {
        const latestOrder = orders[orders.length - 1];
        if (latestOrder.timestamp !== lastOrderTimestamp) {
            // New order detected
            location.reload(); // Refresh the page
        }
    });

    // Continue polling every 10 seconds
    setTimeout(checkForNewOrders, 10000);
}

function fetchOrders() {
    return new Promise(resolve => {
        const allOrders = JSON.parse(localStorage.getItem('allOrders')) || [];
        resolve(allOrders);
    });
}

// Start polling when the page loads
document.addEventListener('DOMContentLoaded', () => {
    checkForNewOrders();
});

