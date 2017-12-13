var map;
var appMap;
var geocoder;

(function($) {
    "use strict";

    var markers                = new Array();
    var markerCluster          = null;
    var placesIDs              = new Array();
    var transportationsMarkers = new Array();
    var supermarketsMarkers    = new Array();
    var schoolsMarkers         = new Array();
    var librariesMarkers       = new Array();
    var pharmaciesMarkers      = new Array();
    var hospitalsMarkers       = new Array();

    var marker_path = "M19.2,0C8.7,0,0.1,8.3,0,18.5c0,4.2,1.3,8,3.7,11.1l15,18.4l15.4-18.4c2.4-3.1,3.9-6.9,3.9-11.1C38.1,8.3,29.7,0,19.2,0z   M19,26.2c-4,0-7.2-3.2-7.2-7.2s3.2-7.2,7.2-7.2s7.2,3.2,7.2,7.2S23,26.2,19,26.2z";
    var poi_marker_path = "M24,0A24,24,0,1,0,48,24,24,24,0,0,0,24,0Zm0,37.58A13.58,13.58,0,1,1,37.58,24,13.58,13.58,0,0,1,24,37.58Z";
    var newMarkerImage = {
        path: marker_path,
        fillColor: '#333333',
        fillOpacity: 1,
        strokeColor: '',
        strokeWeight: 0,
        scale: 0.75,
        anchor: new google.maps.Point(19,47)
    };
    var markerImage = {
        path: marker_path,
        fillColor: services_vars.marker_color,
        fillOpacity: 1,
        strokeColor: '',
        strokeWeight: 0,
        scale: 0.75,
        anchor: new google.maps.Point(19,47)
    };
    var transportationsMarkerImage = {
        path: poi_marker_path,
        fillColor: '#e9573f',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 1,
        scale: 0.35,
        anchor: new google.maps.Point(24,24)
    };
    var supermarketsMarkerImage = {
        path: poi_marker_path,
        fillColor: '#f6bb43',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 1,
        scale: 0.35,
        anchor: new google.maps.Point(24,24)
    };
    var schoolsMarkerImage = {
        path: poi_marker_path,
        fillColor: '#8cc051',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 1,
        scale: 0.35,
        anchor: new google.maps.Point(24,24)
    };
    var librariesMarkerImage = {
        path: poi_marker_path,
        fillColor: '#3baeda',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 1,
        scale: 0.35,
        anchor: new google.maps.Point(24,24)
    };
    var pharmaciesMarkerImage = {
        path: poi_marker_path,
        fillColor: '#967bdc',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 1,
        scale: 0.35,
        anchor: new google.maps.Point(24,24)
    };
    var hospitalsMarkerImage = {
        path: poi_marker_path,
        fillColor: '#d870ad',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 1,
        scale: 0.35,
        anchor: new google.maps.Point(24,24)
    };

    function urlParam(name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
        if(results == null) {
           return null;
        }
        else{
           return results[1] || 0;
        }
    }

    function getPathFromUrl(url) {
        return url.split("?")[0];
    }

    function userSignup() {
        var username          = $('#usernameSignup').val();
        var firstname         = $('#firstnameSignup').val();
        var lastname          = $('#lastnameSignup').val();
        var email             = $('#emailSignup').val();
        var phone             = $('#phoneSignup').val();
        var pass_1            = $('#pass1Signup').val();
        var pass_2            = $('#pass2Signup').val();
        var register_as_agent = $('#register_as_agent').is(':checked');
        var terms             = $('#terms').is(':checked');
        var security          = $('#securitySignup').val();
        var ajaxURL           = services_vars.ajaxurl;

        $('#submitSignup').html(services_vars.signin_loading).addClass('disabled');

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action'            : 'reales_user_signup_form',
                'signup_user'       : username,
                'signup_firstname'  : firstname,
                'signup_lastname'   : lastname,
                'signup_email'      : email,
                'signup_phone'      : phone,
                'signup_pass_1'     : pass_1,
                'signup_pass_2'     : pass_2,
                'register_as_agent' : register_as_agent,
                'terms'             : terms,
                'security'          : security
            },
            success: function(data) {
                $('#submitSignup').html(services_vars.signup_text).removeClass('disabled');
                if(data.signedup === true) {
                    var message = '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                      '<div class="icon"><span class="fa fa-check-circle"></span></div>' + data.message +
                                  '</div>';
                    $('#signup').modal('hide');
                    $('#signin').modal('show').on('shown.bs.modal', function(e) {
                        $('#signinMessage').empty().append(message);
                    });
                } else {
                    var message = '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                      '<div class="icon"><span class="fa fa-ban"></span></div>' + data.message +
                                  '</div>';
                    $('#signupMessage').empty().append(message);
                }
            },
            error: function(errorThrown) {

            }
        });
    }

    $('#submitSignup').click(function() {
        userSignup();
    });

    $('#usernameSignup, #firstnameSignup, #lastnameSignup, #emailSignup, #pass1Signup, #pass2Signup').keydown(function(e) {
        if(e.keyCode === 13) {
            e.preventDefault();
            userSignup();
        }
    });

    // populate the redirect URL
    $('#signin').on('shown.bs.modal', function () {
        $('#signinRedirect').val(window.location.href.split(/\?|#/)[0]);
    });

    function userSignin() {
        var username = $('#usernameSignin').val();
        var password = $('#passwordSignin').val();
        var security = $('#securitySignin').val();
        var remember = $('#rememberSignin').is(':checked');
        var redirect = $('#signinRedirect').val();
        var ajaxURL  = services_vars.ajaxurl;

        $('#submitSignin').html(services_vars.signin_loading).addClass('disabled');

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_user_signin_form',
                'signin_user': username,
                'signin_pass': password,
                'remember': remember,
                'security': security
            },
            success: function(data) {
                $('#submitSignin').html(services_vars.signin_text).removeClass('disabled');
                if(data.signedin === true) {
                    var message = '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                      '<div class="icon"><span class="fa fa-check-circle"></span></div>' + data.message +
                                  '</div>';
                    $('#signinMessage').empty().append(message);
                    document.location.href = redirect;
                } else {
                    var message = '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                      '<div class="icon"><span class="fa fa-ban"></span></div>' + data.message +
                                  '</div>';
                    $('#signinMessage').empty().append(message);
                }
            },
            error: function(errorThrown) {

            }
        });
    }

    $('#submitSignin').click(function() {
        userSignin();
    });

    $('#usernameSignin, #passwordSignin').keydown(function(e) {
        if(e.keyCode === 13) {
            e.preventDefault();
            userSignin();
        }
    });

    function forgotPassword() {
        var email = $('#emailForgot').val();
        var postID = $('#postID').val();
        var security = $('#securityForgot').val();
        var ajaxURL = services_vars.ajaxurl;

        $('#submitForgot').html(services_vars.forgot_loading).addClass('disabled');

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_forgot_pass_form',
                'forgot_email': email,
                'security-login': security,
                'postid': postID
            },

            success: function(data) {
                $('#submitForgot').html(services_vars.forgot_text).removeClass('disabled');
                $('#emailForgot').val('');

                if(data.sent === true) {
                    var message = '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                      '<div class="icon"><span class="fa fa-check-circle"></span></div>' + data.message +
                                  '</div>';
                    $('#forgotMessage').empty().append(message);
                    $('.forgotField').hide();
                } else {
                    var message = '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                      '<div class="icon"><span class="fa fa-ban"></span></div>' + data.message +
                                  '</div>';
                    $('#forgotMessage').empty().append(message);
                }
            },
            error: function(errorThrown) {

            }
        });
    }

    $('#submitForgot').click(function() {
        forgotPassword();
    });

    $('#emailForgot').keydown(function(e) {
        if(e.keyCode === 13) {
            e.preventDefault();
            forgotPassword();
        }
    });

    if(urlParam('action') && urlParam('action') == 'rp') {
        $('#resetpass').modal('show');
    }

    function resetPassword() {
        var pass_1 = $('#resetPass_1').val();
        var pass_2 = $('#resetPass_2').val();
        var key = urlParam('key');
        var login = urlParam('login');
        var security = $('#securityResetpass').val();
        var ajaxURL = services_vars.ajaxurl;

        $('#submitResetPass').html(services_vars.reset_pass_loading).addClass('disabled');

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_reset_pass_form',
                'pass_1': pass_1,
                'pass_2': pass_2,
                'key': key,
                'login': login,
                'security-reset': security
            },

            success: function(data) {
                $('#submitResetPass').html(services_vars.reset_pass_text).removeClass('disabled');
                $('#resetPass_1').val('');
                $('#resetPass_2').val('');

                if(data.reset === true) {
                    var message = '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                      '<div class="icon"><span class="fa fa-check-circle"></span></div>' + data.message +
                                  '</div>';
                    $('#resetpass').modal('hide');
                    $('#signin').modal('show').on('shown.bs.modal', function(e) {
                        $('#signinMessage').empty().append(message);
                    });
                } else {
                    var message = '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                      '<div class="icon"><span class="fa fa-ban"></span></div>' + data.message +
                                  '</div>';
                    $('#resetPassMessage').empty().append(message);
                }
            },
            error: function(errorThrown) {

            }
        });
    }

    $('#submitResetPass').click(function() {
        resetPassword();
    });

    $('#resetPass_1, #resetPass_2').keydown(function(e) {
        if(e.keyCode === 13) {
            e.preventDefault();
            resetPassword();
        }
    });

    $('#fbLoginBtn').click(function() {
        $('.signinFBText').html(services_vars.fb_login_loading);
        fbLogin();
    });

    function fbLogin() {
        FB.getLoginStatus(function(response) {
            if(response.status === 'connected') {
                var newUser = getUserInfo(function(user) {
                    var newUserAvatar = getUserPhoto(function(photo) {
                        wpFBLogin(user, photo);
                    });
                });
            } else if(response.status === 'not_authorized') {
                FB.login(function(response) {
                    if(response.authResponse) {
                        var newUser = getUserInfo(function(user) {
                            var newUserAvatar = getUserPhoto(function(photo) {
                                wpFBLogin(user, photo);
                            });
                        });
                    } else {
                        $('.signinFBText').html(services_vars.fb_login_text);
                        var message = '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                          '<div class="icon"><span class="fa fa-ban"></span></div>' + services_vars.fb_login_error +
                                      '</div>';
                        $('#signinMessage').empty().append(message);
                    }
                }, {
                    scope: 'public_profile, email'
                });
            } else {
                FB.login(function(response) {
                    if(response.authResponse) {
                        var newUser = getUserInfo(function(user) {
                            var newUserAvatar = getUserPhoto(function(photo) {
                                wpFBLogin(user, photo);
                            });
                        });
                    } else {
                        $('.signinFBText').html(services_vars.fb_login_text);
                        var message = '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                          '<div class="icon"><span class="fa fa-ban"></span></div>' + services_vars.fb_login_error +
                                      '</div>';
                        $('#signinMessage').empty().append(message);
                    }
                }, {
                    scope: 'public_profile, email'
                });
            }
        });
    }

    function getUserInfo(callback) {
        FB.api('/me', function(response) {
            callback(response);
        });
    }

    function getUserPhoto(callback) {
        FB.api('/me/picture?type=normal', function(response) {
            callback(response.data.url);
        });
    }

    function wpFBLogin(user, photo) {
        var userid = user.id;
        var username = user.name;
        username = username.toLowerCase().replace(' ', '') + userid;
        var firstname = user.first_name;
        var lastname = user.last_name;
        var email = user.email;
        var avatar = photo;
        var security = $('#securitySignin').val();
        var ajaxURL = services_vars.ajaxurl;

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_facebook_login',
                'userid': userid,
                'signin_user': username,
                'first_name': firstname,
                'last_name': lastname,
                'email': email,
                'avatar': avatar,
                'security': security
            },
            success: function(data) {
                $('.signinFBText').html(services_vars.fb_login_text);
                if(data.signedin === true) {
                    var message = '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                      '<div class="icon"><span class="fa fa-check-circle"></span></div>' + data.message +
                                  '</div>';
                    $('#signinMessage').empty().append(message);
                    document.location.href = services_vars.signin_redirect;
                } else {
                    var message = '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                      '<div class="icon"><span class="fa fa-ban"></span></div>' + data.message +
                                  '</div>';
                    $('#signinMessage').empty().append(message);
                }
            },
            error: function(errorThrown) {

            }
        });
    }

    $('#googleSigninBtn').click(function() {
        $('.signinGText').html(services_vars.google_signin_loading);
        var additionalParams = {
            'callback': googleSignin,
            'scope': 'profile email'
        };
        gapi.auth.signIn(additionalParams);
    });

    function googleSignin(authResult) {
        if (authResult['status']['signed_in']) {
            gapi.client.load('plus', 'v1', gapiClientLoaded);
        } else {
            $('.signinGText').html(services_vars.google_signin_text);
            var message = '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                              '<div class="icon"><span class="fa fa-ban"></span></div>' + services_vars.google_signin_error +
                          '</div>';
            $('#signinMessage').empty().append(message);
        }
    }

    function gapiClientLoaded() {
        gapi.client.plus.people.get({userId: 'me'}).execute(handleGoogleResponse);
    }

    function handleGoogleResponse(resp) {
        var userid = resp.id;
        var username = resp.displayName;
        username = username.toLowerCase().replace(' ', '') + userid;
        var firstname = resp.name.givenName;
        var lastname = resp.name.familyName;
        var email;
        for (var i=0; i < resp.emails.length; i++) {
            if (resp.emails[i].type === 'account') {
                email = resp.emails[i].value;
            }
        }
        var avatar = getPathFromUrl(resp.image.url);
        var security = $('#securitySignin').val();
        var ajaxURL = services_vars.ajaxurl;

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_google_signin',
                'userid': userid,
                'signin_user': username,
                'first_name': firstname,
                'last_name': lastname,
                'email': email,
                'avatar': avatar,
                'security': security
            },
            success: function(data) {
                $('.signinGText').html(services_vars.google_signin_text);
                if(data.signedin === true) {
                    var message = '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                      '<div class="icon"><span class="fa fa-check-circle"></span></div>' + data.message +
                                  '</div>';
                    $('#signinMessage').empty().append(message);
                    document.location.href = services_vars.signin_redirect;
                } else {
                    var message = '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                      '<div class="icon"><span class="fa fa-ban"></span></div>' + data.message +
                                  '</div>';
                    $('#signinMessage').empty().append(message);
                }
            },
            error: function(errorThrown) {

            }
        });
    }

    function handleNoGeolocation(errorFlag) {
        if (errorFlag) {
            alert('Error: The Geolocation service failed.');
        } else {
            alert('Error: Your browser doesn\'t support geolocation.');
        }
    }

    function formatPrice(nStr) {
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ' ' + '$2');
        }
        return x1 + x2;
    }

    function addMarkers(props, map) {
        var oms = new OverlappingMarkerSpiderfier(map, {
            markersWontMove : true,
            markersWontHide : true,
            keepSpiderfied  : true,
            legWeight       : 1
        });

        $.each(props, function(i, prop) {
            var latlng = new google.maps.LatLng(prop.lat,prop.lng);
            var marker = new google.maps.Marker({
                position: latlng,
                map: map,
                icon: markerImage,
                draggable: false,
                animation: google.maps.Animation.DROP,
            });

            var price = '';
            if(prop.price != '') {
                if(prop.currency_pos == 'before') {
                    price = prop.currency + formatPrice(prop.price) + ' ' + prop.price_label;
                } else {
                    price = formatPrice(prop.price) + prop.currency + ' ' + prop.price_label;
                }
            }
            var propTitle = prop.data ? prop.data.post_title : prop.title;
            var infoboxContent = '<div class="infoW">' +
                                    '<div class="propImg">';
            if(prop.featured == 1) {
                infoboxContent +=       '<div class="featured-label">' +
                                            '<div class="featured-label-left"></div>' +
                                            '<div class="featured-label-content"><span class="fa fa-star"></span></div>' +
                                            '<div class="featured-label-right"></div>' +
                                            '<div class="clearfix"></div>' +
                                        '</div>';
            }
            infoboxContent +=           '<img src="' + prop.thumb + '">' +
                                        '<div class="propBg">' +
                                            '<div class="propPrice">' + price + '</div>';
            if(prop.type.length > 0) {
                infoboxContent +=           '<div class="propType">' + prop.type[0].name + '</div>';
            }
            infoboxContent +=           '</div>' +
                                    '</div>' +
                                    '<div class="paWrapper">' +
                                        '<div class="propTitle">' + propTitle + '</div>' +
                                        '<div class="propAddress">';
            if(prop.address != '') {
                infoboxContent +=           prop.address + ', ';
            }
            if(prop.city != '') {
                infoboxContent +=           prop.city;
            }
            infoboxContent +=            '</div>' +
                                    '</div>' +
                                    '<ul class="propFeat">';
            if(prop.bedrooms != '') {
                infoboxContent +=       '<li><span class="fa fa-moon-o"></span> ' + prop.bedrooms + '</li>';
            }
            if(prop.bathrooms != '') {
                infoboxContent +=       '<li><span class="icon-drop"></span> ' + prop.bathrooms + '</li>';
            }
            if(prop.area != '') {
                infoboxContent +=       '<li><span class="icon-frame"></span> ' + prop.area + ' ' + prop.unit + '</li>';
            }
            infoboxContent +=       '</ul>' +
                                    '<div class="clearfix"></div>' +
                                    '<div class="infoButtons">' +
                                        '<a class="btn btn-sm btn-round btn-gray btn-o closeInfo">' + services_vars.infobox_close_btn + '</a>' +
                                        '<a href="' + prop.link + '" class="btn btn-sm btn-round btn-green viewInfo">' + services_vars.infobox_view_btn + '</a>' +
                                    '</div>' +
                                 '</div>';

            oms.addMarker(marker);

            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    infobox.setContent(infoboxContent);
                    infobox.open(map, marker);
                }
            })(marker, i));

            // Hover on markers action
            /*var el;
            google.maps.event.addListener(marker, 'mouseover', (function(marker, i) {
                return function() {
                    el = $('.resultsList > .row > div:nth-child(' + (i + 1) + ') > a');
                    $('.resultsList a').css('opacity', '0.3');
                    el.css({
                        'box-shadow' : '0 1px 20px 0 rgba(0, 0, 0, 0.23)',
                        'opacity' : '1',
                    });

                    $('#content').animate({
                        scrollTop: el.offset().top - 80
                    }, 300);
                }
            })(marker, i));
            google.maps.event.addListener(marker, 'mouseout', (function(marker, i) {
                return function() {
                    $('.resultsList a').css('opacity', '1');
                    el.css({
                        'box-shadow' : '0 1px 2px 0 rgba(0, 0, 0, 0.13)',
                    });

                    $('#content').animate({
                        scrollTop: 0
                    }, 300);
                }
            })(marker, i));*/

            $(document).on('touchend', '.closeInfo', function(e) {
                infobox.open(null,null);
            });
            $(document).on('click', '.closeInfo', function(e) {
                infobox.open(null,null);
            });
            oms.addListener('unspiderfy', function(markers) {
                infobox.open(null,null);
            });

            markers.push(marker);
        });
    }

    var options = {
        zoom : parseInt(services_vars.zoom),
        mapTypeId : 'Styled',
        panControl: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: true,
        overviewMapControl: false,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        }
    };
    var homeOptions = {
        zoom : parseInt(services_vars.zoom),
        mapTypeId : 'Styled',
        panControl: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: true,
        overviewMapControl: false,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.RIGHT_CENTER
        },
        streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER
        }
    };
    var panoramaOptions = {
        zoomControl: true,
        panControl: false,
        addressControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER
        },
        linksControl: false,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL,
            position: google.maps.ControlPosition.RIGHT_TOP
        }
    }
    var styles = jQuery.parseJSON(decodeURIComponent(services_vars.gmaps_style));
    var cityOptions = {
        types : [ '(cities)' ]
    };
    var infobox = new InfoBox({
        disableAutoPan: false,
        maxWidth: 202,
        pixelOffset: new google.maps.Size(-101, -282),
        zIndex: null,
        boxStyle: {
            background: "url('" + services_vars.theme_url + "/images/infobox-bg.png') no-repeat",
            opacity: 1,
            width: "202px",
            height: "245px"
        },
        closeBoxMargin: "28px 26px 0px 0px",
        closeBoxURL: "",
        infoBoxClearance: new google.maps.Size(1, 1),
        pane: "floatPane",
        enableEventPropagation: false
    });
    var info = new InfoBox({
        disableAutoPan: false,
        maxWidth: 200,
        pixelOffset: new google.maps.Size(-70, -44),
        zIndex: null,
        boxStyle: {
            'background' : '#fff',
            'opacity'    : 1,
            'padding'    : '5px',
            'box-shadow' : '0 1px 2px 0 rgba(0, 0, 0, 0.13)',
            'width'      : '140px',
            'text-align' : 'center',
            'border-radius' : '3px'
        },
        closeBoxMargin: "28px 26px 0px 0px",
        closeBoxURL: "",
        infoBoxClearance: new google.maps.Size(1, 1),
        pane: "floatPane",
        enableEventPropagation: false
    });

    function getPOIs(pos, pmap, type) {
        var service   = new google.maps.places.PlacesService(pmap);
        var bounds    = pmap.getBounds();
        var types     = new Array();

        switch(type) {
            case 'transportations':
                types = ['bus_station', 'subway_station', 'train_station', 'airport'];
                break;
            case 'supermarkets':
                types = ['grocery_or_supermarket', 'shopping_mall'];
                break;
            case 'schools':
                types = ['school', 'university'];
                break;
            case 'libraries':
                types = ['library'];
                break;
            case 'pharmacies':
                types = ['pharmacy'];
                break;
            case 'hospitals':
                types = ['hospital'];
                break;
        }

        service.nearbySearch({
            location: pos,
            bounds: bounds,
            radius: 2000,
            types: types
        }, function poiCallback(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    if(jQuery.inArray(results[i].place_id, placesIDs) == -1) {
                        createPOI(results[i], pmap, type);
                        placesIDs.push(results[i].place_id);
                    }
                }
            }
        });
    }

    function createPOI(place, pmap, type) {
        var placeLoc = place.geometry.location;
        var marker;

        switch(type) {
            case 'transportations':
                marker = new google.maps.Marker({
                    map: pmap,
                    position: place.geometry.location,
                    icon: transportationsMarkerImage,
                });
                transportationsMarkers.push(marker);
                break;
            case 'supermarkets':
                marker = new google.maps.Marker({
                    map: pmap,
                    position: place.geometry.location,
                    icon: supermarketsMarkerImage,
                });
                supermarketsMarkers.push(marker);
                break;
            case 'schools':
                marker = new google.maps.Marker({
                    map: pmap,
                    position: place.geometry.location,
                    icon: schoolsMarkerImage,
                });
                schoolsMarkers.push(marker);
                break;
            case 'libraries':
                marker = new google.maps.Marker({
                    map: pmap,
                    position: place.geometry.location,
                    icon: librariesMarkerImage,
                });
                librariesMarkers.push(marker);
                break;
            case 'pharmacies':
                marker = new google.maps.Marker({
                    map: pmap,
                    position: place.geometry.location,
                    icon: pharmaciesMarkerImage,
                });
                pharmaciesMarkers.push(marker);
                break;
            case 'hospitals':
                marker = new google.maps.Marker({
                    map: pmap,
                    position: place.geometry.location,
                    icon: hospitalsMarkerImage,
                });
                hospitalsMarkers.push(marker);
                break;
        }

        google.maps.event.addListener(marker, 'mouseover', function() {
            info.setContent(place.name);
            info.open(pmap, this);
        });
        google.maps.event.addListener(marker, 'mouseout', function() {
            info.open(null,null);
        });
    }

    function tooglePOIs(pmap, type) {
        for(var i = 0; i < type.length; i++) {
            if(type[i].getMap() != null) {
                type[i].setMap(null);
            } else {
                type[i].setMap(pmap);
            }
        }
    }

    function PoiControls(controlDiv, pmap, center) {
        controlDiv.style.clear = 'both';

        // Set CSS for transportations POI
        var transportationUI = document.createElement('div');
        transportationUI.id = 'transportationUI';
        transportationUI.title = services_vars.transportations_title;
        controlDiv.appendChild(transportationUI);
        var transportationIcon = document.createElement('div');
        transportationIcon.id = 'transportationIcon';
        transportationIcon.innerHTML = '<span class="fa fa-bus"></span>';
        transportationUI.appendChild(transportationIcon);

        // Set CSS for supermarkets POI
        var supermarketsUI = document.createElement('div');
        supermarketsUI.id = 'supermarketsUI';
        supermarketsUI.title = services_vars.supermarkets_title;
        controlDiv.appendChild(supermarketsUI);
        var supermarketsIcon = document.createElement('div');
        supermarketsIcon.id = 'supermarketsIcon';
        supermarketsIcon.innerHTML = '<span class="fa fa-shopping-cart"></span>';
        supermarketsUI.appendChild(supermarketsIcon);

        // Set CSS for schools POI
        var schoolsUI = document.createElement('div');
        schoolsUI.id = 'schoolsUI';
        schoolsUI.title = services_vars.schools_title;
        controlDiv.appendChild(schoolsUI);
        var schoolsIcon = document.createElement('div');
        schoolsIcon.id = 'schoolsIcon';
        schoolsIcon.innerHTML = '<span class="fa fa-university"></span>';
        schoolsUI.appendChild(schoolsIcon);

        // Set CSS for libraries POI
        var librariesUI = document.createElement('div');
        librariesUI.id = 'librariesUI';
        librariesUI.title = services_vars.libraries_title;
        controlDiv.appendChild(librariesUI);
        var librariesIcon = document.createElement('div');
        librariesIcon.id = 'librariesIcon';
        librariesIcon.innerHTML = '<span class="fa fa-book"></span>';
        librariesUI.appendChild(librariesIcon);

        // Set CSS for pharmacies POI
        var pharmaciesUI = document.createElement('div');
        pharmaciesUI.id = 'pharmaciesUI';
        pharmaciesUI.title = services_vars.pharmacies_title;
        controlDiv.appendChild(pharmaciesUI);
        var pharmaciesIcon = document.createElement('div');
        pharmaciesIcon.id = 'pharmaciesIcon';
        pharmaciesIcon.innerHTML = '<span class="fa fa-plus-square"></span>';
        pharmaciesUI.appendChild(pharmaciesIcon);

        // Set CSS for hospitals POI
        var hospitalsUI = document.createElement('div');
        hospitalsUI.id = 'hospitalsUI';
        hospitalsUI.title = services_vars.hospitals_title;
        controlDiv.appendChild(hospitalsUI);
        var hospitalsIcon = document.createElement('div');
        hospitalsIcon.id = 'hospitalsIcon';
        hospitalsIcon.innerHTML = '<span class="fa fa-h-square"></span>';
        hospitalsUI.appendChild(hospitalsIcon);

        transportationUI.addEventListener('click', function() {
            var transportationUI_ = this;
            if($(this).hasClass('active')) {
                $(this).removeClass('active');

                tooglePOIs(pmap, transportationsMarkers);
            } else {
                $(this).addClass('active');

                getPOIs(center, pmap, 'transportations');
                tooglePOIs(pmap, transportationsMarkers);
            }
            google.maps.event.addListener(pmap, 'bounds_changed', function() {
                if($(transportationUI_).hasClass('active')) {
                    var newCenter = pmap.getCenter();
                    getPOIs(newCenter, pmap, 'transportations');
                }
            });
        });
        supermarketsUI.addEventListener('click', function() {
            var supermarketsUI_ = this;
            if($(this).hasClass('active')) {
                $(this).removeClass('active');

                tooglePOIs(pmap, supermarketsMarkers);
            } else {
                $(this).addClass('active');

                getPOIs(center, pmap, 'supermarkets');
                tooglePOIs(pmap, supermarketsMarkers);
            }
            google.maps.event.addListener(pmap, 'bounds_changed', function() {
                if($(supermarketsUI_).hasClass('active')) {
                    var newCenter = pmap.getCenter();
                    getPOIs(newCenter, pmap, 'supermarkets');
                }
            });
        });
        schoolsUI.addEventListener('click', function() {
            var schoolsUI_ = this;
            if($(this).hasClass('active')) {
                $(this).removeClass('active');

                tooglePOIs(pmap, schoolsMarkers);
            } else {
                $(this).addClass('active');

                getPOIs(center, pmap, 'schools');
                tooglePOIs(pmap, schoolsMarkers);
            }
            google.maps.event.addListener(pmap, 'bounds_changed', function() {
                if($(schoolsUI_).hasClass('active')) {
                    var newCenter = pmap.getCenter();
                    getPOIs(newCenter, pmap, 'schools');
                }
            });
        });
        librariesUI.addEventListener('click', function() {
            var librariesUI_ = this;
            if($(this).hasClass('active')) {
                $(this).removeClass('active');

                tooglePOIs(pmap, librariesMarkers);
            } else {
                $(this).addClass('active');

                getPOIs(center, pmap, 'libraries');
                tooglePOIs(pmap, librariesMarkers);
            }
            google.maps.event.addListener(pmap, 'bounds_changed', function() {
                if($(librariesUI_).hasClass('active')) {
                    var newCenter = pmap.getCenter();
                    getPOIs(newCenter, pmap, 'libraries');
                }
            });
        });
        pharmaciesUI.addEventListener('click', function() {
            var pharmaciesUI_ = this;
            if($(this).hasClass('active')) {
                $(this).removeClass('active');

                tooglePOIs(pmap, pharmaciesMarkers);
            } else {
                $(this).addClass('active');

                getPOIs(center, pmap, 'pharmacies');
                tooglePOIs(pmap, pharmaciesMarkers);
            }
            google.maps.event.addListener(pmap, 'bounds_changed', function() {
                if($(pharmaciesUI_).hasClass('active')) {
                    var newCenter = pmap.getCenter();
                    getPOIs(newCenter, pmap, 'pharmacies');
                }
            });
        });
        hospitalsUI.addEventListener('click', function() {
            var hospitalsUI_ = this;
            if($(this).hasClass('active')) {
                $(this).removeClass('active');

                tooglePOIs(pmap, hospitalsMarkers);
            } else {
                $(this).addClass('active');

                getPOIs(center, pmap, 'hospitals');
                tooglePOIs(pmap, hospitalsMarkers);
            }
            google.maps.event.addListener(pmap, 'bounds_changed', function() {
                if($(hospitalsUI_).hasClass('active')) {
                    var newCenter = pmap.getCenter();
                    getPOIs(newCenter, pmap, 'hospitals');
                }
            });
        });
    }

    function setPOIControls(pmap, center) {
        var poiControlDiv = document.createElement('div');
        var poiControl = new PoiControls(poiControlDiv, pmap, center);

        poiControlDiv.index = 1;
        poiControlDiv.style['padding-right'] = '10px';
        pmap.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(poiControlDiv);
    }

    if($('#homeMap').length > 0) {
        $('.home-header').addClass('map');

        var mapLocation = $('#homeMap').attr('data-location');

        map = new google.maps.Map(document.getElementById('homeMap'), homeOptions);
        var styledMapType = new google.maps.StyledMapType(styles, {
            name : 'Styled'
        });
        map.mapTypes.set('Styled', styledMapType);

        $('#homeMap > div').css('pointer-events', 'none');
        $('#homeMap').on('click', function () {
            $('#homeMap > div').css('pointer-events', 'auto');
        });
        $("#homeMap").on('mouseleave', function() {
            $('#homeMap > div').css('pointer-events', 'none');
        });

        var dLat = $('#homeMap').attr('data-lat');
        var dLng = $('#homeMap').attr('data-lng');
        if(dLat != '' && dLng != '') {
            var dPosition = new google.maps.LatLng(dLat, dLng);
            map.setCenter(dPosition);
            map.setZoom(parseInt(services_vars.zoom));

            geocoder = new google.maps.Geocoder();
            geocoder.geocode({'latLng': dPosition}, function(results, status) {
                if(status == google.maps.GeocoderStatus.OK) {
                    var city;
                    for(var i = 0; i < results.length; i++) {
                        if(results[i].types[0] == 'locality') {
                            city = results[i].address_components[0].long_name;
                        }
                    }

                    if(city != '') {
                        var ajaxURL = services_vars.ajaxurl;
                        var security = $('#securityHomeMap').val();

                        $.ajax({
                            type: 'POST',
                            dataType: 'json',
                            url: ajaxURL,
                            data: {
                                'action': 'reales_get_all_properties',
                                'security': security
                            },
                            success: function(data) {
                                if(data.getprops === true) {
                                    addMarkers(data.props, map);

                                    map.fitBounds(markers.reduce(function(bounds, marker) {
                                        return bounds.extend(marker.getPosition());
                                    }, new google.maps.LatLngBounds()));

                                    markerCluster = new MarkerClusterer(map, markers, {
                                        maxZoom: 18,
                                        gridSize: 60,
                                        styles: [
                                            {
                                                url: services_vars.theme_url + '/images/clusters/cluster-1.png',
                                                width: 40,
                                                height: 40,
                                                fontFamily: "'Open Sans', sans-serif, Arial",
                                                fontWeight: "normal",
                                                textColor: "#fff"
                                            },
                                            {
                                                url: services_vars.theme_url + '/images/clusters/cluster-2.png',
                                                width: 40,
                                                height: 40,
                                                fontFamily: "'Open Sans', sans-serif, Arial",
                                                fontWeight: "normal",
                                                textColor: "#fff"
                                            },
                                            {
                                                url: services_vars.theme_url + '/images/clusters/cluster-3.png',
                                                width: 40,
                                                height: 40,
                                                fontFamily: "'Open Sans', sans-serif, Arial",
                                                fontWeight: "normal",
                                                textColor: "#fff"
                                            }
                                        ]
                                    });
                                }
                            },
                            error: function(errorThrown) {

                            }
                        });
                    }
                }
            });
        } else {

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var userPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    map.setCenter(userPosition);
                    map.setZoom(parseInt(services_vars.zoom));

                    geocoder = new google.maps.Geocoder();
                    geocoder.geocode({'latLng': userPosition}, function(results, status) {
                        if(status == google.maps.GeocoderStatus.OK) {
                            var city;
                            for(var i = 0; i < results.length; i++) {
                                if(results[i].types[0] == 'locality') {
                                    city = results[i].address_components[0].long_name;
                                }
                            }

                            if(city != '') {
                                var ajaxURL = services_vars.ajaxurl;
                                var security = $('#securityHomeMap').val();

                                $.ajax({
                                    type: 'POST',
                                    dataType: 'json',
                                    url: ajaxURL,
                                    data: {
                                        'action': 'reales_get_all_properties',
                                        'security': security
                                    },
                                    success: function(data) {
                                        if(data.getprops === true) {
                                            addMarkers(data.props, map);

                                            map.fitBounds(markers.reduce(function(bounds, marker) {
                                                return bounds.extend(marker.getPosition());
                                            }, new google.maps.LatLngBounds()));

                                            markerCluster = new MarkerClusterer(map, markers, {
                                                maxZoom: 18,
                                                gridSize: 60,
                                                styles: [
                                                    {
                                                        url: services_vars.theme_url + '/images/clusters/cluster-1.png',
                                                        width: 40,
                                                        height: 40,
                                                        fontFamily: "'Open Sans', sans-serif, Arial",
                                                        fontWeight: "normal",
                                                        textColor: "#fff"
                                                    },
                                                    {
                                                        url: services_vars.theme_url + '/images/clusters/cluster-2.png',
                                                        width: 40,
                                                        height: 40,
                                                        fontFamily: "'Open Sans', sans-serif, Arial",
                                                        fontWeight: "normal",
                                                        textColor: "#fff"
                                                    },
                                                    {
                                                        url: services_vars.theme_url + '/images/clusters/cluster-3.png',
                                                        width: 40,
                                                        height: 40,
                                                        fontFamily: "'Open Sans', sans-serif, Arial",
                                                        fontWeight: "normal",
                                                        textColor: "#fff"
                                                    }
                                                ]
                                            });
                                        }
                                    },
                                    error: function(errorThrown) {

                                    }
                                });
                            }
                        }
                    });

                }, function() {
                    handleNoGeolocation(true);
                });
            } else {
                // Browser doesn't support Geolocation
                handleNoGeolocation(false);
            }
        }
    }

    if($('#mapView').length > 0) {
        var propsAjaxURL = services_vars.ajaxurl;
        var propsSecurity = $('#securityAppMap').val();

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: propsAjaxURL,
            data: {
                'action'        : 'reales_get_searched_properties',
                'id'            : services_vars.search_id,
                'keywords'      : services_vars.search_keywords,
                'country'       : services_vars.search_country,
                'state'         : services_vars.search_state,
                'city'          : services_vars.search_city,
                'category'      : services_vars.search_category,
                'type'          : services_vars.search_type,
                'min_price'     : services_vars.search_min_price,
                'max_price'     : services_vars.search_max_price,
                'bedrooms'      : services_vars.search_bedrooms,
                'bathrooms'     : services_vars.search_bathrooms,
                'neighborhood'  : services_vars.search_neighborhood,
                'min_area'      : services_vars.search_min_area,
                'max_area'      : services_vars.search_max_area,
                'featured'      : services_vars.featured,
                'amenities'     : services_vars.search_amenities,
                'custom_fields' : services_vars.search_custom_fields,
                'page'          : services_vars.page,
                'sort'          : services_vars.sort,
                'security'      : propsSecurity
            },
            success: function(data) {
                appMap = new google.maps.Map(document.getElementById('mapView'), options);
                var styledMapType = new google.maps.StyledMapType(styles, {
                    name : 'Styled'
                });
                appMap.mapTypes.set('Styled', styledMapType);
                appMap.getStreetView().setOptions(panoramaOptions);

                var searchedPosition = new google.maps.LatLng(services_vars.search_lat, services_vars.search_lng);
                appMap.setCenter(searchedPosition);
                appMap.setZoom(parseInt(services_vars.zoom));

                if(data.getprops === true) {
                    addMarkers(data.props, appMap);

                    appMap.fitBounds(markers.reduce(function(bounds, marker) {
                        return bounds.extend(marker.getPosition());
                    }, new google.maps.LatLngBounds()));

                    google.maps.event.trigger(appMap, 'resize');

                    markerCluster = new MarkerClusterer(appMap, markers, {
                        maxZoom: 18,
                        gridSize: 60,
                        styles: [
                            {
                                url        : services_vars.theme_url + '/images/clusters/cluster-1.png',
                                width      : 40,
                                height     : 40,
                                fontFamily : "'Open Sans', sans-serif, Arial",
                                fontWeight : "normal",
                                textColor  : "#fff"
                            },
                            {
                                url        : services_vars.theme_url + '/images/clusters/cluster-2.png',
                                width      : 40,
                                height     : 40,
                                fontFamily : "'Open Sans', sans-serif, Arial",
                                fontWeight : "normal",
                                textColor  : "#fff"
                            },
                            {
                                url        : services_vars.theme_url + '/images/clusters/cluster-3.png',
                                width      : 40,
                                height     : 40,
                                fontFamily : "'Open Sans', sans-serif, Arial",
                                fontWeight : "normal",
                                textColor  : "#fff"
                            }
                        ]
                    });

                    setPOIControls(appMap, appMap.getCenter());
                }
            },
            error: function(errorThrown) {

            }
        });
    }

    if($('#mapIdxView').length > 0) {
        var props = [];

        if($('.dsidx-results').length > 0) {
            var idxProps = dsidx.dataSets['results'];

            $.each(idxProps, function(i, idxProp) {
                var prop = new Object();
                prop.lat = (idxProp.Latitude == '-1.000000') ? services_vars.default_lat : idxProp.Latitude;
                prop.lng = (idxProp.Longitude == '-1.000000') ? services_vars.default_lng : idxProp.Longitude;
                if(idxProp.PhotoUriBase && idxProp.PhotoFileName) {
                    prop.thumb = idxProp.PhotoUriBase + idxProp.PhotoFileName;
                } else {
                    prop.thumb = services_vars.theme_url +  '/images/no-photos.jpg';
                }
                prop.type = [];
                prop.price = idxProp.Price;
                prop.currency = '';
                prop.price_label = '';
                prop.title = idxProp.Address;
                prop.address = idxProp.City;
                prop.city = '';
                prop.bedrooms = parseInt(idxProp.BedsTotal);
                prop.bathrooms = parseInt(idxProp.BathsTotal);
                prop.area = idxProp.ImprovedSqFt;
                prop.link = services_vars.home_redirect + '/idx/' + idxProp.PrettyUriForUrl;
                prop.unit = services_vars.search_unit;

                props.push(prop);
            });
        }

        if($('.dsidx-details').length > 0) {
            var prop = new Object();

            prop.lat = (dsidx.details.latitude == '-1.000000') ? services_vars.default_lat : dsidx.details.latitude;
            prop.lng = (dsidx.details.longitude == '-1.000000') ? services_vars.default_lng : dsidx.details.longitude;
            if(dsidx.details.photoUriBase && dsidx.details.photoFileName) {
                prop.thumb = dsidx.details.photoUriBase + dsidx.details.photoFileName;
            } else {
                prop.thumb = services_vars.theme_url +  '/images/no-photos.jpg';
            }
            prop.type = [];
            prop.price = $('#dsidx-price td').text();
            prop.currency = '';
            prop.price_label = '';
            var idxTitleStr = $('#idx-title').text().split(",");
            prop.title = idxTitleStr[0];
            prop.address = dsidx.details.city;
            prop.city = '';
            var idxBeds = $('#dsidx-primary-data tbody tr:nth-child(3) td').text();
            prop.bedrooms = parseInt(idxBeds);
            var idxBaths = $('#dsidx-primary-data tbody tr:nth-child(4) td').text().split(",");
            var idxBathsTotal = 0;
            $.each(idxBaths, function(index, val) {
                 idxBathsTotal += parseInt(val);
            });
            prop.bathrooms = parseInt(idxBathsTotal);
            var idxArea = $('#dsidx-primary-data tbody tr:nth-child(5) td').text();
            prop.area = idxArea;
            prop.link = window.location.href;
            prop.unit = '';

            props.push(prop);
        }

        setTimeout(function() {
            appMap = new google.maps.Map(document.getElementById('mapIdxView'), options);
            var styledMapType = new google.maps.StyledMapType(styles, {
                name : 'Styled'
            });
            appMap.mapTypes.set('Styled', styledMapType);
            appMap.getStreetView().setOptions(panoramaOptions);

            var searchedPosition = new google.maps.LatLng(services_vars.search_lat, services_vars.search_lng);
            appMap.setCenter(searchedPosition);
            appMap.setZoom(parseInt(services_vars.zoom));

            if(props.length > 0) {
                addMarkers(props, appMap);

                appMap.fitBounds(markers.reduce(function(bounds, marker) {
                    return bounds.extend(marker.getPosition());
                }, new google.maps.LatLngBounds()));

                if(props.length > 1) {
                    markerCluster = new MarkerClusterer(appMap, markers, {
                        maxZoom: 18,
                        gridSize: 60,
                        styles: [
                            {
                                url: services_vars.theme_url + '/images/clusters/cluster-1.png',
                                width: 40,
                                height: 40,
                                fontFamily: "'Open Sans', sans-serif, Arial",
                                fontWeight: "normal",
                                textColor: "#fff"
                            },
                            {
                                url: services_vars.theme_url + '/images/clusters/cluster-2.png',
                                width: 40,
                                height: 40,
                                fontFamily: "'Open Sans', sans-serif, Arial",
                                fontWeight: "normal",
                                textColor: "#fff"
                            },
                            {
                                url: services_vars.theme_url + '/images/clusters/cluster-3.png',
                                width: 40,
                                height: 40,
                                fontFamily: "'Open Sans', sans-serif, Arial",
                                fontWeight: "normal",
                                textColor: "#fff"
                            }
                        ]
                    });
                } else {
                    appMap.setZoom(parseInt(services_vars.zoom));
                }

                google.maps.event.trigger(appMap, 'resize');
                setPOIControls(appMap, appMap.getCenter());
            }
        }, 2000);
    }

    if($('#mapSingleView').length > 0) {
        var propsAjaxURL = services_vars.ajaxurl;
        var propsSecurity = $('#securityAppMap').val();

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: propsAjaxURL,
            data: {
                'action': 'reales_get_single_property',
                'single_id': $('#single_id').val(),
                'security': propsSecurity
            },
            success: function(data) {
                appMap = new google.maps.Map(document.getElementById('mapSingleView'), options);
                var styledMapType = new google.maps.StyledMapType(styles, {
                    name : 'Styled'
                });
                appMap.mapTypes.set('Styled', styledMapType);
                appMap.getStreetView().setOptions(panoramaOptions);

                if(data.getprops === true) {
                    var singlePosition = new google.maps.LatLng(data.props[0].lat, data.props[0].lng);
                    appMap.setCenter(singlePosition);
                    appMap.setZoom(parseInt(services_vars.zoom));

                    addMarkers(data.props, appMap);
                }

                setPOIControls(appMap, singlePosition);
            },
            error: function(errorThrown) {

            }
        });
    }

    if($('#mapMyView').length > 0) {
        var propsAjaxURL = services_vars.ajaxurl;
        var propsSecurity = $('#securityAppMap').val();

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: propsAjaxURL,
            data: {
                'action': 'reales_get_my_properties',
                'agent_id': $('#agent_id').val(),
                'page': services_vars.page,
                'security': propsSecurity
            },
            success: function(data) {
                appMap = new google.maps.Map(document.getElementById('mapMyView'), options);
                var styledMapType = new google.maps.StyledMapType(styles, {
                    name : 'Styled'
                });
                appMap.mapTypes.set('Styled', styledMapType);
                appMap.getStreetView().setOptions(panoramaOptions);

                if(data.getprops === true) {
                    addMarkers(data.props, appMap);

                    appMap.fitBounds(markers.reduce(function(bounds, marker) {
                        return bounds.extend(marker.getPosition());
                    }, new google.maps.LatLngBounds()));

                    markerCluster = new MarkerClusterer(appMap, markers, {
                        maxZoom: 18,
                        gridSize: 60,
                        styles: [
                            {
                                url: services_vars.theme_url + '/images/clusters/cluster-1.png',
                                width: 40,
                                height: 40,
                                fontFamily: "'Open Sans', sans-serif, Arial",
                                fontWeight: "normal",
                                textColor: "#fff"
                            },
                            {
                                url: services_vars.theme_url + '/images/clusters/cluster-2.png',
                                width: 40,
                                height: 40,
                                fontFamily: "'Open Sans', sans-serif, Arial",
                                fontWeight: "normal",
                                textColor: "#fff"
                            },
                            {
                                url: services_vars.theme_url + '/images/clusters/cluster-3.png',
                                width: 40,
                                height: 40,
                                fontFamily: "'Open Sans', sans-serif, Arial",
                                fontWeight: "normal",
                                textColor: "#fff"
                            }
                        ]
                    });

                    setPOIControls(appMap, appMap.getCenter());
                }
            },
            error: function(errorThrown) {

            }
        });
    }

    if($('#mapFavView').length > 0) {
        var propsAjaxURL = services_vars.ajaxurl;
        var propsSecurity = $('#securityAppMap').val();

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: propsAjaxURL,
            data: {
                'action': 'reales_get_fav_properties',
                'user_id': $('#user_id').val(),
                'page': services_vars.page,
                'security': propsSecurity
            },
            success: function(data) {
                appMap = new google.maps.Map(document.getElementById('mapFavView'), options);
                var styledMapType = new google.maps.StyledMapType(styles, {
                    name : 'Styled'
                });
                appMap.mapTypes.set('Styled', styledMapType);
                appMap.getStreetView().setOptions(panoramaOptions);

                if(data.getprops === true) {
                    addMarkers(data.props, appMap);

                    appMap.fitBounds(markers.reduce(function(bounds, marker) {
                        return bounds.extend(marker.getPosition());
                    }, new google.maps.LatLngBounds()));

                    markerCluster = new MarkerClusterer(appMap, markers, {
                        maxZoom: 18,
                        gridSize: 60,
                        styles: [
                            {
                                url: services_vars.theme_url + '/images/clusters/cluster-1.png',
                                width: 40,
                                height: 40,
                                fontFamily: "'Open Sans', sans-serif, Arial",
                                fontWeight: "normal",
                                textColor: "#fff"
                            },
                            {
                                url: services_vars.theme_url + '/images/clusters/cluster-2.png',
                                width: 40,
                                height: 40,
                                fontFamily: "'Open Sans', sans-serif, Arial",
                                fontWeight: "normal",
                                textColor: "#fff"
                            },
                            {
                                url: services_vars.theme_url + '/images/clusters/cluster-3.png',
                                width: 40,
                                height: 40,
                                fontFamily: "'Open Sans', sans-serif, Arial",
                                fontWeight: "normal",
                                textColor: "#fff"
                            }
                        ]
                    });

                    setPOIControls(appMap, appMap.getCenter());
                }
            },
            error: function(errorThrown) {

            }
        });
    }

    if($('#mapAgentView').length > 0) {
        var propsAjaxURL = services_vars.ajaxurl;
        var propsSecurity = $('#securityAppMap').val();

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: propsAjaxURL,
            data: {
                'action': 'reales_get_agent_properties',
                'agent_id': $('#agent_id').val(),
                'security': propsSecurity
            },
            success: function(data) {
                appMap = new google.maps.Map(document.getElementById('mapAgentView'), options);
                var styledMapType = new google.maps.StyledMapType(styles, {
                    name : 'Styled'
                });
                appMap.mapTypes.set('Styled', styledMapType);
                appMap.getStreetView().setOptions(panoramaOptions);

                if(data.getprops === true) {
                    addMarkers(data.props, appMap);

                    appMap.fitBounds(markers.reduce(function(bounds, marker) {
                        return bounds.extend(marker.getPosition());
                    }, new google.maps.LatLngBounds()));

                    markerCluster = new MarkerClusterer(appMap, markers, {
                        maxZoom: 18,
                        gridSize: 60,
                        styles: [
                            {
                                url: services_vars.theme_url + '/images/clusters/cluster-1.png',
                                width: 40,
                                height: 40,
                                fontFamily: "'Open Sans', sans-serif, Arial",
                                fontWeight: "normal",
                                textColor: "#fff"
                            },
                            {
                                url: services_vars.theme_url + '/images/clusters/cluster-2.png',
                                width: 40,
                                height: 40,
                                fontFamily: "'Open Sans', sans-serif, Arial",
                                fontWeight: "normal",
                                textColor: "#fff"
                            },
                            {
                                url: services_vars.theme_url + '/images/clusters/cluster-3.png',
                                width: 40,
                                height: 40,
                                fontFamily: "'Open Sans', sans-serif, Arial",
                                fontWeight: "normal",
                                textColor: "#fff"
                            }
                        ]
                    });

                    setPOIControls(appMap, appMap.getCenter());
                }
            },
            error: function(errorThrown) {

            }
        });
    }

    var newMarker = null;
    if($('#mapNewView').length > 0) {
        map = new google.maps.Map(document.getElementById('mapNewView'), options);
        var styledMapType = new google.maps.StyledMapType(styles, {
            name : 'Styled'
        });
        map.mapTypes.set('Styled', styledMapType);
        map.getStreetView().setOptions(panoramaOptions);
        var mapLat, mapLng;

        if ($('#new_lat_h').val() && $('#new_lng_h').val()) {
            mapLat = $('#new_lat_h').val();
            mapLng = $('#new_lng_h').val();
            map.setCenter(new google.maps.LatLng(mapLat, mapLng));
            map.setZoom(parseInt(services_vars.zoom));

            newMarker = new google.maps.Marker({
                position: new google.maps.LatLng(mapLat, mapLng),
                map: map,
                icon: newMarkerImage,
                draggable: true,
                animation: google.maps.Animation.DROP,
            });

            google.maps.event.addListener(newMarker, "mouseup", function(event) {
                $('#new_lat').val(this.position.lat());
                $('#new_lng').val(this.position.lng());
                $('#new_lat_h').val(this.position.lat());
                $('#new_lng_h').val(this.position.lng());
            });
        } else if(services_vars.default_lat != '' && services_vars.default_lng != '') {
            mapLat = services_vars.default_lat;
            mapLng = services_vars.default_lng;
            map.setCenter(new google.maps.LatLng(mapLat, mapLng));
            map.setZoom(parseInt(services_vars.zoom));

            newMarker = new google.maps.Marker({
                position: new google.maps.LatLng(mapLat, mapLng),
                map: map,
                icon: newMarkerImage,
                draggable: true,
                animation: google.maps.Animation.DROP,
            });

            google.maps.event.addListener(newMarker, "mouseup", function(event) {
                $('#new_lat').val(this.position.lat());
                $('#new_lng').val(this.position.lng());
                $('#new_lat_h').val(this.position.lat());
                $('#new_lng_h').val(this.position.lng());
            });
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var userPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    $('#new_lat').val(position.coords.latitude);
                    $('#new_lng').val(position.coords.longitude);
                    $('#new_lat_h').val(position.coords.latitude);
                    $('#new_lng_h').val(position.coords.longitude);
                    map.setCenter(userPosition);
                    map.setZoom(parseInt(services_vars.zoom));

                    newMarker = new google.maps.Marker({
                        position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                        map: map,
                        icon: newMarkerImage,
                        draggable: true,
                        animation: google.maps.Animation.DROP,
                    });

                    google.maps.event.addListener(newMarker, "mouseup", function(event) {
                        $('#new_lat').val(this.position.lat());
                        $('#new_lng').val(this.position.lng());
                        $('#new_lat_h').val(this.position.lat());
                        $('#new_lng_h').val(this.position.lng());
                    });

                }, function() {
                    handleNoGeolocation(true);
                });
            } else {
                handleNoGeolocation(false);
            }
        }

        $('#addressPinBtn').click(function() {
            geocoder = new google.maps.Geocoder();
            if($('#new_city').hasClass('auto')) {
                var address = document.getElementById('new_address').value + ', ' + document.getElementById('new_city').value;
            } else {
                var address = document.getElementById('new_address').value + ', ' + $('#new_city').children('option:selected').text();
            }

            geocoder.geocode( { 'address': address }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    newMarker.setPosition(results[0].geometry.location);
                    newMarker.setVisible(true);
                    $('#new_lat').val(newMarker.getPosition().lat());
                    $('#new_lng').val(newMarker.getPosition().lng());
                    $('#new_lat_h').val(newMarker.getPosition().lat());
                    $('#new_lng_h').val(newMarker.getPosition().lng());
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        });

        $('#new_lat').change(function() {
            var lat = $(this).val();
            var lng = $('#new_lng').val();
            var pos = new google.maps.LatLng(lat, lng);
            newMarker.setPosition(pos);
            newMarker.setVisible(true);
            map.setCenter(pos);
            $('#new_lat_h').val(lat);
        });

        $('#new_lng').change(function() {
            var lat = $('#new_lat').val();
            var lng = $(this).val();
            var pos = new google.maps.LatLng(lat, lng);
            newMarker.setPosition(pos);
            newMarker.setVisible(true);
            map.setCenter(pos);
            $('#new_lng_h').val(lng);
        });

        if($('#new_city').length > 0) {
            if($('#new_city').hasClass('auto')) {
                var city = document.getElementById('new_city');
                var cityAuto = new google.maps.places.Autocomplete(city, cityOptions);
                google.maps.event.addListener(cityAuto, 'place_changed', function() {
                    var place = cityAuto.getPlace();
                    $('#new_city').blur();
                    setTimeout(function() { $('#new_city').val(place.name); }, 1);

                    if (place.geometry.viewport) {
                        map.fitBounds(place.geometry.viewport);
                    } else {
                        map.setCenter(place.geometry.location);
                    }
                    newMarker.setPosition(place.geometry.location);
                    newMarker.setVisible(true);
                    $('#new_lat').val(newMarker.getPosition().lat());
                    $('#new_lng').val(newMarker.getPosition().lng());
                    $('#new_lat_h').val(newMarker.getPosition().lat());
                    $('#new_lng_h').val(newMarker.getPosition().lng());
                    $('#new_lat_label').text(newMarker.getPosition().lat());
                    $('#new_lng_label').text(newMarker.getPosition().lng());

                    return false;
                });
            } else {
                geocoder = new google.maps.Geocoder();
                $('#new_city').change(function(event) {
                    var city = $(this).children('option:selected').text();
                    geocoder.geocode( { 'address': city }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            map.setCenter(results[0].geometry.location);
                            newMarker.setPosition(results[0].geometry.location);
                            newMarker.setVisible(true);
                            $('#new_lat').val(newMarker.getPosition().lat());
                            $('#new_lng').val(newMarker.getPosition().lng());
                            $('#new_lat_h').val(newMarker.getPosition().lat());
                            $('#new_lng_h').val(newMarker.getPosition().lng());
                        } else {
                            alert('Geocode was not successful for the following reason: ' + status);
                        }
                    });
                });
            }
        }

        if($('#new_neighborhood').length > 0) {
            var neighborhood = document.getElementById('new_neighborhood');
            var neighborhoodAuto = new google.maps.places.Autocomplete(neighborhood);
            google.maps.event.addListener(neighborhoodAuto, 'place_changed', function() {
                var place = neighborhoodAuto.getPlace();
                $('#new_neighborhood').blur();
                setTimeout(function() { $('#new_neighborhood').val(place.address_components[0].short_name); }, 1);

                return false;
            });
        }
    }

    if($('.no-map').length == 0) {
        $('.card').each(function(i) {
            $(this).on('mouseenter', function() {
                if(appMap) {
                    google.maps.event.trigger(markers[i], 'click');
                }
            });
            $(this).on('mouseleave', function() {
                infobox.open(null,null);
            });
        });
    }

    $('.properties-list-item').each(function(i) {
        $(this).on('mouseenter', function() {
            if(appMap) {
                google.maps.event.trigger(markers[i], 'click');
            }
        });
        $(this).on('mouseleave', function() {
            infobox.open(null,null);
        });
    });

    $('.card-min').each(function(i) {
        $(this).on('mouseenter', function() {
            if(appMap) {
                google.maps.event.trigger(markers[i], 'click');
            }
        });
        $(this).on('mouseleave', function() {
            infobox.open(null,null);
        });
    });

    $('.dsidx-listing').each(function(i) {
        $(this).on('mouseenter', function() {
            if(appMap) {
                google.maps.event.trigger(markers[i], 'click');
            }
        });
        $(this).on('mouseleave', function() {
            infobox.open(null,null);
        });
    });

    $('#favBtn').click(function() {
        var ajaxURL = services_vars.ajaxurl;
        var security = $('#securityFav').val();

        var fav_no = $(this).siblings('.fav_no').text();

        if($(this).hasClass('addFav')) {
            $(this).siblings('.fav_no').text(parseInt(fav_no) + 1);
            $(this).removeClass('addFav').addClass('addedFav');
            $(this).children('span').removeClass('fa-heart-o').addClass('fa-heart');

            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: ajaxURL,
                data: {
                    'action': 'reales_add_to_favourites',
                    'user_id': services_vars.user_id,
                    'post_id': services_vars.post_id,
                    'security': security
                },
                success: function(data) {
                    if(data.addfav === true) {
                        // console.log(data.fav);
                    }
                },
                error: function(errorThrown) {

                }
            });
        } else if($(this).hasClass('addedFav')) {
            $(this).siblings('.fav_no').text(parseInt(fav_no) - 1);
            $(this).removeClass('addedFav').addClass('addFav');
            $(this).children('span').removeClass('fa-heart').addClass('fa-heart-o');

            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: ajaxURL,
                data: {
                    'action': 'reales_remove_from_favourites',
                    'user_id': services_vars.user_id,
                    'post_id': services_vars.post_id,
                    'security': security
                },
                success: function(data) {
                    if(data.removefav === true) {
                        // console.log(data.fav);
                    }
                },
                error: function(errorThrown) {

                }
            });
        }
    });

    $('#sendMessageBtn').click(function() {
        var ajaxURL = services_vars.ajaxurl;
        var security = $('#securityAgentMessage').val();
        $('#ca_response').empty();
        $('#sendMessageBtn').html('<span class="fa fa-spin fa-spinner"></span> ' + services_vars.sending_message).addClass('disabled');
        var p_info_title = $('#p_info_title').length > 0 ? $('#p_info_title').val() : '';
        var p_info_link = $('#p_info_link').length > 0 ? $('#p_info_link').val() : '';

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_send_message_to_agent',
                'agent_email': $('#agent_email').val(),
                'name': $('#ca_name').val(),
                'email': $('#ca_email').val(),
                'phone': $('#ca_phone').val(),
                'subject': $('#ca_subject').val(),
                'p_info_title': p_info_title,
                'p_info_link': p_info_link,
                'message': $('#ca_message').val(),
                'g-recaptcha-response': $('#g-recaptcha-response').val(),
                'security': security
            },
            success: function(data) {
                $('#sendMessageBtn').html(services_vars.send_message).removeClass('disabled');
                var message = '';
                if(data.sent === true) {
                    message =   '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-check-circle"></span></div>' +
                                    '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                                    data.message +
                                '</div>';
                    $('#ca_name').val('');
                    $('#ca_email').val('');
                    $('#ca_phone').val('');
                    $('#ca_subject').val('');
                    $('#ca_message').val('');
                } else {
                    message =   '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-ban"></span></div>' +
                                    '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                                    data.message +
                                '</div>';
                }

                $('#ca_response').append(message);
            },
            error: function(errorThrown) {

            }
        });
    });

    $('#contactAgent').on('hide.bs.modal', function() {
        $('#ca_response').empty();
        $('#ca_name').val('');
        $('#ca_email').val('');
        $('#ca_phone').val('');
        $('#ca_subject').val('');
        $('#ca_message').val('');
    });

    $('#reportBtn').click(function() {
        var ajaxURL = services_vars.ajaxurl;
        var security = $('#securityReport').val();
        $('#rp_response').empty();
        $('#reportBtn').html('<span class="fa fa-spin fa-spinner"></span> ' + services_vars.sending_report).addClass('disabled');

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_report_property',
                'report_title': $('#report_title').val(),
                'report_link': $('#report_link').val(),
                'reason': $('#report_reason').val(),
                'security': security
            },
            success: function(data) {
                $('#reportBtn').html(services_vars.submit).removeClass('disabled');
                var message = '';
                if(data.sent === true) {
                    message =   '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-check-circle"></span></div>' +
                                    '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                                    data.message +
                                '</div>';
                    $('#report_reason').val('');
                } else {
                    message =   '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-ban"></span></div>' +
                                    '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                                    data.message +
                                '</div>';
                }

                $('#rp_response').append(message);
            },
            error: function(errorThrown) {

            }
        });
    });

    $('#reportProperty').on('hide.bs.modal', function() {
        $('#rp_response').empty();
        $('#report_reason').val('');
    });

    function get_tinymce_content(id) {
        if($('#isDesc').length > 0) {
            var content;
            var inputid = id;
            tinyMCE.triggerSave();
            var editor = tinyMCE.get(inputid);
            var textArea = jQuery('textarea#' + inputid);
            if (textArea.length>0 && textArea.is(':visible')) {
                content = textArea.val();
            } else {
                content = editor.getContent();
            }
            return content;
        } else {
            return '';
        }
    }

    $('#submitPropertyBtn').click(function() {
        $('#propertyModal').modal({
            'backdrop': 'static',
            'keyboard': false,
            'show': true
        });

        var amenities = [];
        $('#new_amenities input[type=checkbox]:checked').each(function(index) {
            amenities.push($(this).attr('name'));
        });

        var cfields = [];
        $('.customField').each(function(index) {
            cfields.push({
                field_name: $(this).attr('name'),
                field_value: $(this).val(),
                field_mandatory: $(this).attr('data-mandatory')
            });
        });

        var ajaxURL = services_vars.ajaxurl;
        var security = $('#securitySubmitProperty').val();
        $('#save_response').empty();
        $('#save_response').html('<div class="propSaving"><span class="fa fa-spin fa-spinner"></span> ' + services_vars.saving_property + '</div>');

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_save_property',
                'new_id': $('#new_id').val(),
                'user': $('#current_user').val(),
                'title': $('#new_title').val(),
                'content': get_tinymce_content('new_content'),
                'category': $('input[name=new_category]:checked').val(),
                'type': $('input[name=new_type]:checked').val(),
                'city': $('#new_city').val(),
                'lat': $('#new_lat_h').val(),
                'lng': $('#new_lng_h').val(),
                'address': $('#new_address').val(),
                'neighborhood': $('#new_neighborhood').val(),
                'zip': $('#new_zip').val(),
                'state': $('#new_state').val(),
                'country': $('#new_country').val(),
                'price': $('#new_price').val(),
                'price_label': $('#new_price_label').val(),
                'area': $('#new_area').val(),
                'bedrooms': $('#new_bedrooms').val(),
                'bathrooms': $('#new_bathrooms').val(),
                'amenities': amenities,
                'cfields' : cfields,
                'gallery': $('#new_gallery').val(),
                'plans': $('#new_plans').val(),
                'video_source': $('input[name=new_video_source]:checked').val(),
                'video_id': $('#new_video_id').val(),
                'g-recaptcha-response': $('#g-recaptcha-response').val(),
                'security': security
            },
            success: function(data) {
                var message = '';
                if(data.save === true) {
                    $('#new_id').val(data.propID);
                    $('#submitPropertyBtn').html('<span class="fa fa-save"></span> ' + services_vars.update_property);

                    message =   '<div class="alert alert-success fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-check-circle"></span></div>' +
                                    data.message +
                                '</div>';

                    setTimeout(function() {
                        document.location.href = services_vars.list_redirect;
                    }, 2000);

                } else {
                    message =   '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-ban"></span></div>' +
                                    '<button type="button" class="close close-modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                                    data.message +
                                '</div>';
                }

                $('#propertyModal .modal-dialog').removeClass('modal-sm');
                $('#save_response').html(message);
                $('.close-modal').click(function() {
                    $('#save_response').empty();
                    $('#propertyModal').modal('hide');
                    $('#propertyModal .modal-dialog').addClass('modal-sm');
                });
            },
            error: function(errorThrown) {

            }
        });
    });

    $('#deletePropertyBtn').on('click', function() {
        $('#delSinglePropModal').modal('show');
    });
    $('#del-single-prop-yes').click(function() {
        $('#propertyModal').modal({
            'backdrop': 'static',
            'keyboard': false,
            'show': true
        });

        var ajaxURL = services_vars.ajaxurl;
        var security = $('#securitySubmitProperty').val();
        $('#save_response').empty();
        $('#save_response').html('<div class="propSaving"><span class="fa fa-spin fa-spinner"></span> ' + services_vars.deleting_property + '</div>');

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_delete_property',
                'new_id': $('#new_id').val(),
                'security': security
            },
            success: function(data) {
                var message = '';
                if(data.delete === true) {
                    $('#submitProperty').empty();
                    message =   '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-check-circle"></span></div>' +
                                    data.message +
                                '</div>';
                    setTimeout(function() {
                        document.location.href = services_vars.list_redirect;
                    }, 2000);
                } else {
                    message =   '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-ban"></span></div>' +
                                    '<button type="button" class="close close-modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                                    data.message +
                                '</div>';
                }

                $('#propertyModal .modal-dialog').removeClass('modal-sm');
                $('#save_response').html(message);
                $('.close-modal').click(function() {
                    $('#save_response').empty();
                    $('#propertyModal').modal('hide');
                    $('#propertyModal .modal-dialog').addClass('modal-sm');
                });
            },
            error: function(errorThrown) {

            }
        });
    });

    $('.delMyProperty').on('click', function() {
        var _self = $(this);
        $('#delPropModal').modal('show').on('shown.bs.modal', function(e) {
            $('#del-prop-id').val(_self.attr('data-del'));
        });
    });
    $('#delPropModal').on('hidden.bs.modal', function(e) {
        $('#del-prop-id').val('');
    });
    $('#del-prop-yes').click(function(){
        $('#propertyModal').modal({
            'backdrop': 'static',
            'keyboard': false,
            'show': true
        });

        var ajaxURL = services_vars.ajaxurl;
        var propID = $('#del-prop-id').val();
        var security = $('#securitySubmitProperty').val();

        $('#save_response').empty();
        $('#save_response').html('<div class="propSaving"><span class="fa fa-spin fa-spinner"></span> ' + services_vars.deleting_property + '</div>');

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_delete_property',
                'new_id': propID,
                'security': security
            },
            success: function(data) {
                var message = '';
                if(data.delete === true) {
                    $('#submitProperty').empty();
                    message =   '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-check-circle"></span></div>' +
                                    data.message +
                                '</div>';
                    setTimeout(function() {
                        document.location.href = services_vars.list_redirect;
                    }, 2000);
                } else {
                    message =   '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-ban"></span></div>' +
                                    '<button type="button" class="close close-modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                                    data.message +
                                '</div>';
                }

                $('#propertyModal .modal-dialog').removeClass('modal-sm');
                $('#save_response').html(message);
                $('.close-modal').click(function() {
                    $('#save_response').empty();
                    $('#propertyModal').modal('hide');
                    $('#propertyModal .modal-dialog').addClass('modal-sm');
                });
            },
            error: function(errorThrown) {

            }
        });
    });

    $('#updateProfileBtn').click(function() {
        $('#accountModal').modal({
            'backdrop': 'static',
            'keyboard': false,
            'show': true
        });

        var ajaxURL = services_vars.ajaxurl;
        var security = $('#securityUserProfile').val();
        $('#up_response').empty();
        $('#up_response').html('<div class="propSaving"><span class="fa fa-spin fa-spinner"></span> ' + services_vars.updating_profile + '</div>');

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_update_user_profile',
                'user_id': $('#user_id').val(),
                'first_name': $('#up_first_name').val(),
                'last_name': $('#up_last_name').val(),
                'nickname': $('#up_nickname').val(),
                'email': $('#up_email').val(),
                'password': $('#up_password').val(),
                're_password': $('#up_re_password').val(),
                'avatar': $('#new_gallery').val(),
                'agent_id': $('#agent_id').val(),
                'agent_about': get_tinymce_content('agent_about'),
                'agent_specs': $('#agent_specs').val(),
                'agent_agency': $('#agent_agency').val(),
                'agent_phone': $('#agent_phone').val(),
                'agent_mobile': $('#agent_mobile').val(),
                'agent_skype': $('#agent_skype').val(),
                'agent_facebook': $('#agent_facebook').val(),
                'agent_twitter': $('#agent_twitter').val(),
                'agent_google': $('#agent_google').val(),
                'agent_linkedin': $('#agent_linkedin').val(),
                'security': security
            },
            success: function(data) {
                var message = '';
                if(data.save === true) {
                    message =   '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-check-circle"></span></div>' +
                                    '<button type="button" class="close close-modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                                    data.message +
                                '</div>';
                } else {
                    message =   '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-ban"></span></div>' +
                                    '<button type="button" class="close close-modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                                    data.message +
                                '</div>';
                }

                $('#accountModal .modal-dialog').removeClass('modal-sm');
                $('#up_response').html(message);
                $('.close-modal').click(function() {
                    $('#up_response').empty();
                    $('#accountModal').modal('hide');
                    $('#accountModal .modal-dialog').addClass('modal-sm');
                });
            },
            error: function(errorThrown) {

            }
        });
    });

    $('#becomeAgentBtn').click(function() {
        $('#accountModal').modal({
            'backdrop': 'static',
            'keyboard': false,
            'show': true
        });

        var ajaxURL = services_vars.ajaxurl;
        var security = $('#securityUserProfile').val();
        $('#up_response').empty();
        $('#up_response').html('<div class="propSaving"><span class="fa fa-spin fa-spinner"></span> ' + services_vars.updating_profile + '</div>');

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_become_agent',
                'user_id': $('#user_id').val(),
                'security': security
            },
            success: function(data) {
                var message = '';
                if(data.save === true) {
                    message =   '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-check-circle"></span></div>' +
                                    '<button type="button" class="close close-modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                                    data.message +
                                '</div>';
                    setTimeout(function() {
                        document.location.href = services_vars.account_redirect;
                    }, 2000);
                } else {
                    message =   '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-ban"></span></div>' +
                                    '<button type="button" class="close close-modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                                    data.message +
                                '</div>';
                }

                $('#accountModal .modal-dialog').removeClass('modal-sm');
                $('#up_response').html(message);

                $('.close-modal').click(function() {
                    $('#up_response').empty();
                    $('#accountModal').modal('hide');
                    $('#accountModal .modal-dialog').addClass('modal-sm');
                });
            },
            error: function(errorThrown) {

            }
        });
    });

    $('#sendContactMessageBtn').click(function() {
        var ajaxURL = services_vars.ajaxurl;
        var security = $('#securityContactPage').val();
        $('#cp_response').empty();
        $('#sendContactMessageBtn').html('<span class="fa fa-spin fa-spinner"></span> ' + services_vars.sending_message).addClass('disabled');

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_send_message_to_company',
                'company_email': $('#company_email').val(),
                'name': $('#cp_name').val(),
                'email': $('#cp_email').val(),
                'subject': $('#cp_subject').val(),
                'message': $('#cp_message').val(),
                'g-recaptcha-response': $('#g-recaptcha-response').val(),
                'security': security
            },
            success: function(data) {
                $('#sendContactMessageBtn').html(services_vars.send_message).removeClass('disabled');
                var message = '';
                if(data.sent === true) {
                    message =   '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-check-circle"></span></div>' +
                                    '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                                    data.message +
                                '</div>';
                    $('#cp_name').val('');
                    $('#cp_email').val('');
                    $('#cp_subject').val('');
                    $('#cp_message').val('');
                } else {
                    message =   '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-ban"></span></div>' +
                                    '<button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                                    data.message +
                                '</div>';
                }

                $('#cp_response').append(message);
            },
            error: function(errorThrown) {

            }
        });
    });


    // Process payment

    var s_price = $('#s_price').val();
    var f_price = $('#f_price').val();
    $('.myFeatured').on('change', function() {
        if($(this).is(':checked')) {
            if($(this).parent().parent().parent().parent().find('.pay-featured').length > 0) {
                $(this).parent().parent().parent().parent().find('.payBtn').show();
                $(this).parent().parent().parent().parent().find('.payBtn').attr('data-featured', '');
            } else {
                $(this).parent().parent().parent().parent().find('.pay-total').text(parseFloat(s_price) + parseFloat(f_price));
                $(this).parent().parent().parent().parent().find('.payBtn').attr('data-featured', '1');
            }
        } else {
            $(this).parent().parent().parent().parent().find('.payBtn').attr('data-featured', '');
            if($(this).parent().parent().parent().parent().find('.pay-featured').length > 0) {
                $(this).parent().parent().parent().parent().find('.payBtn').hide();
            } else {
                $(this).parent().parent().parent().parent().find('.pay-total').text(parseFloat(s_price));
            }
        }
    });
    $('.myFeaturedFree').on('change', function() {
        if($(this).is(':checked')) {
            $(this).parent().parent().parent().parent().find('.upgradeBtn').show();
        } else {
            $(this).parent().parent().parent().parent().find('.upgradeBtn').hide();
        }
    });

    $('.upgradeBtn').on('click', function() {
        $('#propertyModal').modal({
            'backdrop': 'static',
            'keyboard': false,
            'show': true
        });

        var ajaxURL = services_vars.ajaxurl;
        var propID = $(this).attr('data-id');
        var agentID = $(this).attr('data-agent-id');
        var security = $('#securityUpgradeProperty').val();

        $('#save_response').empty();
        $('#save_response').html('<div class="propSaving"><span class="fa fa-spin fa-spinner"></span> ' + services_vars.featuring_property + '</div>');

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_upgrade_property_featured',
                'prop_id': propID,
                'agent_id': agentID,
                'security': security
            },
            success: function(data) {
                var message = '';
                if(data.upgrade === true) {
                    message =   '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-check-circle"></span></div>' +
                                    data.message +
                                '</div>';
                    setTimeout(function() {
                        document.location.href = services_vars.list_redirect;
                    }, 2000);
                } else {
                    message =   '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-ban"></span></div>' +
                                    '<button type="button" class="close close-modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                                    data.message +
                                '</div>';
                }

                $('#propertyModal .modal-dialog').removeClass('modal-sm');
                $('#save_response').html(message);
                $('.close-modal').click(function() {
                    $('#save_response').empty();
                    $('#propertyModal').modal('hide');
                    $('#propertyModal .modal-dialog').addClass('modal-sm');
                });
            },
            error: function(errorThrown) {

            }
        });
    });

    $('.payBtn').click(function() {
        $(this).html('<span class="fa fa-spin fa-spinner"></span> ' + services_vars.please_wait).addClass('disabled');
        var prop_id = $(this).attr('data-id');
        var is_featured = $(this).attr('data-featured');
        var is_upgrade = $(this).attr('data-upgrade');
        var ajaxURL = services_vars.ajaxurl;

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_pay_listing',
                'prop_id': prop_id,
                'is_featured': is_featured,
                'is_upgrade': is_upgrade
            },
            success: function(data) {
                if(data) {
                    window.location = data.url;
                } else {
                    console.log('Something went wrong.');
                }
            },
            error: function(errorThrown) {
                console.log('Something went wrong.');
            }
        });
    });

    $('.payPlanBtn').click(function() {
        $(this).html('<span class="fa fa-spin fa-spinner"></span> ' + services_vars.please_wait).addClass('disabled');
        var plan_id = $(this).attr('data-id');
        var ajaxURL = services_vars.ajaxurl;

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action': 'reales_pay_membership_plan',
                'plan_id': plan_id
            },
            success: function(data) {
                if(data) {
                    window.location = data.url;
                } else {
                    console.log('Something went wrong.');
                }
            },
            error: function(errorThrown) {
                console.log('Something went wrong.');
            }
        });
    });

    $('.activatePlanBtn').click(function() {
        $(this).html('<span class="fa fa-spin fa-spinner"></span> ' + services_vars.please_wait).addClass('disabled');
        var plan_id  = $(this).attr('data-id');
        var agent_id = $(this).attr('data-agent-id');
        var ajaxURL  = services_vars.ajaxurl;

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action'   : 'reales_activate_membership_plan',
                'plan_id'  : plan_id,
                'agent_id' : agent_id
            },
            success: function(data) {
                if(data) {
                    window.location = data.url;
                } else {
                    console.log('Something went wrong.');
                }
            },
            error: function(errorThrown) {
                console.log('Something went wrong.');
            }
        });
    });

    $('.featuredBtn').on('click', function() {
        $('#propertyModal').modal({
            'backdrop' : 'static',
            'keyboard' : false,
            'show'     : true
        });

        var ajaxURL = services_vars.ajaxurl;
        var propID = $(this).attr('data-id');
        var agentID = $(this).attr('data-agent-id');
        var security = $('#securityFeaturedProperty').val();

        $('#save_response').empty();
        $('#save_response').html('<div class="propSaving"><span class="fa fa-spin fa-spinner"></span> ' + services_vars.featuring_property + '</div>');

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action'   : 'reales_set_property_featured',
                'prop_id'  : propID,
                'agent_id' : agentID,
                'security' : security
            },
            success: function(data) {
                var message = '';
                if(data.upgrade === true) {
                    message =   '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-check-circle"></span></div>' +
                                    data.message +
                                '</div>';
                    setTimeout(function() {
                        document.location.href = services_vars.list_redirect;
                    }, 2000);
                } else {
                    message =   '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-ban"></span></div>' +
                                    '<button type="button" class="close close-modal"><span aria-hidden="true">×</span><span class="sr-only">Close</span></button>' +
                                    data.message +
                                '</div>';
                }

                $('#propertyModal .modal-dialog').removeClass('modal-sm');
                $('#save_response').html(message);
                $('.close-modal').click(function() {
                    $('#save_response').empty();
                    $('#propertyModal').modal('hide');
                    $('#propertyModal .modal-dialog').addClass('modal-sm');
                });
            },
            error: function(errorThrown) {

            }
        });
    });

    // Save properties search result
    $('#save-search-btn').click(function() {
        var ajaxURL  = services_vars.ajaxurl;
        var security = $('#securitySaveSearch').val();

        $('#save-search-message').empty();
        $(this).html('<span class="fa fa-spin fa-spinner"></span> ' + services_vars.saving).addClass('disabled');

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action'         : 'reales_save_search',
                'saveSearchName' : $('#save-search-name').val(),
                'searchURL'      : window.location.href,
                'userID'         : $('#save-search-user').val(),
                'security'       : security
            },
            success: function(data) {
                $('#save-search-btn').html(services_vars.save).removeClass('disabled');
                var message = '';
                if(data.sent === true) {
                    message =   '<div class="alert alert-success alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-check-circle"></span></div>' +
                                    data.message +
                                '</div>';
                    $('#save-search-name').val('');
                } else {
                    message =   '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                                    '<div class="icon"><span class="fa fa-ban"></span></div>' +
                                    data.message +
                                '</div>';
                }

                $('#save-search-message').append(message);
            },
            error: function(errorThrown) {
                console.log('Something went wrong!');
            }
        });
    });

    $('#save-search-modal').on('hide.bs.modal', function() {
        $('#save-search-message').empty();
        $('#save-search-name').val('');
    });

    $('#searches-modal').on('show.bs.modal', function() {
        var ajaxURL  = services_vars.ajaxurl;
        var security = $('#securityDeleteSearch').val();

        $('#searches-modal .modal-body').html('<span class="fa fa-spin fa-spinner"></span>' + services_vars.loading_searches);

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action'   : 'reales_get_searches',
                'userID'   : $('#modal-user-id').val(),
                'security' : security
            },
            success: function(data) {
                if(data.sent === true) {
                    var searchesToArray = jQuery.makeArray(data.searches);
                    if(searchesToArray.length > 0) {
                        var searchesList = '<ul class="searches-list">';
                        $.each(data.searches, function(key, value) {
                            $.each(value, function(key1, value1) {
                                searchesList += '<li>' + key1;
                                searchesList += '<a href="#" class="btn btn-xs btn-icon btn-red delete-search pull-right" data-user="' + $('#modal-user-id').val() + '" data-name="' + key1 + '"><span class="fa fa-trash-o"></span></a>';
                                searchesList += '<a href="' + value1 + '" class="btn btn-xs btn-icon btn-green pull-right"><span class="icon-eye"></span></a>';
                                searchesList += '</li>';
                            });
                        });
                        searchesList += '</ul>';

                        $('#searches-modal .modal-body').html(searchesList);
                    } else {
                        $('#searches-modal .modal-body').html(services_vars.no_searches);
                    }
                } else {
                    console.log('Something went wrong!');
                }
            },
            error: function(errorThrown) {
                console.log('Something went wrong!');
            }
        });
    });

    $('#searches-modal').on('hide.bs.modal', function() {
        $('#searches-modal .modal-body').empty();
    });

    // Delete a search from user searches list
    $(document).on('click', '.delete-search', function(e) {
        var ajaxURL  = services_vars.ajaxurl;
        var security = $('#securityDeleteSearch').val();
        var obj      = $(this);

        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: ajaxURL,
            data: {
                'action'     : 'reales_delete_search',
                'searchName' : obj.attr('data-name'),
                'userID'     : obj.attr('data-user'),
                'security'   : security
            },
            success: function(data) {
                if(data.sent === true) {
                    obj.parent().remove();
                    if($('.searches-list li').length == 0) {
                        $('#searches-modal .modal-body').html(services_vars.no_searches);
                    }
                } else {
                    console.log('Something went wrong!');
                }
            },
            error: function(errorThrown) {
                console.log('Something went wrong!');
            }
        });
    });

    // Print property page service
    $('#printProperty').click(function(event) {
        var ajaxURL  = services_vars.ajaxurl;
        var security = $('#securityPrintProperty').val();
        var propID   = $(this).attr('data-id');

        event.preventDefault();

        var printWindow = window.open('', 'Print Property', 'width=600, height=800');

        $.ajax({
            type: 'POST',
            url: ajaxURL,
            data: {
                'action'     : 'reales_print_property',
                'propID'     : propID,
                'security'   : security
            },
            success: function(data) {
                printWindow.document.write(data); 
                printWindow.document.close();
                printWindow.focus();
            },
            error: function(errorThrown) {
                console.log('Something went wrong!');
            }
        });
    });

    $('.submitPropertyLinkBtn').click(function(event) {
        if(services_vars.user_logged_in == 0) {
            event.preventDefault();
            $('#signin').modal('show');
        } else {
            if(services_vars.user_is_agent == 0) {
                event.preventDefault();
                $('#propertyModal').modal('show');
            }
        }
    });

    // Optima IDX

    $('#ihf-main-container .btn-primary').addClass('btn-green');
    $('.content-sidebar .widget_ihomefinderpropertiesgallery > a').addClass('btn btn-green btn-block');
    $('.areaPickerExpandAllTopBar').removeClass('btn-primary btn-green');
    $('.ihf-listing-search-results .btn-group.btn-group-justified > a').removeClass('btn-green').addClass('btn-gray');

    if($('.ihf-listing-search-results').length > 0) {
        var props = [];

        $('.ihf-grid-result').each(function(i) {
            var prop = new Object();

            prop.title = $(this).find('.ihf-grid-result-address').html().replace('<br>', ',');
            prop.lat = (mapListings[i].latitude == '') ? services_vars.default_lat : mapListings[i].latitude;
            prop.lng = (mapListings[i].longitude == '') ? services_vars.default_lng : mapListings[i].longitude;
            prop.thumb = $(this).find('.ihf-results-grid-photo').attr('data-ihf-main-source');
            prop.price = $(this).find('.ihf-grid-result-price > a > span').html();

            var type = $(this).find('.ihf-grid-result-price > a').text();
            var regExp = /\(([^)]+)\)/;
            var matches = regExp.exec(type);
            if ((typeof(matches) !== 'undefined') && (matches !== null)) {
                prop.type = [{name: matches[1]}];
            } else {
                prop.type = '';
            }
            prop.currency = ''; 
            prop.price_label = '';

            prop.address = $(this).find('.ihf-grid-result-address').html().replace('<br>', ',');
            prop.city = '';

            prop.bedrooms = $(this).find('.ihf-grid-result-basic-info-item1 > b').text();
            prop.bathrooms = $(this).find('.ihf-grid-result-basic-info-item2 > b').text();
            prop.area = $(this).find('.ihf-grid-result-basic-info-item3').text();
            prop.unit = '';
            prop.link = $(this).find('.ihf-grid-result-price > a').attr('href');

            props.push(prop);

        });

        $('.ihf-result').each(function(i) {
            var prop = new Object();

            prop.title = $(this).find('.ihf-results-address > a').text();
            prop.lat = (mapListings[i].latitude == '') ? services_vars.default_lat : mapListings[i].latitude;
            prop.lng = (mapListings[i].longitude == '') ? services_vars.default_lng : mapListings[i].longitude;
            prop.thumb = $(this).find('.ihf-results-photo img').attr('src');
            prop.price = $(this).find('.ihf-results-price > span').html();

            var type = $(this).find('.ihf-results-price').text();
            var regExp = /\(([^)]+)\)/;
            var matches = regExp.exec(type);
            if ((typeof(matches) !== 'undefined') && (matches !== null)) {
                prop.type = [{name: matches[1]}];
            } else {
                prop.type = '';
            }
            prop.currency = ''; 
            prop.price_label = '';

            prop.address = $(this).find('.ihf-results-address > a').text();
            prop.city = '';

            prop.bedrooms = $(this).find('.ihf-results-property-info > strong:eq(0)').text();
            if($(this).find('.ihf-results-property-info > strong').length > 3) {
                prop.bathrooms = $(this).find('.ihf-results-property-info > strong:eq(1)').text() + ' | ' + $(this).find('.ihf-results-property-info > strong:eq(2)').text();
                prop.area = $(this).find('.ihf-results-property-info > strong:eq(3)').text();
            } else {
                prop.bathrooms = $(this).find('.ihf-results-property-info > strong:eq(1)').text();
                prop.area = $(this).find('.ihf-results-property-info > strong:eq(2)').text();
            }
            prop.unit = 'Sq. Ft.';
            prop.link = $(this).find('.ihf-results-address > a').attr('href');

            props.push(prop);

        });

        setTimeout(function() {
            appMap = new google.maps.Map(document.getElementById('mapOptimaView'), options);
            var styledMapType = new google.maps.StyledMapType(styles, {
                name : 'Styled'
            });
            appMap.mapTypes.set('Styled', styledMapType);
            appMap.getStreetView().setOptions(panoramaOptions);

            var searchedPosition = new google.maps.LatLng(services_vars.search_lat, services_vars.search_lng);
            appMap.setCenter(searchedPosition);
            appMap.setZoom(parseInt(services_vars.zoom));

            if(props.length > 0) {
                addMarkers(props, appMap);

                appMap.fitBounds(markers.reduce(function(bounds, marker) {
                    return bounds.extend(marker.getPosition());
                }, new google.maps.LatLngBounds()));

                if(props.length > 1) {
                    markerCluster = new MarkerClusterer(appMap, markers, {
                        maxZoom: 18,
                        gridSize: 60,
                        styles: [
                            {
                                url: services_vars.theme_url + '/images/clusters/cluster-1.png',
                                width: 40,
                                height: 40,
                                fontFamily: "'Open Sans', sans-serif, Arial",
                                fontWeight: "normal",
                                textColor: "#fff"
                            },
                            {
                                url: services_vars.theme_url + '/images/clusters/cluster-2.png',
                                width: 40,
                                height: 40,
                                fontFamily: "'Open Sans', sans-serif, Arial",
                                fontWeight: "normal",
                                textColor: "#fff"
                            },
                            {
                                url: services_vars.theme_url + '/images/clusters/cluster-3.png',
                                width: 40,
                                height: 40,
                                fontFamily: "'Open Sans', sans-serif, Arial",
                                fontWeight: "normal",
                                textColor: "#fff"
                            }
                        ]
                    });
                } else {
                    appMap.setZoom(parseInt(services_vars.zoom));
                }

                google.maps.event.trigger(appMap, 'resize');
                setPOIControls(appMap, appMap.getCenter());
            }
        }, 2000);

        $('.ihf-grid-result-container').each(function(i) {
            $(this).on('mouseenter', function() {
                if(appMap) {
                    google.maps.event.trigger(markers[i], 'click');
                }
            });
            $(this).on('mouseleave', function() {
                infobox.open(null,null);
            });
        });

        $('.ihf-result').each(function(i) {
            $(this).on('mouseenter', function() {
                if(appMap) {
                    google.maps.event.trigger(markers[i], 'click');
                }
            });
            $(this).on('mouseleave', function() {
                infobox.open(null,null);
            });
        });
    }

    if($('.ihf-listing-detail').length > 0) {
        var firstImage = $('.ihf-image-carousel .carousel-inner .item').first().children('span').children('img').attr('data-ihf-main-source');
        $('.page-hero').css('background-image', 'url(' + firstImage + ')');
        $('h4.ihf-price').parent().removeClass('pull-right').addClass('pull-left');
        $('h4.ihf-address').parent().remove();
        $('.ihf-virtual-tour-link > a').addClass('btn btn-gray');
    }

})(jQuery);
