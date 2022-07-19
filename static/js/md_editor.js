/* ----------------------------- *\
    Editor
        1. Initialization
        2. Editor: Codemirror
        3. Real time editing
        4. Page key bindings
        5. Save by interacting on page
        6. (func) Save item
\* ----------------------------- */ 

/* ----------------------------- *\
    Initialization
\* ----------------------------- */ 
// Split page: for resizing
Split(['#split-1', '#split-2'], {
    onDrag: function(){
        set_slide_preview()
    }
})

// Slide page init
set_slide_preview()

/* ----------------------------- *\
    Editor: Codemirror
\* ----------------------------- */ 
// Init codemirror
let editor = CodeMirror($('.codemirror-outer')[0], {
    value: $('.loaded-item-content').text(),
    lineNumbers: true,
    mode: "markdown",
    keyMap: "sublime",
    autoCloseBrackets: true,
    matchBrackets: true,
    showCursorWhenSelecting: true,
    theme: "ayu-mirage",
    tabSize: 4,
})

// Key bindings
let editor_font_size = parseInt($('.CodeMirror').css('font-size').slice(0,-2))
let editor_line_height = parseInt($('.CodeMirror').css('line-height').slice(0,-2))
let editor_lineWrapping = false
editor.setOption('extraKeys', {
    // Format form
    "Shift-Alt-F": function(){
        let selected_text = editor.getSelection();
        
        // convert table here, and send back
        let mtf = new MarkdownTableFormatter();
        mtf.format_table(selected_text)
        editor.replaceSelection(mtf.output_table)
    },
    // Zoom in editor
    "Ctrl-=": function(){
        editor_font_size = editor_font_size*1.2
        editor_line_height = editor_line_height*1.2
        $('.CodeMirror').css({
            'font-size': String(editor_font_size)+'px',
            'line-height': String(editor_line_height)+'px'
        }).each(function(i, el){
            el.CodeMirror.refresh();
        });
    },
    // Zoom in editor
    "Ctrl--": function(){
        editor_font_size = editor_font_size*0.83333333
        editor_line_height = editor_line_height*0.83333333
        $('.CodeMirror').css({
            'font-size': String(editor_font_size)+'px',
            'line-height': String(editor_line_height)+'px'
        }).each(function(i, el){
            el.CodeMirror.refresh();
        });
    },
    // Line wrapping
    "Alt-Z": function(){
        if (editor_lineWrapping == false) {
            editor.setOption('lineWrapping', true)
            editor_lineWrapping = true
        } else {
            editor.setOption('lineWrapping', false)
            editor_lineWrapping = false
        }
    },
    // Latex convert
    "Ctrl-L": function(){
        MathJax.typeset()
    }
})

/* ----------------------------- *\
    Real time editing
\* ----------------------------- */
// If editor on changing, show converted result
let show_lock = false
let md_temp = ''
editor.on('change', function(){
    if (!show_lock){
        show_lock = true
        // update view
        md_temp = editor.getValue()
        let item_tags = convert_md_to_html(md_temp)
        set_slide_preview()
        // lock timer: limit update frequency to have fluent typing exp
        setTimeout(function(){
            show_lock = false
            // update view
            let item_tags = convert_md_to_html(md_temp)
            set_slide_preview()
        }, 500) // set updating time interval
    } else {
        md_temp = editor.getValue()
    }
})

/* ----------------------------- *\
    Page key bindings
\* ----------------------------- */
// Zen mode btn
$('#zen-mode-btn').on('click', function(){
    $('.layout-main').toggleClass('zen-mode')
    $(this).toggleClass('active')
})

/* ----------------------------- *\
    Save by interacting on page
\* ----------------------------- */
// Save by using ctrl + s key binding
$(window).bind('keydown', function(event) {
    if (event.ctrlKey || event.metaKey){
        switch (String.fromCharCode(event.which).toLowerCase()){
            case 's':
                event.preventDefault()
                save_item($('#item-name').val(), $('#item-group').val(), editor.getValue(), item_tags)
                // Auto saving: 3 mins after the last manual saving (可以再改成其他的條件)
                // setTimeout(function(){
                // }, 180*1000)
                break
        }
    }
})

// Save item when group selection changing
$('#item-group').change(function(){
    save_item($('#item-name').val(), $('#item-group').val(), editor.getValue(), item_tags)
})

// Save item when out of item name input
$('#item-name').blur(function(){
    save_item($('#item-name').val(), $('#item-group').val(), editor.getValue(), item_tags)
})

// Save item when leaving editor
editor.on("blur", function(){
    save_item($('#item-name').val(), $('#item-group').val(), editor.getValue(), item_tags)
})

/* ----------------------------- *\
    Save item
\* ----------------------------- */
function save_item(name, group, content, tags){
    $.ajax({
        type: "POST",
        url: "",
        data: {
            'mission': 'update_item',
            'name': name,
            'group': group,
            'content': content,
            'tags': tags,
        },
        success: function(){},
        beforeSend: function(){
            $('.control-message').html('Saving...')
        },
    }).done(function(){
        $('.control-message').html('')
    }).fail(function(){
        // console.log('failed')
    })
    return false
}