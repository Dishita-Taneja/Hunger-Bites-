// HungerBites - Enhanced Visuals and Full Functionality Script
// Designed and Served with love by Dishita Taneja

// 1. Web Audio API Synthesis for Premium Sound Feedback
const AudioFX = {
    ctx: null,
    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },
    playClick() {
        try {
            this.init();
            if (this.ctx.state === 'suspended') this.ctx.resume();
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);
            
            gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.08);
        } catch(e) {
            console.log("Audio not allowed or supported yet", e);
        }
    },
    playSuccess() {
        try {
            this.init();
            if (this.ctx.state === 'suspended') this.ctx.resume();
            
            const now = this.ctx.currentTime;
            
            const playNote = (freq, delay, dur) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + delay);
                
                gain.gain.setValueAtTime(0.0, now + delay);
                gain.gain.linearRampToValueAtTime(0.08, now + delay + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
                
                osc.start(now + delay);
                osc.stop(now + delay + dur);
            };
            
            playNote(523.25, 0, 0.3);   // C5
            playNote(659.25, 0.1, 0.3); // E5
            playNote(783.99, 0.2, 0.5); // G5
        } catch(e) {
            console.log("Audio play error", e);
        }
    }
};

// 2. Confetti Particle Burst Animation (Client-side, Zero-dependency)
function launchConfetti() {
    const duration = 2500;
    const end = Date.now() + duration;
    const colors = ['#ff6b6b', '#ff8e53', '#ffa726', '#667eea', '#764ba2', '#2ecc71', '#f1c40f'];

    (function frame() {
        if (Date.now() > end) return;
        
        for (let i = 0; i < 4; i++) {
            const p = document.createElement('div');
            p.style.position = 'fixed';
            p.style.left = Math.random() * 100 + 'vw';
            p.style.top = '-10px';
            p.style.width = Math.random() * 8 + 6 + 'px';
            p.style.height = Math.random() * 8 + 6 + 'px';
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            p.style.zIndex = '100000';
            p.style.pointerEvents = 'none';
            p.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            document.body.appendChild(p);
            
            const speedY = Math.random() * 4 + 3;
            const speedX = Math.random() * 3 - 1.5;
            let currentTop = -10;
            let currentLeft = parseFloat(p.style.left);
            
            const anim = setInterval(() => {
                currentTop += speedY;
                currentLeft += speedX;
                p.style.top = currentTop + 'px';
                p.style.left = currentLeft + 'px';
                
                if (currentTop > window.innerHeight) {
                    clearInterval(anim);
                    p.remove();
                }
            }, 16);
        }
        requestAnimationFrame(frame);
    }());
}

// Global Variables
let cart = JSON.parse(localStorage.getItem('hb_cart')) || [];
let activeCoupon = JSON.parse(localStorage.getItem('hb_coupon')) || null;
let currentFilter = 'all';

// Testimonials initial state (stored locally or defaults loaded)
const defaultReviews = [
    {
        name: "Sarah Johnson",
        role: "Regular Customer",
        comment: "Absolutely mouthwatering burgers and lightning-fast delivery. I'm hooked!",
        stars: 5,
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
    },
    {
        name: "Mike Chen",
        role: "Food Blogger",
        comment: "Hands down the best pizza in town—crispy, fresh, and always satisfying!",
        stars: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face"
    },
    {
        name: "Emma Davis",
        role: "Local Resident",
        comment: "Every order is a treat. The pasta? Simply perfection on a plate!",
        stars: 5,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
    }
];
let userReviews = JSON.parse(localStorage.getItem('hb_reviews')) || [];

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const hamburger = document.getElementById('hamburger');
const navMenu = document.querySelector('.nav-menu');
const themeToggleBtn = document.getElementById('themeToggle');

const cartToggle = document.getElementById('cartToggle');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');

// Cart pricing breakdown elements
const summarySubtotal = document.getElementById('summarySubtotal');
const summaryDiscount = document.getElementById('summaryDiscount');
const summaryDelivery = document.getElementById('summaryDelivery');
const summaryTax = document.getElementById('summaryTax');
const cartTotalElement = document.getElementById('cartTotal');
const discountRow = document.getElementById('discountRow');
const discountName = document.getElementById('discountName');
const promoInput = document.getElementById('promoInput');
const applyPromoBtn = document.getElementById('applyPromoBtn');
const promoMessage = document.getElementById('promoMessage');

// Filters
const menuSearch = document.getElementById('menuSearch');
const vegToggle = document.getElementById('vegToggle');
const vegLabel = document.getElementById('vegLabel');
const menuSort = document.getElementById('menuSort');
const filterButtons = document.querySelectorAll('.filter-btn');
const menuGrid = document.querySelector('.menu-grid');

// Modals
const foodDetailModal = document.getElementById('foodDetailModal');
const modalFoodName = document.getElementById('modalFoodName');
const modalFoodBadge = document.getElementById('modalFoodBadge');
const modalFoodImage = document.getElementById('modalFoodImage');
const modalFoodDescription = document.getElementById('modalFoodDescription');
const nutrCal = document.getElementById('nutrCal');
const nutrProt = document.getElementById('nutrProt');
const nutrCarb = document.getElementById('nutrCarb');
const customizationForm = document.getElementById('customizationForm');
const modalTotalPrice = document.getElementById('modalTotalPrice');
const addCustomizedToCartBtn = document.getElementById('addCustomizedToCartBtn');
const cancelFoodBtn = document.getElementById('cancelFoodBtn');
const closeFoodModal = document.getElementById('closeFoodModal');

// Checkout dialog elements
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutModal = document.getElementById('closeCheckoutModal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutBackBtn = document.getElementById('checkoutBackBtn');
const checkoutNextBtn = document.getElementById('checkoutNextBtn');
const checkoutProgress = document.getElementById('checkoutProgress');
const stepDots = document.querySelectorAll('.checkout-step-dot');
const stepPanels = document.querySelectorAll('.checkout-step-panel');
const checkoutSummaryItems = document.getElementById('checkoutSummaryItems');
const addressForm = document.getElementById('addressForm');
const paymentOptions = document.querySelectorAll('.payment-option-card');
const paymentUpiInput = document.getElementById('paymentUpiInput');
const paymentCardInput = document.getElementById('paymentCardInput');
const trackerFill = document.getElementById('trackerFill');
const trackerScooter = document.getElementById('trackerScooter');
const checkoutModalFooter = document.getElementById('checkoutModalFooter');

// Checkout summary values
const chkSubtotal = document.getElementById('chkSubtotal');
const chkDiscountRow = document.getElementById('chkDiscountRow');
const chkDiscount = document.getElementById('chkDiscount');
const chkDelivery = document.getElementById('chkDelivery');
const chkTax = document.getElementById('chkTax');
const chkTotal = document.getElementById('chkTotal');

// Testimonials dialog
const reviewModal = document.getElementById('reviewModal');
const openReviewBtn = document.getElementById('openReviewBtn');
const closeReviewModal = document.getElementById('closeReviewModal');
const cancelReviewBtn = document.getElementById('cancelReviewBtn');
const submitReviewBtn = document.getElementById('submitReviewBtn');
const reviewForm = document.getElementById('reviewForm');
const starRatingSelector = document.getElementById('starRatingSelector');
const avatarSelector = document.getElementById('avatarSelector');
const testimonialsGrid = document.querySelector('.testimonials-grid');

// Active customization state
let activeCustomizingFood = null;

// Initializer Function
document.addEventListener('DOMContentLoaded', () => {
    // 1. Hide Loading Screen
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1500);
    }

    // 2. Initialize Dark/Light Mode
    const savedTheme = localStorage.getItem('hb_theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.classList.add('light-theme');
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    } else {
        document.documentElement.classList.remove('light-theme');
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    // 3. Render Cart & Testimonials
    updateCart();
    renderReviews();
    filterMenu();
});

// Sound toggle wrapper
function triggerSound(type) {
    if (type === 'click') AudioFX.playClick();
    if (type === 'success') AudioFX.playSuccess();
}

// ----------------------------------------------------
// Theme Toggler
// ----------------------------------------------------
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isLight = document.documentElement.classList.toggle('light-theme');
        triggerSound('click');
        if (isLight) {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('hb_theme', 'light');
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('hb_theme', 'dark');
        }
    });
}

// ----------------------------------------------------
// Mobile Navbar Toggle
// ----------------------------------------------------
hamburger.addEventListener('click', () => {
    triggerSound('click');
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scroll for nav anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ----------------------------------------------------
// Cart Toggle & Core Actions
// ----------------------------------------------------
cartToggle.addEventListener('click', () => {
    triggerSound('click');
    cartSidebar.classList.add('open');
});

closeCart.addEventListener('click', () => {
    triggerSound('click');
    cartSidebar.classList.remove('open');
});

// Close sidebar on outer click
document.addEventListener('click', (e) => {
    if (!cartSidebar.contains(e.target) && 
        !cartToggle.contains(e.target) && 
        !checkoutModal.contains(e.target) &&
        !foodDetailModal.contains(e.target) &&
        !reviewModal.contains(e.target) &&
        cartSidebar.classList.contains('open')) {
        cartSidebar.classList.remove('open');
    }
});

// ----------------------------------------------------
// Upgraded Cart Management
// ----------------------------------------------------
function addToCart(name, price, image, customizations = null) {
    // Generate unique ID based on options to separate duplicates with different settings
    const configString = customizations ? JSON.stringify(customizations) : '';
    const itemKey = `${name}_${configString}`;
    
    const existingItem = cart.find(item => item.itemKey === itemKey);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            itemKey: itemKey,
            name: name,
            price: price,
            image: image,
            quantity: 1,
            customizations: customizations
        });
    }
    
    updateCart();
    triggerSound('click');
    showNotification(`Added ${name} to your plate! 🍽️`);
}

function updateCart() {
    cartItems.innerHTML = '';
    let subtotal = 0;
    let itemCount = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center" style="padding: 3rem 1rem; color: var(--text-muted);">
                <i class="fas fa-shopping-basket" style="font-size: 2.5rem; margin-bottom: 1rem;"></i>
                <p>Your basket is empty.<br>Start adding tasty treats!</p>
            </div>
        `;
    }

    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        itemCount += item.quantity;

        // Customizations descriptor
        let optionText = '';
        if (item.customizations) {
            const opts = [];
            if (item.customizations.size && item.customizations.size !== 'Regular') {
                opts.push(item.customizations.size);
            }
            if (item.customizations.spicy && item.customizations.spicy !== 'Mild') {
                opts.push(item.customizations.spicy);
            }
            if (item.customizations.extras && item.customizations.extras.length > 0) {
                item.customizations.extras.forEach(ex => opts.push(ex));
            }
            if (opts.length > 0) {
                optionText = `<div style="font-size: 0.75rem; color: var(--text-accent); margin-top: 3px; font-weight: 600;">${opts.join(' | ')}</div>`;
            }
        }

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                ${optionText}
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="adjustQty('${item.itemKey}', -1)">-</button>
                    <span class="cart-item-qty">${item.quantity}</span>
                    <button class="qty-btn" onclick="adjustQty('${item.itemKey}', 1)">+</button>
                    <button class="cart-item-remove" onclick="removeCartItem('${item.itemKey}')" aria-label="Remove item">
                        <i class="fas fa-trash-can"></i>
                    </button>
                </div>
            </div>
            <div class="cart-item-price">₹${item.price * item.quantity}</div>
        `;
        cartItems.appendChild(cartItem);
    });

    // Recalculate Prices
    let discount = 0;
    if (activeCoupon && subtotal > 0) {
        if (activeCoupon.code === 'HUNGER50') {
            discount = Math.min(subtotal * 0.5, 150); // 50% off up to ₹150
        } else if (activeCoupon.code === 'WELCOME100') {
            if (subtotal >= 300) {
                discount = 100; // Flat ₹100 off above ₹300
            } else {
                activeCoupon = null; // Auto invalidate
                localStorage.removeItem('hb_coupon');
                promoMessage.className = 'promo-message error';
                promoMessage.textContent = 'WELCOME100 requires a minimum order of ₹300. Coupon removed.';
            }
        } else if (activeCoupon.code === 'FREEFEAST') {
            discount = Math.floor(subtotal * 0.15); // 15% off, no limit
        }
    }

    let deliveryFee = 0;
    if (subtotal > 0) {
        deliveryFee = subtotal >= 500 ? 0 : 40; // Free delivery above 500
    }

    const tax = Math.floor(subtotal * 0.05); // 5% GST
    const grandTotal = Math.max(0, subtotal - discount + deliveryFee + tax);

    // Update displays
    summarySubtotal.textContent = `₹${subtotal}`;
    summaryDelivery.textContent = deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`;
    summaryTax.textContent = `₹${tax}`;
    cartTotalElement.textContent = `₹${grandTotal}`;
    cartCount.textContent = itemCount;

    if (discount > 0) {
        discountRow.style.display = 'table-row';
        discountName.textContent = activeCoupon.code;
        summaryDiscount.textContent = `-₹${discount}`;
    } else {
        discountRow.style.display = 'none';
    }

    // Save to LocalStorage
    localStorage.setItem('hb_cart', JSON.stringify(cart));
}

window.adjustQty = function(itemKey, amount) {
    triggerSound('click');
    const item = cart.find(i => i.itemKey === itemKey);
    if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.itemKey !== itemKey);
        }
        updateCart();
    }
};

window.removeCartItem = function(itemKey) {
    triggerSound('click');
    cart = cart.filter(i => i.itemKey !== itemKey);
    updateCart();
    showNotification('Item removed from cart.');
};

// ----------------------------------------------------
// Promo Code Verification
// ----------------------------------------------------
applyPromoBtn.addEventListener('click', () => {
    triggerSound('click');
    const code = promoInput.value.trim().toUpperCase();
    
    if (cart.length === 0) {
        promoMessage.className = 'promo-message error';
        promoMessage.textContent = 'Add items to your cart first!';
        return;
    }
    if (!code) {
        promoMessage.className = 'promo-message error';
        promoMessage.textContent = 'Please enter a valid coupon code.';
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (code === 'HUNGER50') {
        activeCoupon = { code: 'HUNGER50' };
        localStorage.setItem('hb_coupon', JSON.stringify(activeCoupon));
        promoMessage.className = 'promo-message success';
        promoMessage.textContent = 'HUNGER50 applied! 50% discount up to ₹150 saved.';
    } else if (code === 'WELCOME100') {
        if (subtotal < 300) {
            promoMessage.className = 'promo-message error';
            promoMessage.textContent = 'WELCOME100 requires a minimum order of ₹300.';
            return;
        }
        activeCoupon = { code: 'WELCOME100' };
        localStorage.setItem('hb_coupon', JSON.stringify(activeCoupon));
        promoMessage.className = 'promo-message success';
        promoMessage.textContent = 'WELCOME100 applied! Flat ₹100 discount saved.';
    } else if (code === 'FREEFEAST') {
        activeCoupon = { code: 'FREEFEAST' };
        localStorage.setItem('hb_coupon', JSON.stringify(activeCoupon));
        promoMessage.className = 'promo-message success';
        promoMessage.textContent = 'FREEFEAST applied! 15% discount saved.';
    } else {
        promoMessage.className = 'promo-message error';
        promoMessage.textContent = 'Invalid promo code. Try HUNGER50, WELCOME100, or FREEFEAST.';
        return;
    }

    promoInput.value = '';
    updateCart();
    triggerSound('success');
});

// ----------------------------------------------------
// Advanced Food Customization Dialog
// ----------------------------------------------------
document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('click', (e) => {
        // Exclude add-to-cart clicks
        if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
            return;
        }

        const name = card.querySelector('h3').textContent;
        const price = parseInt(card.getAttribute('data-price'));
        const image = card.querySelector('img').src;
        const desc = card.querySelector('p').textContent;
        const badge = card.querySelector('.card-badge')?.textContent || 'Best Seller';

        activeCustomizingFood = { name, price, image };

        // Set detailed nutrient info based on food categories for premium mock logic
        let cals = 350, prot = "12g", carb = "38g";
        const cat = card.getAttribute('data-category');
        if (cat === 'burgers') {
            cals = 540; prot = "24g"; carb = "42g";
        } else if (cat === 'pizza') {
            cals = 680; prot = "28g"; carb = "78g";
        } else if (cat === 'pasta') {
            cals = 480; prot = "15g"; carb = "62g";
        } else if (cat === 'desserts') {
            cals = 410; prot = "6g"; carb = "52g";
        } else if (cat === 'drinks') {
            cals = 180; prot = "2g"; carb = "32g";
        }

        // Fill modal properties
        modalFoodName.textContent = name;
        modalFoodImage.src = image;
        modalFoodDescription.textContent = desc;
        modalFoodBadge.textContent = badge;
        nutrCal.textContent = cals;
        nutrProt.textContent = prot;
        nutrCarb.textContent = carb;

        // Reset customization form elements
        customizationForm.reset();
        calculateModalTotal();

        foodDetailModal.showModal();
        triggerSound('click');
    });
});

function calculateModalTotal() {
    if (!activeCustomizingFood) return;
    
    let total = activeCustomizingFood.price;

    // Portion size pricing
    const sizeVal = customizationForm.querySelector('input[name="size"]:checked').value;
    if (sizeVal === 'Medium') total += 60;
    if (sizeVal === 'Large') total += 120;

    // Extras pricing
    const extras = customizationForm.querySelectorAll('input[name="extra"]:checked');
    extras.forEach(ex => {
        if (ex.value === 'Extra Cheese') total += 49;
        if (ex.value === 'Double Cheese') total += 79;
    });

    modalTotalPrice.textContent = `₹${total}`;
    return total;
}

// Recalculate price on customization change
customizationForm.addEventListener('change', calculateModalTotal);

addCustomizedToCartBtn.addEventListener('click', () => {
    if (!activeCustomizingFood) return;
    
    const sizeVal = customizationForm.querySelector('input[name="size"]:checked').value;
    const spicyVal = customizationForm.querySelector('input[name="spicy"]:checked').value;
    
    const extrasChecked = customizationForm.querySelectorAll('input[name="extra"]:checked');
    const selectedExtras = Array.from(extrasChecked).map(e => e.value);

    const finalPrice = calculateModalTotal();

    const customizations = {
        size: sizeVal,
        spicy: spicyVal,
        extras: selectedExtras
    };

    // Format item display name with choices
    let displayName = activeCustomizingFood.name;

    addToCart(displayName, finalPrice, activeCustomizingFood.image, customizations);
    foodDetailModal.close();
});

const closeFoodActions = [closeFoodModal, cancelFoodBtn];
closeFoodActions.forEach(btn => {
    btn.addEventListener('click', () => {
        triggerSound('click');
        foodDetailModal.close();
    });
});

// ----------------------------------------------------
// Menu Real-time Search, Veg-only and Sorting
// ----------------------------------------------------
function filterMenu() {
    const searchVal = menuSearch.value.toLowerCase().trim();
    const isVegOnly = vegToggle.checked;
    const sortVal = menuSort.value;

    if (isVegOnly) {
        vegLabel.classList.add('active');
    } else {
        vegLabel.classList.remove('active');
    }

    const cards = Array.from(document.querySelectorAll('.menu-card'));

    cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const desc = card.querySelector('p').textContent.toLowerCase();
        const category = card.getAttribute('data-category');
        const isVeg = card.getAttribute('data-veg') === 'true';

        // 1. Category Filter matching
        const matchCategory = currentFilter === 'all' || category === currentFilter;
        // 2. Search Query matching
        const matchSearch = title.includes(searchVal) || desc.includes(searchVal);
        // 3. Veg Only matching
        const matchVeg = !isVegOnly || isVeg;

        if (matchCategory && matchSearch && matchVeg) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.4s ease';
        } else {
            card.style.display = 'none';
        }
    });

    // 4. Sorting logic
    cards.sort((a, b) => {
        const priceA = parseInt(a.getAttribute('data-price'));
        const priceB = parseInt(b.getAttribute('data-price'));
        const ratingA = parseFloat(a.getAttribute('data-rating'));
        const ratingB = parseFloat(b.getAttribute('data-rating'));
        const popA = parseInt(a.getAttribute('data-popularity'));
        const popB = parseInt(b.getAttribute('data-popularity'));

        if (sortVal === 'price-low') {
            return priceA - priceB;
        } else if (sortVal === 'price-high') {
            return priceB - priceA;
        } else if (sortVal === 'rating') {
            return ratingB - ratingA;
        } else { // popularity default
            return popB - popA;
        }
    });

    // Re-append sorted cards in grid container
    cards.forEach(card => menuGrid.appendChild(card));
}

// Attach Search/Sort filters trigger
menuSearch.addEventListener('input', filterMenu);
vegToggle.addEventListener('change', filterMenu);
menuSort.addEventListener('change', filterMenu);

// Category buttons click filter trigger
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        triggerSound('click');
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.getAttribute('data-filter');
        filterMenu();
    });
});

// Add items directly from "Add to Cart" grid button
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation(); // Stop opening the customize modal
        const card = this.closest('.menu-card');
        const name = card.querySelector('h3').textContent;
        const price = parseInt(card.getAttribute('data-price'));
        const image = card.querySelector('img').src;

        addToCart(name, price, image);
    });
});

// ----------------------------------------------------
// Multi-step Checkout Wizard & Delivery Scooter tracker
// ----------------------------------------------------
let checkoutStep = 1;
const totalSteps = 4;

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        showNotification('Your basket is empty! Add items to checkout.');
        return;
    }

    triggerSound('click');
    cartSidebar.classList.remove('open');
    openCheckoutWizard();
});

function openCheckoutWizard() {
    checkoutStep = 1;
    updateStepPanel();
    
    // Reset inputs
    addressForm.reset();
    document.getElementById('upiId').value = '';
    document.getElementById('cardNumber').value = '';
    
    // Clear tracker visual states
    trackerFill.style.width = '0%';
    trackerScooter.style.left = '10px';
    document.querySelectorAll('.tracking-timeline-item').forEach((item, index) => {
        item.className = index === 0 ? 'tracking-timeline-item active' : 'tracking-timeline-item';
    });

    // Draw summary list
    checkoutSummaryItems.innerHTML = '';
    cart.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.style.cssText = 'display:flex; justify-content:space-between; margin-bottom: 8px; font-size: 0.95rem; border-bottom:1px solid rgba(255,255,255,0.03); padding-bottom:6px;';
        itemRow.innerHTML = `
            <div>
                <strong>${item.name}</strong> x ${item.quantity}
            </div>
            <div>₹${item.price * item.quantity}</div>
        `;
        checkoutSummaryItems.appendChild(itemRow);
    });

    // Fetch and sync price fields
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    if (activeCoupon) {
        if (activeCoupon.code === 'HUNGER50') {
            discount = Math.min(subtotal * 0.5, 150);
        } else if (activeCoupon.code === 'WELCOME100') {
            discount = subtotal >= 300 ? 100 : 0;
        } else if (activeCoupon.code === 'FREEFEAST') {
            discount = Math.floor(subtotal * 0.15);
        }
    }
    const delivery = subtotal >= 500 ? 0 : 40;
    const tax = Math.floor(subtotal * 0.05);
    const total = subtotal - discount + delivery + tax;

    chkSubtotal.textContent = `₹${subtotal}`;
    chkDelivery.textContent = delivery === 0 ? 'FREE' : `₹${delivery}`;
    chkTax.textContent = `₹${tax}`;
    chkTotal.textContent = `₹${total}`;

    if (discount > 0) {
        chkDiscountRow.style.display = 'table-row';
        chkDiscount.textContent = `-₹${discount}`;
    } else {
        chkDiscountRow.style.display = 'none';
    }

    checkoutModalFooter.style.display = 'flex';
    checkoutModal.showModal();
}

function updateStepPanel() {
    stepPanels.forEach(panel => panel.classList.remove('active'));
    document.getElementById(`stepPanel${checkoutStep}`).classList.add('active');

    // Update dots indicator
    stepDots.forEach((dot, idx) => {
        dot.className = 'checkout-step-dot';
        if (idx + 1 === checkoutStep) {
            dot.classList.add('active');
        } else if (idx + 1 < checkoutStep) {
            dot.classList.add('completed');
            dot.innerHTML = '<i class="fas fa-check"></i>';
        } else {
            dot.textContent = idx + 1;
        }
    });

    // Update progress bar width
    const progressPercent = ((checkoutStep - 1) / (totalSteps - 1)) * 100;
    checkoutProgress.style.width = `${progressPercent}%`;

    // Footer buttons state
    checkoutBackBtn.style.display = checkoutStep > 1 && checkoutStep < 4 ? 'block' : 'none';
    
    if (checkoutStep === 3) {
        checkoutNextBtn.textContent = 'Pay & Place Order';
    } else {
        checkoutNextBtn.textContent = 'Next';
    }
}

// Payment selectors toggle
paymentOptions.forEach(opt => {
    opt.addEventListener('click', () => {
        triggerSound('click');
        paymentOptions.forEach(card => card.classList.remove('selected'));
        opt.classList.add('selected');
        
        const method = opt.getAttribute('data-method');
        if (method === 'upi') {
            paymentUpiInput.style.display = 'flex';
            paymentCardInput.style.display = 'none';
        } else if (method === 'card') {
            paymentUpiInput.style.display = 'none';
            paymentCardInput.style.display = 'flex';
        } else {
            paymentUpiInput.style.display = 'none';
            paymentCardInput.style.display = 'none';
        }
    });
});

checkoutNextBtn.addEventListener('click', () => {
    triggerSound('click');

    if (checkoutStep === 1) {
        checkoutStep++;
        updateStepPanel();
    } else if (checkoutStep === 2) {
        // Validate Address Form inputs
        const name = document.getElementById('custName').value.trim();
        const phone = document.getElementById('custPhone').value.trim();
        const address = document.getElementById('custAddress').value.trim();

        if (!name || !phone || !address) {
            showNotification('Please fill in all shipping details.', 'error');
            return;
        }

        checkoutStep++;
        updateStepPanel();
    } else if (checkoutStep === 3) {
        // Validate Payment details inputs
        const selectedOpt = document.querySelector('.payment-option-card.selected');
        const method = selectedOpt.getAttribute('data-method');

        if (method === 'upi') {
            const upiId = document.getElementById('upiId').value.trim();
            if (!upiId) {
                showNotification('Please fill in your UPI address.');
                return;
            }
        } else if (method === 'card') {
            const cardNum = document.getElementById('cardNumber').value.trim();
            if (!cardNum) {
                showNotification('Please enter your card number.');
                return;
            }
        }

        checkoutStep++;
        updateStepPanel();
        checkoutModalFooter.style.display = 'none'; // Hide buttons on tracker screen
        runScooterDeliveryTracker();
    }
});

checkoutBackBtn.addEventListener('click', () => {
    triggerSound('click');
    if (checkoutStep > 1) {
        checkoutStep--;
        updateStepPanel();
    }
});

// Run Delivery Scooter simulated updates
function runScooterDeliveryTracker() {
    triggerSound('success');
    
    const step1 = document.getElementById('trackStep1');
    const step2 = document.getElementById('trackStep2');
    const step3 = document.getElementById('trackStep3');
    const step4 = document.getElementById('trackStep4');

    // 0s: Order placed
    setTimeout(() => {
        trackerFill.style.width = '33%';
        trackerScooter.style.left = '33%';
        step1.classList.replace('active', 'completed');
        step2.classList.add('active');
        triggerSound('click');
    }, 4000);

    // 4s: Cooking food
    setTimeout(() => {
        trackerFill.style.width = '66%';
        trackerScooter.style.left = '66%';
        step2.classList.add('completed');
        step3.classList.add('active');
        triggerSound('click');
    }, 8000);

    // 8s: Out for delivery
    setTimeout(() => {
        trackerFill.style.width = '100%';
        trackerScooter.style.left = 'calc(100% - 40px)';
        step3.classList.add('completed');
        step4.classList.add('active');
        
        // Delivered! Show confetti and note chime sounds
        triggerSound('success');
        launchConfetti();
        
        // Add Close Button dynamically to let the user clear state
        const closeBtn = document.createElement('button');
        closeBtn.className = 'btn btn-primary';
        closeBtn.style.cssText = 'margin: 1.5rem auto 0; display: block;';
        closeBtn.textContent = 'Awesome, Thank You!';
        closeBtn.onclick = () => {
            triggerSound('click');
            checkoutModal.close();
            // Clear checkout cart list
            cart = [];
            activeCoupon = null;
            localStorage.removeItem('hb_cart');
            localStorage.removeItem('hb_coupon');
            updateCart();
        };
        document.querySelector('.tracking-container').appendChild(closeBtn);
    }, 12000);
}

closeCheckoutModal.addEventListener('click', () => {
    triggerSound('click');
    // If not completed delivery yet, warn user
    if (checkoutStep === 4) {
        // Allow close but clear cart state
        cart = [];
        activeCoupon = null;
        localStorage.removeItem('hb_cart');
        localStorage.removeItem('hb_coupon');
        updateCart();
    }
    checkoutModal.close();
});

// ----------------------------------------------------
// Reviews Submission Modal & Local Persist Grid
// ----------------------------------------------------
let selectedStars = 5;
let selectedAvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&h=60&fit=crop";

// Star rating interactive selector hover & click
const stars = document.querySelectorAll('#starRatingSelector i');
stars.forEach(star => {
    star.addEventListener('click', () => {
        triggerSound('click');
        selectedStars = parseInt(star.getAttribute('data-rating'));
        highlightStars(selectedStars);
    });
});

function highlightStars(rating) {
    stars.forEach(star => {
        const starVal = parseInt(star.getAttribute('data-rating'));
        if (starVal <= rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Avatar grid interactive selection
const avatarOptions = document.querySelectorAll('.avatar-option');
avatarOptions.forEach(av => {
    av.addEventListener('click', () => {
        triggerSound('click');
        avatarOptions.forEach(img => img.classList.remove('selected'));
        av.classList.add('selected');
        selectedAvatarUrl = av.getAttribute('data-avatar');
    });
});

// Post review form submission handler
submitReviewBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const name = document.getElementById('revName').value.trim();
    const comment = document.getElementById('revComment').value.trim();

    if (!name || !comment) {
        showNotification('Please write your name and review details.');
        return;
    }

    triggerSound('success');

    const newReview = {
        name: name,
        role: "Food Connoisseur",
        comment: comment,
        stars: selectedStars,
        avatar: selectedAvatarUrl
    };

    userReviews.unshift(newReview);
    localStorage.setItem('hb_reviews', JSON.stringify(userReviews));

    renderReviews();
    reviewModal.close();
    showNotification('Thank you for sharing your feedback! 💖');
});

// Prepend and render reviews in testimonials section grid
function renderReviews() {
    testimonialsGrid.innerHTML = '';
    
    // Merge initial built-in reviews and user submitted ones
    const allReviews = [...userReviews, ...defaultReviews];
    
    allReviews.forEach(rev => {
        const starsHtml = Array(rev.stars).fill('<i class="fas fa-star"></i>').join('');
        
        const card = document.createElement('div');
        card.className = 'testimonial-card fade-in visible'; // visible by default
        card.innerHTML = `
            <div class="stars">
                ${starsHtml}
            </div>
            <p>"${rev.comment}"</p>
            <div class="customer">
                <img src="${rev.avatar}" alt="${rev.name}">
                <div>
                    <h4>${rev.name}</h4>
                    <span>${rev.role}</span>
                </div>
            </div>
        `;
        testimonialsGrid.appendChild(card);
    });
}

// Form Open/Close Actions
openReviewBtn.addEventListener('click', () => {
    triggerSound('click');
    reviewForm.reset();
    selectedStars = 5;
    highlightStars(5);
    avatarOptions.forEach(img => img.classList.remove('selected'));
    avatarOptions[0].classList.add('selected');
    selectedAvatarUrl = avatarOptions[0].getAttribute('data-avatar');
    reviewModal.showModal();
});

const closeReviewActions = [closeReviewModal, cancelReviewBtn];
closeReviewActions.forEach(btn => {
    btn.addEventListener('click', () => {
        triggerSound('click');
        reviewModal.close();
    });
});

// ----------------------------------------------------
// UI Notification Alert Toast Banner
// ----------------------------------------------------
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Style notifications
    const isError = type === 'error';
    const bgGradient = isError 
        ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
        : 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)';
    const shadowColor = isError ? 'rgba(231, 76, 60, 0.4)' : 'rgba(255, 107, 107, 0.4)';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgGradient};
        color: white;
        padding: 1rem 2rem;
        border-radius: 15px;
        box-shadow: 0 8px 25px ${shadowColor};
        z-index: 100000;
        transform: translateX(120%);
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 600;
        border: 1px solid rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto dismiss after 3.2s
    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3200);
}

// ----------------------------------------------------
// Scroll Animations & Parallax Effects
// ----------------------------------------------------
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.menu-card, .testimonial-card, .feature').forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// Parallax scroll on hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.transform = `translateY(${scrolled * 0.25}px)`;
    }
});

// Sticky header transition on scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (!header) return;
    if (window.scrollY > 80) {
        header.style.background = 'rgba(26, 26, 46, 0.98)';
        header.style.backdropFilter = 'blur(20px)';
        header.style.boxShadow = '0 6px 30px rgba(0, 0, 0, 0.4)';
        header.style.padding = '14px 48px';
    } else {
        header.style.background = 'rgba(26, 26, 46, 0.95)';
        header.style.backdropFilter = 'blur(15px)';
        header.style.boxShadow = '0 2px 16px rgba(0, 0, 0, 0.2)';
        header.style.padding = '18px 48px';
    }
});

// Stats counting indicators animation
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            const text = target.textContent;
            
            if (text.includes('10k+')) {
                target.textContent = '0+';
                setTimeout(() => {
                    animateCounter(target, 10, 1500);
                    // Add suffix back
                    setTimeout(() => target.textContent = '10k+ customers', 1500);
                }, 200);
            } else if (text.includes('4.8')) {
                target.textContent = '0';
                setTimeout(() => {
                    let current = 0;
                    const timer = setInterval(() => {
                        current += 0.1;
                        if (current >= 4.8) {
                            target.textContent = '4.8 rating';
                            clearInterval(timer);
                        } else {
                            target.textContent = `${current.toFixed(1)} rating`;
                        }
                    }, 35);
                }, 200);
            }
            
            counterObserver.unobserve(target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat span').forEach(stat => {
    counterObserver.observe(stat);
});

// Keyboard Accessibility hooks (ESC to close panels)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        cartSidebar.classList.remove('open');
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Ripple Effect helper
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.className = 'ripple';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

document.querySelectorAll('.btn, .add-to-cart, .filter-btn, .apply-promo-btn').forEach(button => {
    button.addEventListener('click', createRipple);
});

// Easter egg - Konami sequence
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        triggerSound('success');
        launchConfetti();
        showNotification('🎉 Konami Code! Free dessert on your next order! 🍰✨');
        konamiCode = [];
    }
});

console.log('🍔 HungerBites fully enhanced with interactive elements and premium UI/UX by Dishita Taneja! 🚀✨');