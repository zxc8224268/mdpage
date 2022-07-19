/* ----------------------------- *\
    Convertor:
    This script is use to convert
    raw markdown text to html
    structure, including note and
    slide.
        * Initialization
        * (func) Convert md to html
        * (fucn) Create slide structure
\* ----------------------------- */

/* ----------------------------- *\
    Initialization
\* ----------------------------- */
// Init converter (by showdown)
let converter = new showdown.Converter({
    backslashEscapesHTMLTags: true,
    tables: true,
    simplifiedAutoLink: true,
    openLinksInNewWindow: true,
    emoji: true,
    parseImgDimensions: true,
    strikethrough: true, // for ~~content~~ usages
    tasklists: true,
    // extensions: [],
    underline: true, // it will disable italic
    metadata: true, // not working
})

// // Init mermaid
// mermaid.initialize({
//     startOnLoad: false,
//     securityLevel: 'loose',
//     theme: 'base',
//     themeVariables: {
//         'darkMode': true,
//         'background': '#333333',
//         'primaryColor': '#191c21',
//     }
// })

// Convert md to html
convert_md_to_html($('.loaded-item-content').text())

/* ----------------------------- *\
    Convert md to html
\* ----------------------------- */
function convert_md_to_html(md_text){
    /* ----------------------------- *\
        Mistune: core
    \* ----------------------------- */
    // Conveter md to html
    let html = converter.makeHtml(md_text)
    // let metadata = converter.getMetadata(); // for metadata

    /* ----------------------------- *\
        Slide: post-processing
    \* ----------------------------- */
    // Normal note or slide flag
    is_slide = false
    
    // Detect slide
    $temp_node = $('.temp-node')
    $temp_node.html(html) // as temp
    $temp_node.find('h1').each(function(){ // kill id content (no need)
        if ($(this).text()=='===s'||$(this).text()=='===r'||$(this).text()=='===c'||$(this).text()=='===f'){
            is_slide = true
            $(this).attr('id', '')
        }
    })
    
    // Output for slide or note
    let output_html

    // Note or slide content
    if (is_slide) {
        output_html = create_slides_structure($temp_node.html())
        $('.preview-content').removeClass('note-content')
        $('.preview-content').addClass('slide-content')
    } else { 
        output_html = $temp_node.html()
        $('.preview-content').removeClass('slide-content')
        $('.preview-content').addClass('note-content')
    }
    $temp_node.empty()
    
    /* ----------------------------- *\
        Render: to show
    \* ----------------------------- */
    // Write into output area
    $('.preview-content').html(output_html)

    /* ----------------------------- *\
        Slide: post-processing (after render)
    \* ----------------------------- */
    if (is_slide) {
        // add cover and back-cover
        $('.slide').first().addClass('cover')
        $('.slide').last().addClass('back-cover')
        
        // ajust slide col with image elements
        $('.slide-col').each(function(){
            // for image auto fit
            if($(this).has('img').length != 0){
                let link = $(this).find('img').attr('src')
                // img html template
                $('<div class="image-container"><div class="image" style="background-image: url('+link+')"></div></div>').insertAfter($(this).find('img').parent('p'))
                $(this).find('img').parent('p').remove()
                $(this).parent('.slide-row').css({
                    'height': '100%'
                });
                
                // for stretch col
                if ($(this).length == 1){
                    $(this).css({
                        'width': '100%',
                    });
                // if there is a image in col, there will be a half page layout
                } else {
                    $(this).css({
                        'width': '50%',
                        'padding-top': '0',
                        'padding-bottom': '0'
                    })
                }
            }
        })

        // add slide page
        let page_num = 0;
        $('.slide__main').each(function(){
            // add page number
            $(this).append("<div class='slide-page-number'>"+page_num+"</div>")
            page_num += 1

            // if no slide footer
            if ($(this).has('.slide-footer').length == 0){
                $(this).css({
                    'padding-bottom': '80px'
                })
            }
        })
    }

    /* ----------------------------- *\
        Tags: post-processing (after render)
    \* ----------------------------- */
    tags_detector = $('.preview-content h6').text().slice(0,4).toLowerCase()
    item_tags = ''
    if (tags_detector == 'tag' || tags_detector == 'tags'){
        $('.preview-content h6').find('code').each(function(){
            item_tags = item_tags + $(this).text() + ','
        })
        // hide when slide
        if (is_slide){
            $('.preview-content h6').hide()
        }
    }
    item_tags = item_tags.slice(0,-1)

    /* ----------------------------- *\
        Table: post-processing (after render)
    \* ----------------------------- */
    $('.preview-content table').each(function(){
        $(this).prev().after(`
            <div class="table-container">`+ $(this).prop('outerHTML') +`</div>
        `)
        $(this).remove()
    })

    /* ----------------------------- *\
        Prism: post-processing (after render)
    \* ----------------------------- */
    Prism.highlightAll()
    // add line numbers
    $('.code-toolbar').addClass('line-numbers')

    /* ----------------------------- *\
        Mermaid: post-processing (after render)
    \* ----------------------------- */
    if ($('.mermaid').length != 0){
        mermaid_num = 0
        nodes = []
        $('.mermaid').each(function(){
            $(this).attr('id', 'mermaid_'+mermaid_num)
            mermaid_container = document.querySelector("#mermaid_"+mermaid_num)
            nodes.push(mermaid_container)
            mermaid_num++
        })
        for (let i = 0; i < nodes.length; ++i) {
            const id = `mermaid-${Date.now()}`;
            const element = nodes[i]
            try {
                mermaid.render(id, element.textContent.trim(), (svg, bind) => {element.innerHTML = svg;}, element)
            } catch(e){
                // pass error
                console.log('Mermaid is not complete.')
            }
        }
    }
    $('.mermaid').each(function(){
        $(this).wrap('<div class="mermaid-container"></div>')
    })

    /* ----------------------------- *\
        Mathjax: post-processing (after render)
    \* ----------------------------- */
    // pretty slow, maybe comment it out and use manual to convert
    // there is a bug: $$ sign will be killed when reopen view page
    // MathJax.typeset()

    /* ----------------------------- *\
        Toc: render table of content
    \* ----------------------------- */
    // here to add toc functions
    render_toc()

    return item_tags
}

/* ----------------------------- *\
    Render TOC (support for 3 levels)
\* ----------------------------- */ 
function render_toc(){
    // find toc format md
    let $toc_md
    $('p').each(function(){
        if($(this).html() == '[TOC]' || $(this).html() == '[toc]') $toc_md = $(this)
    })
    if ($toc_md){
        // remove toc md text
        $toc_md.remove()
        // render toc list
        let toc_template = `<div class="toc"><h4 class="toc-title">CONTENTS</h4><ul class="toc-levels">`
        $('h1, h2, h3').each(function(){
            if ($(this).is('h1')) toc_template += `<li class="toc-level-1"><a class="toc-link" href="#`+ $(this).attr('id') +`" title="`+ $(this).html() +`">`+ $(this).html() +`</a></li>`
            else if ($(this).is('h2'))toc_template += `<li class="toc-level-2"><a class="toc-link" href="#`+ $(this).attr('id') +`" title="`+ $(this).html() +`">`+ $(this).html() +`</a></li>`
            else if ($(this).is('h3'))toc_template += `<li class="toc-level-3"><a class="toc-link" href="#`+ $(this).attr('id') +`" title="`+ $(this).html() +`">`+ $(this).html() +`</a></li>`
        })
        toc_template += `</div>`
        $('.preview-content').prepend(toc_template)

        // toc scroll and highlight
        let tops = []
        let ids = []
        $('h1, h2, h3').each(function(){
            tops.push($(this).offset().top)
            ids.push($(this).attr('id'))
        })
        $(window).on('scroll', function(){
            $('.toc li').removeClass('active')
            let current_top = $(this).scrollTop()
            for (let i=0; i<tops.length; i++){ // for 1 ~ last-1
                if (current_top >= tops[i] && current_top < tops[i+1]){
                    $('[href="#'+ids[i]+'"]').parent().addClass('active')
                }
            }
            if (current_top >= tops[tops.length-1]){ // for last one
                $('[href="#'+ids[tops.length-1]+'"]').parent().addClass('active')
            }
        })
    }
}

/* ----------------------------- *\
    Create slide structure
\* ----------------------------- */ 
function create_slides_structure(html_text){ // need to change to html
    // symbol representations
    repr_slide = '<h1 id="">===s</h1>'
    repr_row = '<h1 id="">===r</h1>'
    repr_col = '<h1 id="">===c</h1>'
    repr_footer = '<h1 id="">===f</h1>'
    repr_length = repr_slide.length

    // step 1: segmentation, check if text begins with ===s, ===r, ===c, ===f
    text_stack = []
    text_seg = ''
    while (html_text.length != 0){
        if (html_text.slice(0,repr_length) == repr_slide 
            || html_text.slice(0,repr_length) == repr_row 
            || html_text.slice(0,repr_length) == repr_col
            || html_text.slice(0,repr_length) == repr_footer){
            if (text_seg != ''){
                text_stack.push(text_seg)
                text_seg = ''
            }
            text_stack.push(html_text.slice(0,repr_length))
            html_text = html_text.slice(repr_length)
        } else {
            text_seg = text_seg + html_text[0]
            html_text = html_text.slice(1)
        }
    }
    text_stack.push(text_seg)
    
    // step 2: structure to slide
    slide_stack = []
    row_stack = []
    col_stack = []
    content_stack = []
    while (text_stack.length != 0){
        current_seg = text_stack.pop()
        if (current_seg == repr_slide){
            row_stack = row_stack.reverse()
            slide_stack.push('<div class="slide"><div class="slide__main">'+row_stack.join('')+'</div></div>')
            row_stack = []
        } else if (current_seg == repr_row){
            col_stack = col_stack.reverse()
            row_stack.push('<div class="slide-row">'+col_stack.join('')+'</div>')
            col_stack = []
        } else if (current_seg == repr_col){
            content_stack = content_stack.reverse()
            col_stack.push('<div class="slide-col">'+content_stack.join('')+'</div>')
            content_stack = []
        } else if (current_seg == repr_footer){
            content_stack = content_stack.reverse()
            row_stack.push('<div class="slide-footer">'+content_stack.join('')+'</div>')
            content_stack = []
        } else {
            content_stack.push(current_seg)
        }
    }
    slides = '<div class="slides">'+slide_stack.reverse().join('')+'</div>'
    return slides
}