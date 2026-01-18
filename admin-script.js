// Admin authentication
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Check if admin is logged in
function checkAdminAuth() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isLoggedIn) {
        showDashboard();
    } else {
        showLogin();
    }
}

// Show login form
function showLogin() {
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
}

// Show admin dashboard
function showDashboard() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    loadProducts();
    loadOrders();
    loadSettings();
}

// Admin login
document.getElementById('admin-login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminLoggedIn', 'true');
        errorDiv.textContent = '';
        showDashboard();
    } else {
        errorDiv.textContent = 'Username atau password salah!';
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('adminLoggedIn');
    showLogin();
});

// Navigation
function showSection(sectionName, buttonElement) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Remove active class from nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionName + '-section').classList.remove('hidden');

    // Add active class to clicked button
    buttonElement.classList.add('active');
}

// Products Management
function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');

    // Group products by category
    const categories = {
        'akun-game': [],
        'joki-game': [],
        'top-up': []
    };

    products.forEach((product, index) => {
        if (categories[product.category]) {
            categories[product.category].push({ ...product, originalIndex: index });
        }
    });

    // Display products in each category section
    Object.keys(categories).forEach(category => {
        const containerId = category.replace('-', '-') + '-products';
        const container = document.getElementById(containerId);
        const productsInCategory = categories[category];

        if (productsInCategory.length === 0) {
            container.innerHTML = '<div class="empty-category">Belum ada produk di kategori ini</div>';
        } else {
            container.innerHTML = productsInCategory.map(product => `
                <div class="product-card">
                    ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<div style="height: 150px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: #666;">No Image</div>'}
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">Rp ${product.price.toLocaleString()}</div>
                    <div class="product-actions">
                        <button onclick="editProduct(${product.originalIndex})" class="edit-btn">Edit</button>
                        <button onclick="deleteProduct(${product.originalIndex})" class="delete-btn">Hapus</button>
                    </div>
                </div>
            `).join('');
        }
    });
}

// Orders Management
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    const ordersList = document.getElementById('orders-list');

    if (orders.length === 0) {
        ordersList.innerHTML = '<p>Belum ada pesanan dari customer.</p>';
        return;
    }

    ordersList.innerHTML = orders.map((order, index) => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-customer">${order.name}</div>
                <div class="order-date">${new Date(order.date).toLocaleDateString('id-ID')}</div>
            </div>
            <div class="order-product">
                <strong>Produk:</strong> ${order.product}<br>
                <strong>Email:</strong> ${order.email}<br>
                <strong>HP:</strong> ${order.phone}<br>
                ${order.message ? `<strong>Pesan:</strong> ${order.message}` : ''}
            </div>
            <div class="order-actions">
                <button onclick="deleteOrder(${index})" class="delete-order-btn">Hapus Pesanan</button>
            </div>
            <span class="order-status status-pending">Pending</span>
        </div>
    `).join('');
}

// Settings Management
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    document.getElementById('store-name').value = settings.storeName || 'Toko Digital Game';
    document.getElementById('whatsapp-number').value = settings.whatsappNumber || '+6281234567890';
}

function saveSettings() {
    const settings = {
        storeName: document.getElementById('store-name').value,
        whatsappNumber: document.getElementById('whatsapp-number').value
    };

    localStorage.setItem('storeSettings', JSON.stringify(settings));
    alert('Pengaturan berhasil disimpan!');
}

// Product Modal
function showAddProductModal() {
    document.getElementById('modal-title').textContent = 'Tambah Produk';
    document.getElementById('product-form').reset();

    // Set default button text for new products
    updateButtonText();

    document.getElementById('product-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
    // Clear image data when closing modal
    delete document.getElementById('product-image').dataset.imageData;
    delete document.getElementById('product-image').dataset.hasExistingImage;

    // Reset image upload box to default state
    const uploadBox = document.querySelector('.image-upload-box');
    if (uploadBox) {
        const uploadIcon = uploadBox.querySelector('.upload-icon');
        uploadIcon.innerHTML = '<span>+</span><div>Gambar</div>';
    }
}

function editProduct(index) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products[index];

    document.getElementById('modal-title').textContent = 'Edit Produk';
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;

    // Update button text based on category
    updateButtonText();

    // Handle image - show current image in upload box
    const uploadBox = document.querySelector('.image-upload-box');
    const uploadIcon = uploadBox.querySelector('.upload-icon');

    if (product.image) {
        document.getElementById('product-image').dataset.imageData = product.image;
        document.getElementById('product-image').dataset.hasExistingImage = 'true';
        // Show existing image preview in upload box, sized to fit
        uploadIcon.innerHTML = `<img src="${product.image}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;">`;
    } else {
        delete document.getElementById('product-image').dataset.imageData;
        delete document.getElementById('product-image').dataset.hasExistingImage;
        // Reset to default state
        uploadIcon.innerHTML = '<span>+</span><div>Gambar</div>';
    }

    document.getElementById('product-modal').style.display = 'block';

    // Store index for editing
    document.getElementById('product-form').dataset.editIndex = index;
}

// Handle image file selection
document.getElementById('product-image').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const uploadBox = document.querySelector('.image-upload-box');
    const uploadIcon = uploadBox.querySelector('.upload-icon');

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // Store the data URL temporarily
            document.getElementById('product-image').dataset.imageData = e.target.result;

            // Show image preview in upload box, sized to fit
            uploadIcon.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px;">`;
        };
        reader.readAsDataURL(file);
    } else {
        // Reset to default state if no file selected
        uploadIcon.innerHTML = '<span>+</span><div>Gambar</div>';
        delete document.getElementById('product-image').dataset.imageData;
    }
});

// Update button text based on category
function updateButtonText() {
    const category = document.getElementById('product-category').value;
    let buttonText = '';

    switch (category) {
        case 'akun-game':
            buttonText = 'Beli';
            break;
        case 'joki-game':
            buttonText = 'Pesan';
            break;
        case 'top-up':
            buttonText = 'Top Up';
            break;
        default:
            buttonText = 'Beli';
    }

    // Store the button text for form submission
    document.getElementById('product-category').dataset.buttonText = buttonText;
}

// Category change event listener
document.getElementById('product-category').addEventListener('change', updateButtonText);

// Product Form Submission
document.getElementById('product-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const imageInput = document.getElementById('product-image');
    const editIndex = document.getElementById('product-form').dataset.editIndex;

    // Handle image data - use new image if selected, otherwise keep existing
    let imageData = '';
    if (imageInput.dataset.imageData) {
        // New image was selected
        imageData = imageInput.dataset.imageData;
    } else if (editIndex !== undefined) {
        // Editing existing product, keep the original image if no new image selected
        const products = JSON.parse(localStorage.getItem('products') || '[]');
        const existingProduct = products[editIndex];
        imageData = existingProduct ? existingProduct.image || '' : '';
    }

    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        category: document.getElementById('product-category').value,
        image: imageData,
        buttonText: document.getElementById('product-category').dataset.buttonText
    };

    const products = JSON.parse(localStorage.getItem('products') || '[]');

    if (editIndex !== undefined) {
        // Edit existing product
        products[editIndex] = productData;
        delete document.getElementById('product-form').dataset.editIndex;
    } else {
        // Add new product
        products.push(productData);
    }

    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
    closeModal();
});

function deleteProduct(index) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    products.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(products));
    loadProducts();
}

function deleteOrder(index) {
    const orders = JSON.parse(localStorage.getItem('customerOrders') || '[]');
    orders.splice(index, 1);
    localStorage.setItem('customerOrders', JSON.stringify(orders));
    loadOrders();
}

// Initialize when page loads
window.onload = function() {
    checkAdminAuth();
};

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target == modal) {
        closeModal();
    }
};
