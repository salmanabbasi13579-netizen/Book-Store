document.addEventListener('DOMContentLoaded', () => {
    const getCart = () => {
        const cartString = localStorage.getItem('bookCart');
        return cartString ? JSON.parse(cartString) : [];
    };

    const saveCart = (cart) => {
        localStorage.setItem('bookCart', JSON.stringify(cart));
        if (document.URL.includes('order.html') && typeof renderCart === 'function') {
            renderCart();
        }
    };

    if (document.URL.includes('books.html')) {
        const cartButtons = document.querySelectorAll('.add-cart-btn');

        cartButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const card = event.target.closest('.book-card');
                if (!card) return;

                const title = card.querySelector('h3')?.textContent?.trim() || 'Untitled';
                const authorText = card.querySelectorAll('p')[0]?.textContent || '';
                const author = authorText.replace(/^By:\s*/i, '').trim();

                const priceElement = card.querySelectorAll('p')[1];
                const priceText = priceElement ? priceElement.textContent : '0';
                const priceNumber = priceText.replace(/[^0-9.]/g, '') || '0';
                const price = parseFloat(priceNumber) || 0;

                const imgEl = card.querySelector('img');
                const imageSrc = imgEl ? imgEl.src : '';

                let cart = getCart();
                const existingItem = cart.find(item => item.title === title);

                if (existingItem) {
                    existingItem.quantity += 1;
                    alert(`${title} added to your cart. Quantity: ${existingItem.quantity}`);
                } else {
                    const newBook = {
                        title: title,
                        author: author,
                        price: price,
                        image: imageSrc,
                        quantity: 1
                    };
                    cart.push(newBook);
                    alert(`${title} added to your cart. Quantity: 1`);
                }

                saveCart(cart);
            });
        });
    }

    const removeItem = (titleToRemove) => {
        let cart = getCart();
        const updatedCart = cart.filter(item => item.title !== titleToRemove);
        saveCart(updatedCart);
    };

    const placeOrder = () => {
        if (getCart().length > 0) {
            window.location.href = 'checkout.html';
        } else {
            alert("Your cart is empty. Please add items before proceeding to checkout.");
        }
    };

    const renderCart = () => {
        const cart = getCart();
        const cartListElement = document.getElementById('cart-items-list');
        const cartSummaryElement = document.getElementById('cart-summary');
        const emptyMessageElement = document.getElementById('empty-cart-message');

        if (!cartListElement || !cartSummaryElement || !emptyMessageElement) return;

        cartListElement.innerHTML = '';

        if (cart.length === 0) {
            emptyMessageElement.style.display = 'block';
            cartSummaryElement.style.display = 'none';
            return;
        }

        emptyMessageElement.style.display = 'none';
        cartSummaryElement.style.display = 'block';

        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = (item.price || 0) * (item.quantity || 1);
            subtotal += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="item-details">
                    <img src="${item.image || ''}" alt="${item.title} cover">
                    <div class="item-info">
                        <h4>${item.title} (x${item.quantity})</h4>
                        <p>By: ${item.author}</p>
                    </div>
                </div>
                <div class="item-actions">
                    <span class="item-price">$${itemTotal.toFixed(2)}</span>
                    <button class="remove-btn" data-title="${item.title}">Remove</button>
                </div>
            `;
            cartListElement.appendChild(itemElement);
        });

        cartListElement.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const title = event.target.getAttribute('data-title');
                removeItem(title);
            });
        });

        const taxRate = 0.05;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;

        document.getElementById('cart-subtotal').textContent = '$' + subtotal.toFixed(2);
        document.getElementById('cart-tax').textContent = '$' + tax.toFixed(2);
        document.getElementById('cart-total').textContent = '$' + total.toFixed(2);

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn && !checkoutBtn.hasAttribute('data-listener')) {
            checkoutBtn.addEventListener('click', placeOrder);
            checkoutBtn.setAttribute('data-listener', 'true');
        }
    };

    // Checkout page logic
    if (document.URL.includes('checkout.html')) {
        const checkoutForm = document.getElementById('checkout-form');
        const cardRadio = document.getElementById('card');
        const cardDetailsDiv = document.getElementById('card-details');

        const toggleCardDetails = () => {
            if (cardRadio && cardDetailsDiv) {
                cardDetailsDiv.style.display = cardRadio.checked ? 'block' : 'none';
            }
        };

        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            radio.addEventListener('change', toggleCardDetails);
        });

        toggleCardDetails();

        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (event) => {
                event.preventDefault();
                localStorage.removeItem('bookCart');
                window.location.href = 'order-success.html';
            });
        }
    }

    if (document.URL.includes('order.html')) {
        renderCart();
    }
});
