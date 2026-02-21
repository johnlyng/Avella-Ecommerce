const crypto = require('crypto');

async function test() {
    const guestToken = crypto.randomUUID();
    const userId = crypto.randomUUID();

    const res = await fetch('http://localhost:3001/api/cart/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestCartToken: guestToken, userId })
    });

    const data = await res.text();
    console.log("STATUS:", res.status);
    console.log("BODY:", data);
}

test();
