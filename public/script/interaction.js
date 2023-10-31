const copyText = document.getElementById('copyText');
copyText.addEventListener('click', (e) => {
    let currentURL = window.location.href;
    currentURL = currentURL.replace(/(^\w+:|^)\/\//, '');
    navigator.clipboard.writeText(currentURL)
        .then(() => {
            console.log('URL copied to clipboard: ', currentURL);
            alert('URL copied to clipboard: ' + currentURL);
        })
        .catch(err => {
            console.error('Error copying URL to clipboard: ', err);
        });
});