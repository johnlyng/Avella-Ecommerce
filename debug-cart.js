async function testCart() {
    try {
        console.log('1. Creating cart...');
        const cartRes = await fetch('http://localhost:3001/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: 'test-session' })
        });
        const cartData = await cartRes.json();
        const cartToken = cartData.data.cart_token;
        console.log('Cart created. Token:', cartToken);

        console.log('\n2. Adding item by slug...');
        const addRes = await fetch(`http://localhost:3001/api/cart/${cartToken}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productSlug: 'sony-a7-iv',
                quantity: 1
            })
        });
        const addData = await addRes.json();
        console.log('Add to cart status:', addRes.status);
        console.log('Response data:', JSON.stringify(addData, null, 2));
    } catch (error) {
        console.error('\nERROR:', error.message);
    }
}

testCart();
