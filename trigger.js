const items = [{ product: { id: "1", name: "Test", price: 100, category: "Test", images: ["https://via.placeholder.com/150"] }, size: "M", quantity: 1 }];

fetch('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
})
    .then(res => res.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));
