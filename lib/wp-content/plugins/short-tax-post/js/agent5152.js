(function($) {
    "use strict";

    $('#agentAvatarBtn').click(function() {
        event.preventDefault();

        var frame = wp.media({
            title: 'Agent Avatar Photo',
            button: {
                text: 'Insert Photo'
            },
            multiple: false
        });

        frame.on( 'select', function() {
            var attachment = frame.state().get('selection').toJSON();
            $.each(attachment, function(index, value) {
                $('#agent_avatar').val(value.url);
            });
        });

        frame.open();
    });

})(jQuery);