/* ------------------------------- *\ 
    UI kit: Select btn
\* ------------------------------- */
$('.select').each(function(){
    let current_select = $(this)

    // get each options
    option_texts = []
    option_vals = []
    current_select.find('option').each(function(){
        option_texts.push($(this).text())
        option_vals.push($(this).val())
    })

    // render style
    selected_text = current_select.find('[selected="selected"]').text()
    selected_val = current_select.find('[selected="selected"]').val()
    li_items = ''
    for (let i=0; i<option_texts.length; i++){
        if (option_vals[i] == selected_val){
            li_items += '<li class="select__item selected" attr-value="'+option_vals[i]+'">'+option_texts[i]+'</li>'
        } else {
            li_items += '<li class="select__item" attr-value="'+option_vals[i]+'">'+option_texts[i]+'</li>'
        }
    }
    current_select.append(`
        <span class="select__current-text">`+selected_text+`</span>
        <i class="select__icon icon-downward"></i>
        <ul class="select__group">`
            +li_items+
        `</ul>`)

    // select on click (focus and blur)
    current_select.on('click', function(e){
        e.stopPropagation()
        if (current_select.hasClass('focus') != true){
            $('.select').removeClass('focus')
            current_select.addClass('focus')
        } else {
            $('.select').removeClass('focus')
            current_select.removeClass('focus')
        }
    })
    $(document).on('click', function(){
        current_select.removeClass('focus')
    })

    // option on click 
    current_select.find('.select__item').on('click', function(){
        current_select.find('.select__item').removeClass('selected')
        $(this).addClass('selected')
        
        // change selected text
        current_select.find('.select__current-text').text($(this).text())
        
        // change value of original select
        attr_value = $(this).attr('attr-value')
        current_select.find('option').removeAttr('selected')
        current_select.find('[value="'+attr_value+'"]').attr('selected', 'selected')
        
        // trigger change of original select
        current_select.find('select').trigger('change')
    })
})

/* ------------------------------- *\ 
    UI kit: Pop-up
\* ------------------------------- */
function ui_set_pop_up(){
    $('.pop-up-trigger').each(function(){
        $(this).on('click', function(){
            pop_up_id = $(this).attr('attr-pop-up')
    
            // reset all
            $('.pop-up').removeClass('active')
            
            // get current pop up template
            $pop_up = $('#'+pop_up_id)
            $pop_up.addClass('active')

            // close by func-close
            $pop_up.find('.pop-up__func-close').on('click', function(){
                $pop_up.removeClass('active')
            })
        })
    })
}
$(document).ready(function(){
    ui_set_pop_up()
})

/* ------------------------------- *\ 
    UI kit: toggle
\* ------------------------------- */
function ui_set_toggle(){
    $('.toggle-content').removeClass('active')
    $('.toggle-trigger').each(function(){
        $(this).on('click', function(e){
            e.stopPropagation()
            let current_content = $(this).siblings('.toggle-content')
            if (current_content.hasClass('active')){
                current_content.removeClass('active')
            } else {
                $('.toggle-content').removeClass('active')
                current_content.addClass('active')
            }
        })
        $(document).on('click', function(){
            $('.toggle-content').removeClass('active')
        })
    })
}
$(document).ready(function(){
    ui_set_toggle()
})

/* ------------------------------- *\
	UI kit: Theme switch
\* ------------------------------- */
// note or slide
$(document).ready(function(){
    let is_note = false
    if ($('.preview-content').hasClass('note-content')) is_note = true
    if (is_note){
        // initial
        if (Cookies.get('note-theme') == undefined) Cookies.set('note-theme', 'dark', {path: '/'})
        let theme = Cookies.get('note-theme')
        if (theme == 'light'){
            $('.layout-preview, .page-detail').addClass('theme-note--almond-coral')
            $('.js-theme-switcher').addClass('lightUp')
        }
        // after switch
        $('.js-theme-switcher').on('click', function(){
            if ($('.layout-preview, .page-detail').hasClass('theme-note--almond-coral')){
                $(this).removeClass('lightUp')
                $('.layout-preview, .page-detail').removeClass('theme-note--almond-coral')
                Cookies.set('note-theme', 'dark', {path: '/'})
            } else {
                $(this).addClass('lightUp')
                $('.layout-preview, .page-detail').addClass('theme-note--almond-coral')
                Cookies.set('note-theme', 'light', {path: '/'})
            }
        })
    } else {
        $('.js-theme-switcher').hide()
    }
})
