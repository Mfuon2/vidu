(function($) {
    "use strict";

    var map;
    var geocoder;
    var options = {
        zoom : 14,
        mapTypeId : 'Styled',
        disableDefaultUI: true,
        mapTypeControlOptions : {
            mapTypeIds : [ 'Styled' ]
        }
    };
    var styles = [{
        stylers : [ {
            hue : "#cccccc"
        }, {
            saturation : -100
        }]
    }, {
        featureType : "road",
        elementType : "geometry",
        stylers : [ {
            lightness : 100
        }, {
            visibility : "simplified"
        }]
    }, {
        featureType : "road",
        elementType : "labels",
        stylers : [ {
            visibility : "on"
        }]
    }, {
        featureType: "poi",
        stylers: [ {
            visibility: "off"
        }]
    }];
    var cityOptions = {
        types : [ '(cities)' ]
    };
    var newMarker = null;
    if($('#propMapView').length > 0) {
        map = new google.maps.Map(document.getElementById('propMapView'), options);
        var styledMapType = new google.maps.StyledMapType(styles, {
            name : 'Styled'
        });
        map.mapTypes.set('Styled', styledMapType);
        var mapLat, mapLng;
        var city = document.getElementById('property_city');
        var neighborhood = document.getElementById('property_neighborhood');

        if ($('#property_lat').val() && $('#property_lng').val()) {
            mapLat = $('#property_lat').val();
            mapLng = $('#property_lng').val();
            map.setCenter(new google.maps.LatLng(mapLat, mapLng));
            map.setZoom(14);

            newMarker = new google.maps.Marker({
                position: new google.maps.LatLng(mapLat, mapLng),
                map: map,
                icon: new google.maps.MarkerImage( 
                    property_vars.plugins_url + 'marker-new.png',
                    null,
                    null,
                    null,
                    new google.maps.Size(36, 36)
                ),
                draggable: true,
                animation: google.maps.Animation.DROP,
            });

            google.maps.event.addListener(newMarker, "mouseup", function(event) {
                var latitude = this.position.lat();
                var longitude = this.position.lng();
                $('#property_lat').val(this.position.lat());
                $('#property_lng').val(this.position.lng());
            });
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var userPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    $('#property_lat').val(position.coords.latitude);
                    $('#property_lng').val(position.coords.longitude);
                    map.setCenter(userPosition);
                    map.setZoom(14);

                    newMarker = new google.maps.Marker({
                        position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                        map: map,
                        icon: new google.maps.MarkerImage( 
                            property_vars.plugins_url + 'marker-new.png',
                            null,
                            null,
                            null,
                            new google.maps.Size(36, 36)
                        ),
                        draggable: true,
                        animation: google.maps.Animation.DROP,
                    });

                    google.maps.event.addListener(newMarker, "mouseup", function(event) {
                        var latitude = this.position.lat();
                        var longitude = this.position.lng();
                        $('#property_lat').val(this.position.lat());
                        $('#property_lng').val(this.position.lng());
                    });

                }, function() {
                    handleNoGeolocation(true);
                });
            } else {
                // Browser doesn't support Geolocation
                handleNoGeolocation(false);
            }
        }

        if($('#property_city').hasClass('auto')) {
            var cityAuto = new google.maps.places.Autocomplete(city, cityOptions);
            google.maps.event.addListener(cityAuto, 'place_changed', function() {
                var place = cityAuto.getPlace();
                $('#property_city').blur();
                setTimeout(function() { $('#property_city').val(place.name); }, 1);

                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                }
                newMarker.setPosition(place.geometry.location);
                newMarker.setVisible(true);
                $('#property_lat').val(newMarker.getPosition().lat());
                $('#property_lng').val(newMarker.getPosition().lng());

                return false;
            });
        } else {
            geocoder = new google.maps.Geocoder();
            $('#property_city').change(function(event) {
                var city = $(this).children('option:selected').text();

                geocoder.geocode( { 'address': city }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        map.setCenter(results[0].geometry.location);
                        newMarker.setPosition(results[0].geometry.location);
                        newMarker.setVisible(true);
                        $('#property_lat').val(newMarker.getPosition().lat());
                        $('#property_lng').val(newMarker.getPosition().lng());
                    } else {
                        alert('Geocode was not successful for the following reason: ' + status);
                    }
                });
            });
        }

        $('#property_lat').change(function() {
            var lat = $(this).val();
            var lng = $('#property_lng').val();
            var pos = new google.maps.LatLng(lat, lng);
            newMarker.setPosition(pos);
            newMarker.setVisible(true);
            map.setCenter(pos);
        });

        $('#property_lng').change(function() {
            var lat = $('#property_lat').val();
            var lng = $(this).val();
            var pos = new google.maps.LatLng(lat, lng);
            newMarker.setPosition(pos);
            newMarker.setVisible(true);
            map.setCenter(pos);
        });

        var neighborhoodAuto = new google.maps.places.Autocomplete(neighborhood);
        google.maps.event.addListener(neighborhoodAuto, 'place_changed', function() {
            var place = neighborhoodAuto.getPlace();
            $('#property_neighborhood').blur();
            setTimeout(function() { $('#property_neighborhood').val(place.address_components[0].short_name); }, 1);

            return false;
        });

        $('#placePinBtn').click(function() {
            geocoder = new google.maps.Geocoder();
            if($('#property_city').hasClass('auto')) {
                var address = document.getElementById('property_address').value + ', ' + document.getElementById('property_city').value;
            } else {
                var address = document.getElementById('property_address').value + ', ' + $('#property_city').children('option:selected').text();
            }
            geocoder.geocode( { 'address': address }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    newMarker.setPosition(results[0].geometry.location);
                    newMarker.setVisible(true);
                    $('#property_lat').val(newMarker.getPosition().lat());
                    $('#property_lng').val(newMarker.getPosition().lng());
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        });
    }

    function handleNoGeolocation(errorFlag) {
        if (errorFlag) {
            alert('Error: The Geolocation service failed.');
        } else {
            alert('Error: Your browser doesn\'t support geolocation.');
        }
    }

    $('#propGallery').sortable({
        placeholder: 'sortable-placeholder',
        opacity: 0.7,
        stop: function(event, ui) {
            var photosList = '';
            $('#propGallery li').each(function(index, el) {
                photosList += '~~~' + $(this).children('img').attr('src');
            });
            $('#property_gallery').val(photosList);
        }
    });
    $('#propGallery').disableSelection();

    $('#addPhotoBtn').click(function(event) {
        event.preventDefault();
        var photos = $("#property_gallery").val();

        var frame = wp.media({
            title: property_vars.gallery_title,
            button: {
                text: property_vars.gallery_btn
            },
            multiple: true
        });

        frame.on( 'select', function() {
            var attachment = frame.state().get('selection').toJSON();
            $.each(attachment, function(index, value) {
                $('#property_gallery').val(photos + '~~~' + value.url);
                $('#propGallery').append('<li class="list-group-item"><img class="pull-left" src="' + value.url + '" />' + 
                    '<a href="javascript:void(0);" class="pull-right delPhoto">' + property_vars.delete_photo + '</a>' + 
                    '<div class="clearfix"></div></li>');
                photos = $("#property_gallery").val();
            });
        });

        frame.open();
    });

    $(document).on('click', '.delPhoto', function() {
        var photos = $("#property_gallery").val();
        var delPhoto = $(this).siblings('img').attr('src');
        var newPhotos = photos.replace('~~~' + delPhoto, '');
        $("#property_gallery").val(newPhotos);
        $(this).parent().remove();
    });

    $('#propPlans').sortable({
        placeholder: 'sortable-placeholder',
        opacity: 0.7,
        stop: function(event, ui) {
            var photosList = '';
            $('#propPlans li').each(function(index, el) {
                photosList += '~~~' + $(this).children('img').attr('src');
            });
            $('#property_plans').val(photosList);
        }
    });
    $('#propPlans').disableSelection();

    $('#addImageBtn').click(function(event) {
        event.preventDefault();
        var photos = $("#property_plans").val();

        var frame = wp.media({
            title: property_vars.floorplans_title,
            button: {
                text: property_vars.floorplans_btn
            },
            multiple: true
        });

        frame.on( 'select', function() {
            var attachment = frame.state().get('selection').toJSON();
            $.each(attachment, function(index, value) {
                $('#property_plans').val(photos + '~~~' + value.url);
                $('#propPlans').append('<li class="list-group-item"><img class="pull-left" src="' + value.url + '" />' + 
                    '<a href="javascript:void(0);" class="pull-right delImage">' + property_vars.delete_photo + '</a>' + 
                    '<div class="clearfix"></div></li>');
                photos = $("#property_plans").val();
            });
        });

        frame.open();
    });

    $(document).on('click', '.delImage', function() {
        var images = $("#property_plans").val();
        var delImage = $(this).siblings('img').attr('src');
        var newImages = images.replace('~~~' + delImage, '');
        $("#property_plans").val(newImages);
        $(this).parent().remove();
    });

})(jQuery);