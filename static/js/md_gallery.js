/* ----------------------------- *\
    Gallery
\* ----------------------------- */
$('#file').on('change', function(e){
    upload_image()
})
$('.delete-image').on('click', function(){
    delete_image($(this).parents().attr('attr-image-id'))
})

/* ----------------------------- *\
    Upload image
\* ----------------------------- */
function upload_image(){
    let formData = new FormData()
    formData.append('mission', 'upload_image')
    formData.append('name', $('#file_name').val())
    formData.append('image', $('#file').prop('files')[0])
    $.ajax({
        type: "POST",
        url: "",
        data: formData,
        processData: false,
        contentType: false,
        success: function(){
            console.log('uploaded')
        },
    })
    return false
}

/* ----------------------------- *\
    Delete image
\* ----------------------------- */
function delete_image(id){
    console.log(id)
    let formData = new FormData()
    formData.append('mission', 'delete_image')
    formData.append('delete_id', id)
    $.ajax({
        type: "POST",
        url: "",
        data: formData,
        processData: false,
        contentType: false,
        success: function(){
            console.log('uploaded')
        },
    })
    return false
}