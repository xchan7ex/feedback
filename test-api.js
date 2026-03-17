// use native fetch

async function testApi() {
  try {
    const response = await fetch('http://localhost:5000/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nickname: 'TestUser',
        review: 'This is a test review',
        rating: 5
      })
    });
    const text = await response.text();
    import('fs').then(fs => fs.writeFileSync('error_out.txt', text));
    console.log(`Status: ${response.status}`);
    console.log(`Body: ${text}`);
  } catch (err) {
    console.error('Fetch Error:', err);
  }
}

testApi();
