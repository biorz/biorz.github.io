$(function () {
    // banner init
    var banner = new Swiper('#banner', {
        // pagination: '.swiper-pagination',
        // paginationType: 'progress',
        paginationClickable: true,
        parallax: true,
        speed: 600,
        autoplay: 2500,
        autoplayDisableOnInteraction: false
    });

    var mobileNav = new Swiper('#main-nav-mobile', {
        direction: 'horizontal',
        slidesPerView: 'auto',
        mousewheelControl: true,
        freeMode: true
    });

})
