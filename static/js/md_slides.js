/* ----------------------------- *\
    Slides
    This script is use to render
    slides and interactions
        1. Initialization
        2. (func) Slide preview
        3. Slide fullscreen
\* ----------------------------- */

/* ----------------------------- *\
    Initialization
\* ----------------------------- */ 
// Set slide preview first
set_slide_preview()

/* ----------------------------- *\
    Slide preview
\* ----------------------------- */ 
function set_slide_preview(){
    // slide preview
    $slide = $('.slide')
    let slide_width = $slide.width()
    let window_width = $(window).width()
    $slide.find('.slide__main').css({
        'transform': 'scale('+ slide_width / window_width +')',
        'transform-origin': 'left top',
        'width': window_width+'px',
        'height': window_width*0.565+'px',
    })
    
    // set fullscreen btn elements
    if ($('.preview-content').hasClass('slide-content')){
        $('.slide-fullscreen-btn').show()
    } else {
        $('.slide-fullscreen-btn').hide()
    }
    $('.slide-fullscreen-btn').on('click', function(){
        open_fullscreen()
    })
}

/* ------------------------------- *\
    Slide: fullscreen by button (with fullscreen method)
\* ------------------------------- */
// fullscreen init
$('.slide-content').attr('id', 'slide-content-fullscreen')
let fs_elem = document.getElementById("slide-content-fullscreen")

// fullscreen render
if (fs_elem){
    fs_elem.addEventListener('fullscreenchange', (event) => {
        if (window.innerHeight == screen.height) set_fullscreen_slide()
    })
}

 // trigger original fullscreen
function open_fullscreen() {
    if (fs_elem.requestFullscreen) {
        fs_elem.requestFullscreen();
    } else if (fs_elem.webkitRequestFullscreen) { /* Safari */
        fs_elem.webkitRequestFullscreen();
    } else if (fs_elem.msRequestFullscreen) { /* IE11 */
        fs_elem.msRequestFullscreen();
    }
}

/* ------------------------------- *\
    Slide: fullscreen by F11 (f11 fullscreen mode)
\* ------------------------------- */
// trigger by f11 mode (so that notebook pad can zoom in)
let is_fullscreen = false
$(window).on('keyup', function(e){
    if (e.key === 'F11' || e.keyCode === 122){
        e.stopPropagation()
        is_fullscreen = true
        set_fullscreen_slide()
    }
})
// BUGS: 1. ctrl+{+-} and developer tool are resize events too. So they will automatic reset fullscreen
$(window).resize(function(){
    if (window.innerHeight != screen.height) reset_fullscreen_slide()
})

/* ------------------------------- *\
    Slide: set & reset fullscreen (common usage)
\* ------------------------------- */
// set fullscreen slide style and function
function set_fullscreen_slide(){
    // fullscreen status
    $('.layout-preview').addClass('fullscreen')
        
    // slick slide initialization
    let $carousel = $(".slides").slick({
        arrows: false,
        speed: 0,
        swipe: false,
        infinite: false,
    })

    // slide key control
    $(document).on('keydown', function(e) {
        if (e.keyCode == 37 || e.keyCode == 38) {
            console.log('prev page')
            $carousel.slick('slickPrev')
        }
        if (e.keyCode == 39 || e.keyCode == 40) {
            console.log('next page')
            $carousel.slick('slickNext')
        }
        if (e.keyCode == 36){
            console.log('cover');
            $carousel.slick('slickGoTo', 0)
        }
        if (e.keyCode == 35){
            console.log('back cover')
            let slide_num = $('[data-slick-index]').last().attr('data-slick-index')
            $carousel.slick('slickGoTo', slide_num)
        }
    })
}

// reset fullscreen slide style and function
function reset_fullscreen_slide(){
    $('.layout-preview').removeClass('fullscreen')
    $('.slides.slick-slider').slick('unslick')
}