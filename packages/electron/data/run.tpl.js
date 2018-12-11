window.addEventListener('load', () => {
    console.log('haha')
    const s = document.createElement('script');
    s.src = `${LR_URL}/livereload.js?snipver=1`;
    document.body.appendChild(s);
});
