const register = () => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

            navigator.serviceWorker.register(swUrl).then(registration => {
                console.log('Service Worker registered: ', registration);
            }).catch(registrationError => {
                console.log('Service Worker registration failed: ', registrationError);
            });
        });
    }
};

export { register };