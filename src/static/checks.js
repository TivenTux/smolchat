function check_link_status(url) {
    return fetch(url, { method: 'HEAD' }) 
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