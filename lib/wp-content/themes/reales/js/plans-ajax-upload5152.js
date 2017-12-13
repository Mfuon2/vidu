(function($) {
    "use strict";

    var max = ajax_vars.plupload.max_files;

    $('#imagelist-plans').sortable({
        placeholder: 'sortable-placeholder',
        opacity: 0.7,
        stop: function(event, ui) {
            var imageList = '';
            $('#imagelist-plans .uploaded_images').each(function(index, el) {
                imageList += '~~~' + $(this).children('img').attr('src');
            });
            $('#new_plans').val(imageList);
        }
    });

    var newImage = '';
    if (typeof(plupload) !== 'undefined') {
        var uploader = new plupload.Uploader(ajax_vars.plupload);
        uploader.init();
        uploader.bind('FilesAdded', function(up, files) {
            var filesNo = 0;
            $.each(files, function(i, file) {
                if(filesNo < max) {
                    $('#aaiu-upload-imagelist-plans').append(
                        '<div id="' + file.id + '" style="margin-bottom:5px;font-size:12px;">' +
                        file.name + ' (' + plupload.formatSize(file.size) + ') <div></div>' +
                        '</div>');
                }
                filesNo = filesNo + 1;

            });

            up.refresh(); // Reposition Flash/Silverlight
            uploader.start();
        });

        uploader.bind('UploadProgress', function(up, file) {
            $('#' + file.id + " div").html('<div class="progress progress-sm progress-striped active" style="margin-top:5px;">' + 
                '<div class="progress-bar progress-bar-green" role="progressbar" aria-valuenow="'+ file.percent +'" aria-valuemin="0" aria-valuemax="100" style="width: ' + file.percent + '%" data-toggle="tooltip" title="'+ file.percent +'">' + 
                '</div>' + 
            '</div>');
        });

        // On error occur
        uploader.bind('Error', function(up, err) {
            $('#aaiu-upload-imagelist-plans').append("<div>Error: " + err.code +
                ", Message: " + err.message +
                (err.file ? ", File: " + err.file.name : "") +
                "</div>"
            );
            up.refresh(); // Reposition Flash/Silverlight
        });

        uploader.bind('FileUploaded', function(up, file, response) {
            var result = $.parseJSON(response.response);

            $('#' + file.id).remove();
            if (result.success) {
                if($('#imagelist-plans .uploaded_images').length < max) {
                    newImage += '~~~' + result.html;
                    $('#new_plans').val(newImage);
                    $('#imagelist-plans').append('<div class="uploaded_images" data-imageid="' + result.attach + '"><img src="' + result.html + '" alt="thumb" /><a class="btn btn-red btn-xs btn-icon deletePlanImage"><span class="fa fa-trash-o"></span></a></div>');

                    if($('#imagelist-plans .uploaded_images').length >= max) {
                        $('#aaiu-uploader-plans').hide();
                    }
                } else {
                    $('#aaiu-uploader-plans').hide();
                }
            }
        });

        $('#aaiu-uploader-plans').click(function(e) {
            uploader.start();
            e.preventDefault();
        });
    }

    jQuery("#imagelist-plans").on( "click", ".deletePlanImage", function() {
        var photos = jQuery("#new_plans").val();
        var delPhoto = jQuery(this).prev('img').attr('src');
        var newPhotos = photos.replace('~~~' + delPhoto, '');
        newImage = newPhotos;
        jQuery("#new_plans").val(newPhotos);
        jQuery(this).parent().remove();

        if(jQuery("imagelist-plans .uploaded_images").length < max) {
            $('#aaiu-uploader-plans').show();
        }
    });

    if($('#edit_plans').length > 0) {
        var current_gallery = $('#edit_plans').val();
        var images = current_gallery.split("~~~");

        for(var i = 1; i < images.length; i++) {
            newImage += '~~~' + images[i];
            $('#new_plans').val(newImage);
            $('#imagelist-plans').append('<div class="uploaded_images"><img src="' + images[i] + '" alt="thumb" /><a class="btn btn-red btn-xs btn-icon deletePlanImage"><span class="fa fa-trash-o"></span></a></div>');
        }

        if($('#imagelist-plans .uploaded_images').length >= max) {
            $('#aaiu-uploader-plans').hide();
        }
    }

})(jQuery);
