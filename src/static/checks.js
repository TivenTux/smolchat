function check_link_status(url) {
    const proxiedurl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    return fetch(proxiedurl, { method: 'HEAD' }) 
        .then(response => {
            if (response.ok) {
                return 'valid';
            } else if (response.status === 404) {
                return 'notfound';
            } else {
                return 'error';
            }
        })
        .catch(error => {
            console.log('Request failed:', error);
            return 'error';
        });
}