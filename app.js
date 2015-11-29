/*
===================================================================================================================================
===================================================================================================================================
===============  __  ____ _            _                   _____                 _                                   ==============
=============== |  \/  (_) |          (_)                 /  __ \               | |                                  ==============
=============== | .  . |_| | ___ _ __  _ _   _ _ __ ___   | /  \/ ___  _ __  ___| |_ _ __ _   _  ___ __ _ ___  __ _  ==============
=============== | |\/| | | |/ _ \ '_ \| | | | | '_ ` _ \  | |    / _ \| '_ \/ __| __| '__| | | |/ __/ _` / __|/ _` | ==============
=============== | |  | | | |  __/ | | | | |_| | | | | | | | \__/\ (_) | | | \__ \ |_| |  | |_| | (_| (_| \__ \ (_| | ==============
=============== \_|  |_/_|_|\___|_| |_|_|\__,_|_| |_| |_|  \____/\___/|_| |_|___/\__|_|   \__,_|\___\__,_|___/\__,_| ==============
===================================================================================================================================
===================================================================================================================================
*/

moment.locale('es')

var app = {

    BaseUrl: 'http://192.168.1.125:1338/',
     // BaseUrl: 'http://192.168.1.71:1338/',
    // Title: 'Milenium Construcasa'

    _email: '',
    Timer: null,
    Loading: false,
    SessionData: null,

    Sammy: null,
    Resident: {
        Timer: null,
        Data: null,
        EventsModel: null,
    },
    Colors: {
        Primary: '#4a8bc2',
        Danger: '#b55151',
        Info: '#74a6d0',
        Success: '#4CAF50',
        Warning: '#ab7a4b',
        Inverse: '#45484d',
    },

    UnreadNotificationCount: 0,
    PageNumber: 0,

    Device: {
        DeviceToken: '',
        Model: '',
        Platform: '',
        OSVersion: '',
        PushToken: ''
    },

    Role: '',

    Counter: 0,

    Reminders: {},

    CountUp: '',
    CountUpOptions: {
        useEasing : true, 
        useGrouping : true, 
        separator : ',', 
        decimal : '.', 
        prefix : '$', 
        suffix : '' 
    },

    Images:{
        formData: new FormData(),
        data: new FormDataUnsafe(),
        Counter:0
    },

    Payments:{
        Collected:{}
    },

    returnMessage: ''
}

app.connect = function () {
    alert(app.BaseUrl)

    $('#app-container').html(app.Reset)

    var sessionPingRequest = $.ajax({
        url: app.BaseUrl + 'api/session-ping',
        type: 'GET'
    })

    sessionPingRequest.done(function (response) {
        app.Role = response.Role

        if (!response.Session) {

            var hash = window.location.hash
            if (hash && hash.length >= 16 && hash.substring(0, 15) == '#/reset-password') {
                
            }
            else {
                window.location = '#/login'
            }

            app.Sammy.run()
            return
        }

        $('#navbar').removeClass('hidden')

        if (app.ResidentId) {
            app.Login(response.Role)
        } else {
            window.location = '#/selecciona-residente'
            app.Sammy.run()
        }
        // app.Login(response.Role)
    })
    
    sessionPingRequest.fail(function (response, textStatus, error) {
        
        alert(textStatus)

        for (var item in error){
            alert(item + ': ' + error[item])
        }


        var seconds = 10

        var time = moment().add(seconds, 'seconds').format('YYYY/MM/DD HH:mm:ss')

        var errorBody = 
        '<div class="row" style="margin: 0px; height: 100%;">' + 
            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">' +
                '<div class="center-block" style="width: 50%;">' +
                    '<img src="assets/img/logo3.png" class="img-responsive center-block">' +
                '</div>' +
                '<h3 class="centered-text">Error de conexión</h3>' + 
                '<h4 id="timer" class="centered-text">Reconectando en ' + seconds + '...</h4>' +
            '</div>' +
        '</div>'

        var container = $('#app-container')
        container.html(errorBody)

        var timer = container.find('#timer')

        var interval = setInterval(function () {
            
            if (seconds > 0) {

                timer.html('Reconectando en ' + seconds + '...')
                seconds = seconds - 1

            } else {

                timer.html('Reconectando...')
                
                clearInterval(interval)
                interval = null
                
                setTimeout(function () {
                    
                    app.connect()
                }, 1000)
            }

        }, 1000)
    })

    sessionPingRequest.always(function () { app.Loading = false })
}

app.Hammerify = function (options) {

    options = options || {}

    if (!options.id) return false

    var el = document.getElementById(options.id)

    if (!el)  { console.log('hammer element not found: ' + options.id); return false }

    var mc = new Hammer(el, { touchAction: 'none' })

    mc.get('swipe').set({
        direction: Hammer.DIRECTION_ALL,
        threshold: 20,
        velocity: 0.65,
    })

    mc.on('swipeleft swiperight', function(event) {

        if (options.always && $.isFunction(options.always)) options.always(event)
        
        if (event.type == 'swipeleft') {
            if (options.left && $.isFunction(options.left)) options.left(event)
        }
        if (event.type == 'swiperight') {
            if (options.right && $.isFunction(options.right)) options.right(event)
        }
    })
}

app.Start = function () {
    app.Loading = true
    app.RegisterRoutes()
    app.ResidentId = localStorage.getItem('ID')
    
    app.RegisterPostMessage()
    
    //$('#brand').text('Milenium Construcasa')
    //var document = $(document)
    //$('body').css('background-size', document.width() + 'px ' + document.height() + 'px');

    app.Reset = ""
    app.Reset += "<div class='div-center-icon'>"
    app.Reset += "    <div><i class='fa fa-cog fa-spin fa-5x'></i></div>"
    app.Reset += "    <div>Cargando...</div>"
    app.Reset += "</div>"

    app.connect()
}


/*
=====================================================================================================
========================================   __ _ _ __  _ __   ========================================
========================================  / _` | '_ \| '_ \  ========================================
======================================== | (_| | |_) | |_) | ========================================
========================================  \__,_| .__/| .__/  ========================================
========================================       | |   | |     ========================================
========================================       |_|   |_|     ========================================
=====================================================================================================
*/

// Core functions
app.RegisterRoutes = function () {

    app.Sammy = $.sammy('#app-container', function () {

        this.get('/', function (context) { window.location = '#/panel' })
        this.get('#/?', function (context) { window.location = '#/panel' })

        this.get('#/area-comun/:id/?', function (context) { app.Resident.RenderEventArea(context.params['id']) })

        this.get('#/checkout/?', function (context) { app.Resident.RenderCheckout() })

        this.get('#/comite/?', function (context) { app.Resident.RenderBoardMembers() })

        this.get('#/contacto/?', function (context) { app.Resident.RenderContact() })

        this.get('#/eventos/?', function (context) { app.Resident.RenderEvents() })
        this.get('#/evento/:id/?', function (context) { app.Resident.RenderEvent(context.params['id']) })

        this.get('#/garantias/?', function (context) { app.Resident.RenderWarranties() })
        this.get('#/garantia/:id/?', function (context) { app.Resident.RenderWarranty(context.params['id']) })
        this.get('#/garantia/:id/solicitud/?', app.Resident.RenderClaimPostForm)
        this.get('#/solicitudes-de-garantia/?', app.Resident.RenderClaims)
        this.get('#/solicitudes-de-garantia/:id/?', app.Resident.RenderClaim)


        this.get('#/gastos/?', function (context) { app.Resident.RenderOutcomes() })
        
        this.get('#/invitar/?', function (context) { app.Resident.RenderInviteCohabitant() })

        this.get('#/livecontact/?', function (context) { app.LiveContact() })

        this.get('#/login/?', function (context) { app.ShowLoginForm() })
        this.get('#/logout/?', function (context) { app.Logout() })

        this.get('#/mensajes/:id/?', function (context) { app.Resident.RenderMessage(context.params['id']) })

        this.get('#/noticias/?', function (context) { app.Resident.RenderNews() })
        this.get('#/noticia/:id/?', function (context) { app.Resident.RenderNew(context.params['id']) })

        this.get('#/notifications/?', function (context) { app.Resident.RenderNotifications() })

        this.get('#/pagos/?', function (context) { app.Resident.RenderPayments('pending') })
        this.get('#/pagos/:view/?', function (context) { app.Resident.RenderPayments(context.params['view']) })

        this.get('#/panel/?', function (context) { app.Resident.RenderPanel() })

        this.get('#/perfil/?', function (context) { app.Resident.RenderProfile() })

        this.get('#/promotion-checkout/?', function (context) { app.Resident.RenderPromotionCheckout() })

        this.get('#/recordatorios/?', function (context) { app.Reminders.RenderReminders() })
        this.get('#/recordatorio/:id/?', function (context) { app.Reminders.ViewReminder(context.params['id']) })
        this.get('#/recordatorios/crear/?', function (context) { app.Reminders.CreateReminder() })
        this.get('#/recordatorios/editar/:id/?', function (context) { app.Reminders.EditReminder(context.params['id']) })

        this.get('#/reglamentos/?', function (context) { app.Resident.RenderRegulations() })
        this.get('#/reglamento/:id/?', function (context) { app.Resident.RenderRegulation(context.params['id']) })

        this.get('#/reservaciones/?', function (context) { app.Resident.RenderReservations() })
        this.get('#/reservacion/:id/?', function (context) { app.Resident.RenderReservation(context.params['id']) })

        
        this.get('#/respuesta', function (context) { app.Resident.RenderResponse(context.params['OrderId'], context.params['Token']) })

        this.get('#/selecciona-residente/?', function (context) { app.View_Residents() })

        this.get('#/settings/?', function (context) { app.Resident.RenderSettings() })

        this.get('#/ticket/:id/?', function (context) { app.Resident.RenderTicket({ View: 'RenderTicket', Id: context.params['id'] }) })

        this.get('#/password-reset/?', function (context) { app.RenderPasswordResetRequest() })
        this.get('#/reset-password/:token/?', function (context) { app.RenderResetPasswordForm(context.params['token']) })
        this.get('#/password-change/?', function (context) { app.Resident.RenderPasswordChange() })

        this.notFound = function (context) { if (context !== 'post') { window.location = '#/panel' } }

        this.swap = function (content, callback) {
            if (window.location.hash != '#/panel' && window.location.hash != '#/notifications' && window.location.hash != '#/settings'){
                $('#tabs').addClass('hidden')
            }else{
                $('#tabs').removeClass('hidden')
            }

            var context = this

            context.$element().fadeOut('150', function () {
                context.$element().html(content).fadeIn('250', function () {

                    if (callback) {
                        callback.apply()
                    }
                })
            })
        }

        this._checkFormSubmission = function (form) {
            return (false)
        }
    })
}

app.ShowBack = function(hash, message){
    
    var backBtn = $('#back')
    
    backBtn.data('hash', hash).removeClass('hiddenimportant')
    
    app.returnMessage = message || ''
}

app.hideTabs = function(){
    $('#tabs').addClass('hidden')
}

app._truncateText = function (text, desiredLength) {
    var output = ''
    if (!text) return output
    if (text.length < desiredLength) return text
    return text.substring(0, desiredLength) + '...'
}

app._getImageUploadObject = function (formData, progressDOM) {

    return {
        url: app.BaseUrl + 'api/images/mobile-upload',
        type: 'POST',
        mimeType: 'multipart/form-data',
        processData: false,
        contentType: false,
        data: formData,
        xhr: function () {

            var request = $.ajaxSettings.xhr()

            progressDOM.css('display', 'inherit')

            if (!request.upload) return request

            request.upload.onprogress = function (event) {
                var percentage = Math.floor((event.loaded / event.total) * 100)
                progressDOM.html('<h4 class="centered-text">' + percentage + '%</h4>')
            }

            request.upload.onload = function (event) {
                console.log('image upload complete')
            }

            return request
        },
    }
}

app.Login = function (role) {

    if (role != 0) { app.ShowAlert('Solo residentes.'); window.location = '#/logout'; return }
    
    $.getJSON(app.BaseUrl + 'api/resident-data/', function (sessionData) {

        if (sessionData == null) { window.location = '#/logout'; return }

        app.ResidentID = sessionData.Resident.ResidentId
        app.UserName = sessionData.Resident.Name
        app.FirstLastName = sessionData.Resident.FirstLastName
        app.SecondLastName = sessionData.Resident.SecondLastName
        app.FullName = app.UserName + ' ' + app.FirstLastName + ' ' + app.SecondLastName
        app.UserEmail = sessionData.Resident.Email
        app.LocalPhone = sessionData.Resident.LocalPhone
        app.MobilePhone = sessionData.Resident.MobilePhone
        
        app.SettlementName = sessionData.Settlement.Name
        app.SettlementAlias = sessionData.Settlement.Alias
        app.SettlementZip = sessionData.Settlement.ZipCode
        
        app.Lot = sessionData.Resident.Lot
        app.Lot.Model = app.Lot.Model.Name
        app.Lot.SaleDate = app.Lot.SaleDate
        app.Lot.Street = app.Lot.Street.Name
        app.Lot.HouseNo = app.Lot.Number

        app.SessionData = sessionData

        var hash = window.location.hash

        if (!hash || hash == '#' || hash == '#/' || hash == '#/login' || hash == '#/login/') {
            window.location = '#/panel'
        }
        
        app.Sammy.run()

    }).always(function () {
        app.Loading = false
    })
}

app.Logout = function () {
    $.ajax({
        url: app.BaseUrl + 'api/logout',
        type: 'POST',
        contentType: 'application/json',
        statusCode: {
            200: function (response) {
                localStorage.removeItem('LotLength')
                localStorage.removeItem('session-token')
                localStorage.removeItem('ID')

                app._residentCount = 0
                app.SessionData = null
                app.ResidentId = null
                window.location = '#/login'
            }
        }
    })
}

app.ShowLoginForm = function () {

    if(app.SessionData != null){
        window.location = '#/panel'
        return
    }

    var body = $('body')
    var nav = $('#navbar')
    var tabs = $('#tabs')
    
    body.css('padding-top', '0')
    nav.addClass('hidden')
    tabs.addClass('hidden')

    app.Loading = false

    var lastEmail = localStorage.getItem('_email')

    var html =
    '<div class="row whitebg" style="margin: 0; padding-top: 53px; height: inherit">' +
        '<div class="center-block" style="width:50%; padding-bottom: 53px;">' +
            '<img src="assets/img/logo3.png" class="img-responsive center-block">' +
        '</div> ' +
        '<div class="center-block" style="width:85%;" align="center">' +
            '<form method="post" id="login-form">' +
                '<div class="form-group">' +
                    '<div class="input-group">' +
                        '<div class="input-group-addon"><i class="fa fa-user"></i></div>' +
                        '<input value="' + (lastEmail || '') + '" class="form-control fontlg" type="text" name="Email" type="email" id="Email" placeholder="Email" '+
                            'style="height: 40px;" data-val="true" data-val-email="Formato incorrecto." data-val-required="Email es requerido.">' +
                    '</div>' +
                    '<div class="form-error"><span class="field-validation-valid" data-valmsg-for="Email" data-valmsg-replace="true"></span></div>' +
                '</div>' +
                '<div class="form-group">' +
                    '<div class="input-group">' +
                        '<div class="input-group-addon"><i class="fa fa-lock"></i></div>' +
                        '<input class="form-control fontlg" type="password" id="Password" name="Password" placeholder="Contraseña" style="height: 40px;" '+
                            'data-val="true" data-val-required="Contraseña es requerida." data-val-length="Mínimo 6 caractéres" data-val-length-min="6">' +
                    '</div>' +
                    '<div class="form-error"><span class="field-validation-valid" data-valmsg-for="Password" data-valmsg-replace="true"></span></div>' +
                '</div>' +
                '<div class="form-group">' +
                    '<button type="submit" data-loading-text="Cargando..." class="btn btn-lg btn-primary btn-block">Entrar</button>' +
                '</div>' +
            '</form>' +
            '<div class="center-block text-center" style="padding-top: 25px">' +
                '<p><a href="#/password-reset">Olvidé mi contraseña</a></p>' +
                '<p><a href="#/livecontact">Soy residente y no tengo acceso</a></p>' +
            '</div>' +
        '</div>' +
    '</div>'

    app.Sammy.swap(html, function () {
        
        var form = $('form')
        var btn = form.find('button[type="submit"]')
        var email = form.find('input#Email')
        var password = form.find('input#Password')

        $.validator.unobtrusive.parse(form)

        var validator = form.data('validator')

        form.on('submit', function (event) {

            event.preventDefault();

            if (app.Loading) { return false; } 

            if (!form.valid()) { return false; }

            btn.button('loading');
            app.Loading = true;

            var data = form.serializeObject()

            var loginRequest = $.ajax({
                url: app.BaseUrl + 'api/login',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data)
            })

            loginRequest.done(function (response) {
                
                nav.removeClass('hidden')
                body.css('padding-top', '53px')
                
                app.Role = response.Role
                app.ResidentId = localStorage.getItem('ID')

                localStorage.setItem('session-token', response.Token)
                localStorage.setItem('_email', data.Email)

                app.Sammy.swap(app.Reset, function () {
                    
                    if (app.Device.Platform !== '') {

                        $.ajax({
                            url: app.BaseUrl + 'api/resident/mobile-devices/register',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(app.Device),
                        })

                        if (app.ResidentId == null) {
                            window.location = '#/selecciona-residente';
                        } else {
                            app.Login(response.Role);
                        }
                    }
                })
            })

            loginRequest.fail(function (response) {
                btn.button('reset');

                email.select();
                password.val('');

                var modelState = app.parseModelState(JSON.parse(response.responseText).ModelState)
                validator.showErrors(modelState.errors)
            })

            loginRequest.always(function () {
                app.Loading = false
            })

            return false;
        })
    })
}

app.LiveContact = function (){
    $('#tabs').addClass('hidden')

    var html="";
        html += "<div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='margin-top:10px'>";
        html += "    <div class=\"panel panel-default\">";
        html += "        <div class=\"panel-body\">";
        html += "            <h5><strong>¿Problemas con el acceso?<\/strong><\/h5>";
        html += "            <p>Si usted es el propietario de la casa y no puede acceder";
        html += "                a la aplicación, le recomendamos utilizar nuestro chat en línea";
        html += "                para pedir ayuda al administrador.<\/p>";
        html += "            <p>Le pedimos ser lo más preciso posible con la información solicitada para ";
        html += "                agilizar el proceso.<\/p>";
        html += "            <p>Le recordamos que nuestro horario de atención es de <strong>8:00am - 3:00pm<\/strong>.<\/p>";
        html += "            <p>Si el administrador no se encuentra en línea, usted puede de igual manera dejar un mensaje ";
        html += "                y el administrador en breve se comunicará con usted.<\/p>";
        html += "        <\/div>";
        html += "    <\/div>";
        html += "<\/div>";

    app.Sammy.swap(html, function () {
        app.DownloadChatScript()
    })
}

app.DownloadChatScript = function () {
    var script = '' +
        '<script type="text/javascript">' +
            'window.$zopim||(function(d,s){var z=$zopim=function(c){z._.push(c)},$=z.s=' +
            'd.createElement(s),e=d.getElementsByTagName(s)[0];z.set=function(o){z.set.' +
            '_.push(o)};z._=[];z.set._=[];$.async=!0;$.setAttribute("charset","utf-8");' +
            '$.src="http://v2.zopim.com/?2uN2oqu5E99orVB3FSe3RZmp6LSXXyer";z.t=+new Date;$.' +
            'type="text/javascript";e.parentNode.insertBefore($,e)})(document,"script");' +
        '</script>'
    // var script="";
    //     script += "<script type=\"text\/javascript\">";
    //     script += "window.$zopim || (function(d, s) {";
    //     script += "    var z = $zopim = function(c) {";
    //     script += "            z._.push(c)";
    //     script += "        },";
    //     script += "        $ = z.s =";
    //     script += "        d.createElement(s),";
    //     script += "        e = d.getElementsByTagName(s)[0];";
    //     script += "    z.set = function(o) {";
    //     script += "        z.set.";
    //     script += "        _.push(o)";
    //     script += "    };";
    //     script += "    z._ = [];";
    //     script += "    z.set._ = [];";
    //     script += "    $.async = !0;";
    //     script += "    $.setAttribute(\"charset\", \"utf-8\");";
    //     script += "    $.src = \"\/\/v2.zopim.com\/?2uN2oqu5E99orVB3FSe3RZmp6LSXXyer\";";
    //     script += "    z.t = +new Date;";
    //     script += "    $.";
    //     script += "    type = \"text\/javascript\";";
    //     script += "    e.parentNode.insertBefore($, e)";
    //     script += "})(document, \"script\");";
    //     script += "<\/script>";
   $('body').append(script)
}

app.GetInputRegex = function () {
    //return '^[a-zA-Z0-9/?¿ áéíóúÁÉÍÓÚñÑ_.,;)(@-]*$';
    return '^[áéíóúÁÉÍÓÚñÑa-zA-Z0-9/?¿!¡ _#$%=\^*&.,;:)(@+-]*$'
}

app.PostMessageHandler = function (event) {

   if (!event || !event.data || !event.type) return
   
   switch (event.data.type) {
       case 'height': 
        $('#ezpendo-connecting').remove()
        $('.iframe-ezpendo').height(event.data.height); break;
       case 'payment-ok':
           window.location = '#/respuesta?Token=' + event.data.token + '&OrderId=' + event.data.orderid
   } 
}

app.RenderPasswordResetRequest = function () {

    if (app.SessionData) { window.location = '#/panel'; return; }

    app.UpdateTitle('Recuperación de contraseña', 'fa fa-barcode')

    app.UpdateBreadCrumbs([
        { Url: '#/password-reset', Text: 'Recuperación de contraseña' },
    ])

    $('.side-menu li').removeClass('active')

    app.Sammy.swap(app.Reset)

    var html = '' +
    '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">' +
        '<div id="password-bubble">' +
            '<form method="POST" id="password-reset-request-form">' +
                '<div class="validation-list-container"></div>' +
                '<div class="row">' +
                    '<div class="col-md-6">' +
                        '<div class="widget">' +
                            '<div class="widget-body">' +
                                '<div class="form-group">' +
                                    '<label for="Email">Email</label>' +
                                    '<input type="text" class="form-control" placeholder="Introduce tu email" Name="Email" id="Email" data-val-required="Email es requerido." data-val="true" data-val-email="Formato incorrecto.">' +
                                    '<div class="form-error"><span data-valmsg-replace="true" data-valmsg-for="Email" class="field-validation-valid"></span></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="row">' +
                    '<div class="col-xs-6 col-sm-6">' +
                        '<button type="submit" data-loading-text="<i></i> Cargando..." class="btn btn-icon btn-block btn-success glyphicons circle_ok"><i></i>Enviar petición</button>' +
                    '</div>' +
                    '<div class="col-xs-6 col-sm-6">' +
                        '<a href="#/login" class="btn btn-icon btn-block btn-default glyphicons circle_remove"><i></i> Cancelar</a>' +
                    '</div>' +
                '</div>' +
            '</form>' +
        '</div>'
    '</div>'

    app.Sammy.swap(html, function () {
        var form = $('#password-reset-request-form')
        form.removeData('validator')
        form.removeData('unobtrusiveValidation')
        $.validator.unobtrusive.parse(form)
        $("#Email").select()
        app.RegisterPasswordEvents()
    })
}

app.RenderResetPasswordForm = function (token) {

    if (app.SessionData) { window.location = '#/panel'; return; }

    app.UpdateTitle('Cambio de contraseña', 'fa fa-barcode')

    app.UpdateBreadCrumbs([
        { Url: '#/password-reset/' + token, Text: 'Cambio de contraseña' },
    ])

    $('.side-menu li').removeClass('active')

    app.Sammy.swap(app.Reset)

    var html = app.GetPasswordResetFormHtml('password-reset-form')

    app.Sammy.swap('<div id="password-bubble">' + html + '</div>', function () {
        var form = $('#password-reset-form')
        form.removeData('validator')
        form.removeData('unobtrusiveValidation')
        $.validator.unobtrusive.parse(form)
        $('#hidden_Token').val(token)
        $('#NewPassword').select()
        app.RegisterPasswordEvents()
    })
}

app.GetPasswordResetFormHtml = function (id) {
    return '' +
        '<form method="POST" id="' + id + '">' +
            '<div class="validation-list-container"></div>' +
            '<div class="row">' +
                '<div class="col-md-6">' +
                    '<div class="widget">' +
                        '<div class="widget-body">' +
                            '<div class="form-group">' +
                                '<label for="NewPassword">Nueva contraseña</label>' +
                                '<input type="password" class="form-control" placeholder="Nueva contraseña" name="NewPassword" id="NewPassword" data-val-required="Nueva contraseña es requerida." data-val="true" >' +
                                '<div class="form-error"><span data-valmsg-replace="true" data-valmsg-for="NewPassword" class="field-validation-valid"></span></div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<label for="ConfirmNewPassword">Confirmar nueva contraseña</label>' +
                                '<input type="password" class="form-control" placeholder="Confirmar nueva contraseña" name="ConfirmNewPassword" id="ConfirmNewPassword" data-val="true" data-val-equalto-other="NewPassword" data-val-equalto="Las contraseñas no coinciden.">' +
                                '<div class="form-error"><span data-valmsg-replace="true" data-valmsg-for="ConfirmNewPassword" class="field-validation-valid"></span></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="col-md-3">' +
                    '<button type="submit" data-loading-text="<i></i> Cargando..." class="btn btn-icon btn-block btn-success glyphicons circle_ok"><i></i>Cambiar contraseña</button>' +
                '</div>' +
                '<div class="col-md-2">' +
                    '<a href="#/login" class="btn btn-icon btn-block btn-default glyphicons circle_remove"><i></i> Cancelar</a>' +
                '</div>' +
            '</div>' +
            '<input type="hidden" id="hidden_Token" name="Token" />' +
        '</form>'
}

app.RegisterPasswordEvents = function () {
    $('#password-bubble').on('submit', '#password-reset-request-form', function (event) {

        event.preventDefault();
        if (app.Loading) { return false; } app.Loading = true;

        var form = $(this)
        form.removeData('validator')
        form.removeData('unobtrusiveValidation')

        var btn = $('button[type="submit"]', form)
        btn.button('loading')

        $.validator.unobtrusive.parse(form)

        var validator = form.validate()

        $.ajax({
            url: app.BaseUrl + 'api/request-password-reset-token',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify($(this).serializeObject()),
            statusCode: {
                200: function (response) {
                    app.Sammy.swap('<h2>Se te ha enviado un email de recuperación de contraseña a ' + $('#Email').val() + '</h2>')
                },
                400: function (response) {
                    btn.button('reset');
                    $('#Email').select();
                    app.ShowErrors(JSON.parse(response.responseText).ModelState);
                },
            }
        }).always(function () {
            app.Loading = false
            return false
        })
    })
    $('#password-bubble').on('submit', '#password-reset-form', function (event) {

        event.preventDefault();
        if (app.Loading) { return false; } app.Loading = true;

        var form = $(this)
        form.removeData('validator')
        form.removeData('unobtrusiveValidation')

        var btn = $('button[type="submit"]', form)
        btn.button('loading')

        $.validator.unobtrusive.parse(form)

        var validator = form.validate()

        $.ajax({
            url: app.BaseUrl + 'api/password-reset',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify($(this).serializeObject()),
            statusCode: {
                200: function (response) {
                    window.location = '#/login'
                },
                400: function (response) {
                    btn.button('reset')
                    app.ShowAlert(JSON.parse(response.responseText).ModelState)
                },
            }
        }).always(function () {
            app.Loading = false
            return false
        })
    })
    $('#password-bubble').on('submit', '#password-change-form', function (event) {

        event.preventDefault()
        if (app.Loading) { return false; } app.Loading = true

        var form = $(this)
        form.removeData('validator')
        form.removeData('unobtrusiveValidation')

        var btn = $('button[type="submit"]', form)
        btn.button('loading')

        $.validator.unobtrusive.parse(form)

        var validator = form.validate()

        $.ajax({
            url: app.BaseUrl + 'api/password-change',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify($(this).serializeObject()),
            statusCode: {
                200: function (response) {
                    app.Sammy.swap('<h2>Tu contraseña ha sido cambiada.</h2>', function () {
                        setTimeout(function () {
                            window.location = '#/perfil'
                        }, 1200)

                    })
                },
                400: function (response) {
                    btn.button('reset')
                    app.ShowErrors(JSON.parse(response.responseText).ModelState)
                },
            }
        }).always(function () {
            app.Loading = false
            return false
        })
    })
}

app.RegisterPostMessage = function () {
    if (window.addEventListener) { //ECMASCRIPT
        window.addEventListener("message", app.PostMessageHandler, false)
    }
    else {
        if (window.attachEvent) { //IE
            window.attachEvent("onmessage", app.PostMessageHandler)
        }
    }
}

app.View_Residents = function () {
    // $('#navbar').removeClass('hidden')
    $('#tabs').addClass('hidden')
    app.Sammy.swap(app.Reset)

    $.ajax({
        url: app.BaseUrl + 'api/my-residents',
        type: 'GET',
        statusCode: {
            200: function (response) {
                localStorage.setItem('LotLength', response.length) 
                if (response.length == 1) {
                    app.ResidentId = response[0].ResidentId
                    localStorage.setItem('ID', app.ResidentId)
                    app.Login(app.Role)
                    window.location = '#/panel'
                    return
                }

                var html = ''
                $.each(response, function (i, obj) {
                    // html += "<div class=\" col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='padding-top:10px; padding-bottom:10px'>";
                    html += "    <div class=\"resident-div col-xs-6 col-sm-6 col-md-4 col-lg-3\" data-id='" + obj.ResidentId + "'>";
                    html += "        <div class=\"thumbnail\">";
                    html += "            <img src='" + app.BaseUrl + "/content/images/uploads/" + obj.ImageCode + "'>";
                    html += "            <div class=\"caption\" align='middle'>";
                    html += "                <p>" + obj.Address + "<\/p>";
                    html += "            <\/div>";
                    html += "        <\/div>";
                    html += "    <\/div>";
                    // html += "<\/div>";
                })

                app.Sammy.swap('<div class="row" id="resident-container"><div class=\" col-xs-12 col-sm-12 col-md-12 col-lg-12\" style="padding-top:10px; padding-bottom:10px">' + html + '</div></div>', function () {

                    $('#resident-container').on('click', '.resident-div', function () {
                        app.ResidentId = $(this).data('id')
                        localStorage.setItem('ID', app.ResidentId)
                        app.Login(app.Role)
                        window.location = '#/panel'
                    })
                })
            },
        }
    })
}

// Alerts
app.ShowAlert = function (message) {
    navigator.notification.alert(
        message,        // message
        function(){}, // callback
        'eMilenium',          // title
        'OK'          // buttonName
    )
}

app.showConfirm = function (message, buttons, callback){
    return navigator.notification.confirm(
        message, // message
        callback,            // callback to invoke with index of button pressed
        'eMilenium',           // title
        buttons     // buttonLabels
    )
}
app.parseModelState = function (modelState) {
    var errors = {}
    var list = []

    var keys = Object.keys(modelState)

    $.each(keys, function (index, key) {
        var value = modelState[key]
        key = key.replace('dto.', '')

        if (key == '')
            list.push(value)
        else
            errors[key] = value
    })

    return {
        errors: errors,
        list: list
    }
}
app.ShowErrors = function (modelState) {
    var list = []

    $.each(modelState, function (key, value) {
        list.push(value)
    })

    if (list.length > 0) {
        var buffer = ''
        for (var i = 0; i < list.length; i++){
            if (i == list.length-1){
                buffer += list[i]
            }else{
                buffer += list[i] + '\n'
            }
        }

        navigator.notification.alert(
            buffer,       // message
            function(){}, // callback
            'eMilenium',  // title
            'OK'          // buttonName
        )        

    }
}

$.fn.extend({
    firstToUpper2: function () {
        var input = $(this)
        var data = input.val().split(' ')
        var output = ''
        if (data.length > 0 && data[0].length > 1) {
            output += data[0].substr(0, 1).toUpperCase() + data[0].substr(1) + ' '
            for (var i = 1; i < data.length; i++) output += data[i] + ' '
            input.val($.trim(output))
        }
    }
})

$.fn.easyPieChart = function(options) {
    return this.each(function() {
        var instanceOptions;

        if (!$.data(this, 'easyPieChart')) {
            instanceOptions = $.extend({}, options, $(this).data());
            $.data(this, 'easyPieChart', new EasyPieChart(this, instanceOptions));
        }
    });
};

$.fn.serializeObject = function () {
    var o = {}
    var a = this.serializeArray()
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]]
            }
            o[this.name].push(this.value || '')
        } else {
            o[this.name] = this.value || ''
        }
    })
    return o
}

String.prototype.firstToUpper = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.removeMarkup = function() {
    return this.replace(/<(?:.|\n)*?>/gm, '')
}

function FormDataUnsafe() {
    this.dict = {};
};

FormDataUnsafe.prototype.append = function(key, value) {
    this.dict[key] = value;
};

FormDataUnsafe.prototype.contains = function(key) {
    return this.dict.hasOwnProperty(key);
};

FormDataUnsafe.prototype.getValue = function(key) {
    return this.dict[key];
};

FormDataUnsafe.prototype.valueOf = function() {
    var fd = new FormData();
    for(var key in this.dict) {
        if (this.dict.hasOwnProperty(key))
            fd.append(key, this.dict[key]);
    }
    
    return fd;
};

FormDataUnsafe.prototype.safe = function() {
    return this.valueOf();
};

/*
======================================================================================================
======================================================================================================
============================== ______          _     _            _     ============================== 
============================== | ___ \        (_)   | |          | |    ============================== 
============================== | |_/ /___  ___ _  __| | ___ _ __ | |_   ============================== 
============================== |    // _ \/ __| |/ _` |/ _ \ '_ \| __|  ============================== 
============================== | |\ \  __/\__ \ | (_| |  __/ | | | |_   ============================== 
============================== \_| \_\___||___/_|\__,_|\___|_| |_|\__|  ==============================
======================================================================================================
======================================================================================================
*/

// Panel module
app.Resident.RenderPanel = function () {
    $('#brand').text('Milenium Construcasa')
    // $('#navbar').removeClass('hidden')
    $('#tabs').removeClass('hidden')
    $('#back').addClass('hiddenimportant')
    $('.active').removeClass('active')
    $('#tab1').addClass('active');

    app.Sammy.swap(app.Reset)
    
    app.Resident.NotificationCount()

    var html="";
    html += "<div class=\"container-fluid content whitebg\" id='panel' align=\"center\" style='height:inherit; padding-top: 40px;'>";
    html += "           <div class=\"col-xs-12\" style='height:inherit'>";
    html += "               <div class='row' style='height:33.3%;'>";
    html += "                   <div class='col-xs-4' style='height:100%'>";
    html += "                       <a class='a-nostyle' href='#\/pagos\/pending'>";
    html += "                           <div style='height:100%; display:table'>";
    html += "                               <span id='span1' style='vertical-align:middle; display:table-cell'>";
    html += "                                   <div class='home-icon home-icon-pagos img-circle'>";
    html += "                                       <span class='span-home fontxxxlg'>";
    html += "                                           <i class=\"fa fa-credit-card fa-lg\"><\/i>";
    html += "                                       <\/span>";
    html += "                                   <\/div>";
    html += "                                   <span class='home-title fontmd'>Pagos</span>";
    html += "                               <\/span>";
    html += "                           <\/div>";
    html += "                       <\/a>";
    html += "                   <\/div>";
    html += "                   <div class='col-xs-4' style='height:100%'>";
    html += "                       <a class='a-nostyle' href='#\/eventos'>";
    html += "                           <div style='height:100%; display:table'>";
    html += "                               <span style='vertical-align:middle; display:table-cell'>";
    html += "                                   <div class='home-icon home-icon-eventos img-circle'>";
    html += "                                       <span class='span-home fontxxxlg'>";
    html += "                                           <i class=\"fa fa-ticket fa-lg\"><\/i>";
    html += "                                       <\/span>";
    html += "                                   <\/div>";
    html += "                                   <span class='home-title fontmd'>Eventos</span>";
    html += "                               <\/span>";
    html += "                           <\/div>";
    html += "                       <\/a>";
    html += "                   <\/div>";
    html += "                   <div class='col-xs-4' style='height:100%'>";
    html += "                       <a class='a-nostyle' href='#\/noticias'>";
    html += "                           <div style='height:100%; display:table'>";
    html += "                               <span style='vertical-align:middle; display:table-cell'>";
    html += "                                   <div class='home-icon home-icon-noticias img-circle'>";
    html += "                                       <span class='span-home fontxxxlg'>";
    html += "                                           <i class=\"fa fa-newspaper-o fa-lg\"><\/i>";
    html += "                                       <\/span>";
    html += "                                   <\/div>";
    html += "                                   <span class='home-title fontmd'>Noticias</span>";
    html += "                               <\/span>";
    html += "                           <\/div>";
    html += "                       <\/a>";
    html += "                   <\/div>";
    html += "               <\/div>";
    html += "               <div class='row' style='height:33.3%'>";
    html += "                   <div class='col-xs-4' style='height:100%'>";
    html += "                       <a class='a-nostyle' href='#\/garantias'>";
    html += "                           <div style='height:100%; display:table'>";
    html += "                               <span style='vertical-align:middle; display:table-cell'>";
    html += "                                   <div class='home-icon home-icon-garantias img-circle'>";
    html += "                                       <span class='span-home fontxxxlg'>";
    html += "                                           <i class=\"fa fa-certificate fa-lg\"><\/i>";
    html += "                                       <\/span>";
    html += "                                   <\/div>";
    html += "                                   <span class='home-title fontmd'>Garantías</span>";
    html += "                               <\/span>";
    html += "                           <\/div>";
    html += "                       <\/a>";
    html += "                   <\/div>";
    html += "                   <div class='col-xs-4' style='height:100%'>";
    html += "                       <a class='a-nostyle' href='#/reservaciones'>";
    html += "                           <div style='height:100%; display:table'>";
    html += "                               <span style='vertical-align:middle; display:table-cell'>";
    html += "                                   <div class='home-icon home-icon-reservas img-circle'>";
    html += "                                       <span class='span-home fontxxxlg'>";
    html += "                                           <i class='fa fa-picture-o fa-lg'></i>";
    html += "                                       <\/span>";
    html += "                                   <\/div>";
    html += "                                   <span class='home-title fontmd'>Áreas</span>";
    html += "                               <\/span>";
    html += "                           <\/div>";
    html += "                       <\/a>";
    html += "                   <\/div>";
    html += "                   <div class='col-xs-4' style='height:100%'>";
    html += "                       <a class='a-nostyle' href='#\/reglamentos'>";
    html += "                           <div style='height:100%; display:table'>";
    html += "                               <span style='vertical-align:middle; display:table-cell'>";
    html += "                                   <div class='home-icon home-icon-reglas img-circle'>";
    html += "                                       <span class='span-home fontxxxlg'>";
    html += "                                           <i class=\"fa fa-gavel fa-lg\"><\/i>";
    html += "                                       <\/span>";
    html += "                                   <\/div>";
    html += "                                   <span class='home-title fontmd'>Reglas</span>";
    html += "                               <\/span>";
    html += "                           <\/div>";
    html += "                       <\/a>";
    html += "                   <\/div>";
    html += "               <\/div>";
    html += "               <div class='row' style='height:33.3%'>";
    html += "                   <div class='col-xs-4' style='height:100%'>";
    html += "                       <a class='a-nostyle' href='#\/recordatorios'>";
    html += "                           <div style='height:100%; display:table'>";
    html += "                               <span style='vertical-align:middle; display:table-cell'>";
    html += "                                   <div class='home-icon home-icon-recordatorios img-circle'>";
    html += "                                       <span class='span-home fontxxxlg'>";
    html += "                                           <i class=\"fa fa-clock-o fa-lg\"><\/i>";
    html += "                                       <\/span>";
    html += "                                   <\/div>";
    html += "                                   <span class='home-title fontmd'>Recordatorios</span>";
    html += "                               <\/span>";
    html += "                           <\/div>";
    html += "                       <\/a>";
    html += "                   <\/div>";
    html += "                   <div class='col-xs-4' style='height:100%'>";
    html += "                       <a class='a-nostyle' href='#\/comite'>";
    html += "                           <div style='height:100%; display:table'>";
    html += "                               <span style='vertical-align:middle; display:table-cell'>";
    html += "                                   <div class='home-icon home-icon-comite img-circle'>";
    html += "                                       <span class='span-home fontxxxlg'>";
    html += "                                           <i class=\"fa fa-sitemap fa-lg\"><\/i>";
    html += "                                       <\/span>";
    html += "                                   <\/div>";
    html += "                                   <span class='home-title fontmd'>Comité</span>";
    html += "                               <\/span>";
    html += "                           <\/div>";
    html += "                       <\/a>";
    html += "                   <\/div>";
    html += "                   <div class='col-xs-4' style='height:100%'>";
    html += "                       <a class='a-nostyle' href='#/gastos'>";
    html += "                           <div style='height:100%; display:table'>";
    html += "                               <span style='vertical-align:middle; display:table-cell'>";
    html += "                                   <div class='home-icon home-icon-encuestas img-circle'>";
    html += "                                       <span class='span-home fontxxxlg'>";
    html += "                                           <i class=\"fa fa-usd fa-lg\"><\/i>";
    html += "                                       <\/span>";
    html += "                                   <\/div>";
    html += "                                   <span class='home-title fontmd'>Gastos</span>";
    html += "                               <\/span>";
    html += "                           <\/div>";
    html += "                       <\/a>";
    html += "                   <\/div>";
    html += "               <\/div>";
    html += "           <\/div> ";
    html += "       <\/div><!-- content1 -->";

    app.Sammy.swap(html, function () {

        var panel = document.getElementById('panel')
        
        app.Hammerify({
            id: 'panel',
            always: function (event) { $('.tab-btn .active').removeClass('active') },
            left: function (event) { window.location = '#/notifications' },
            right: function (event) { window.location = '#/settings' }
        })
    })
}

// Notifications module
app.Resident.RenderNotifications = function () {
    $('#brand').text('Milenium Construcasa')
    // $('#navbar').removeClass('hidden')
    $('#tabs').removeClass('hidden')
    $('.active').removeClass('active')
    $('#tab2').addClass('active');
    $('#back').addClass('hiddenimportant')

    app.Sammy.swap(app.Reset)

    var html = ""
    var notifications = ""
    app.PageNumber = 1

    var GetNotifications = $.getJSON(app.BaseUrl + 'api/resident/notifications/last?pageNumber=' + app.PageNumber + '&pageSize=7')
    $.when(GetNotifications)
    .done(function () {
        notifications = app._getNotificationsHTML(GetNotifications.responseJSON.Items)
        
        if (GetNotifications.responseJSON.Items.length == 0){
            html = "<div class='not-found col-xs-12 col-sm-12 col-md-12 col-lg-12' id='notifications'>"
            html += "   <span class='span-vcenter'>"
            html += "       <p class='not-found-icon'><i class='fa fa-info-circle fa-5x'></i></p>"
            html += "       <p class='not-found-text fontlg'>Por el momento no tienes notificaciones.</p>"
            html += "   </span>"
            html += "</div>"
        }else{
            html += "<div class='container-fluid nopad-nomar notifications' id='notifications' >";
            html +=     notifications;
            html += "<\/div>";file:///C:/Users/e/Desktop/MileniumAPP/EmileniumAPP/www/index.html#/solicitudes-de-garantia/5

            if (GetNotifications.responseJSON.Items.length >= 7 ){
                html += "<div id='show-more-notifications' style='height:45px; background:white; width:100%; display:table; text-align:center'>"
                html += "   <span class='span-vcenter'>"
                html += "       <a class='a-nostyle' href='#'><strong>VER MÁS <i class='fa fa-angle-down fa-fw'></i></strong></a>"
                html += "   </span>"
                html += "</div>"
            }
        }

        app.Sammy.swap(html, function () {

            app.Hammerify({
                id: 'notifications',
                always: function (event) { $('.tab-btn .active').removeClass('active') },
                left: function (event) { window.location = '#/settings' },
                right: function (event) { window.location = '#/panel' }
            })
        })
    }) 
}

app._getNotificationsHTML = function (notifications) {
    var buffer = ''
    var notProps = {}
    $.each(notifications, function (i, obj) {
        notProps = app._getNotificationsProperties(obj.Type, obj.Id)

        buffer += "<a class='a-nostyle" + (obj.IsNew ? ' unread' : '')+ "' href='" + notProps.Hash + "' data-notification-id='" + obj.NotificationMembershipId + "'>";
        buffer += "     <div class='row not_row " + (obj.IsNew ? '' : 'not_row_r')+ "' style='margin:0'>";
        buffer += "        <div class='col-xs-12 col-sm-12 col-md-12 col-lg-12' style='height:inherit'>";
        buffer += "             <div class='col-xs-2 col-sm-2 col-md-1 col-lg-1 not-icon-div' style='padding-left: 0px;'>";
        buffer += "                 <span class='span-vcenter'>";
        buffer += "                     <div class='not-icon' style=''>";
        buffer += "                         <span class='span-not fontmd img-circle " + notProps.Bgcolor + "'> <!-- Add background color for example: .home-icon-pagos -->";
        buffer += "                             <i class=\"fa fa-lg " + notProps.Class + "\"><\/i> <!-- Add icon class for example: fa-credit-card -->";
        buffer += "                         <\/span>";
        buffer += "                     <\/div>";
        buffer += "                 <\/span>";
        buffer += "             <\/div>";
        buffer += "             <div class='not-content col-xs-10 col-sm-10 col-md-11 col-lg-11'>";
        buffer += "                 <span class='span-vcenter'>";
        // buffer += "                     <div class='row " + (obj.IsNew ? 'not-title' : 'not-title-r')+ "'>" + notProps.Title + "<\/div> <!-- Add notification type, example: Evento, Noticia, etc. -->"; //not-title-r
        buffer += "                     <div class='row not-title fontmd'>" + notProps.Title + "<\/div> <!-- Add notification type, example: Evento, Noticia, etc. -->"; //not-title-r
        buffer += "                     <div class=\"row not-body\">";
        buffer += "                                 " + obj.Message + "";
        buffer += "                     <\/div>";
        buffer += "                 <\/span>";
        buffer += "                 <div class='row not-date fontxs'>";
        buffer += "                     " + obj.Date + "";
        buffer += "                 <\/div>";
        buffer += "             <\/div>";
        buffer += "        <\/div>";
        buffer += "     <\/div>";
        buffer += "<\/a>";
    })

    return buffer
}

app._getNotificationsProperties = function (notificationType, id) {
    
    switch (notificationType) {
        case 00: return {
            Hash: '#/mensajes/' + id,
            Title: 'Mensaje del administrador',
            Bgcolor: 'home-icon-contacto',
            Class: 'fa-envelope',
        }

        case 01: return {
            Hash: '#/evento/' + id,
            Title: 'Evento creado',
            Bgcolor: 'home-icon-eventos',
            Class: 'fa-ticket',
        }

        case 02: return {
            Hash: '#/evento/' + id,
            Title: 'Evento actualizado' ,
            Bgcolor: 'home-icon-eventos',
            Class: 'fa-ticket',
        }

        case 11: return {
            Hash: '#/noticia/' + id,
            Title: 'Noticia nueva',
            Bgcolor: 'home-icon-noticias',
            Class: 'fa-newspaper-o',
        }

        case 12: return {
            Hash: '#/noticia/' + id,
            Title: 'Noticia actualizada',
            Bgcolor: 'home-icon-noticias',
            Class: 'fa-newspaper-o',
        }

        case 21: return {
            Hash: '#/reglamento/' + id,
            Title: 'Reglamento creado' ,
            Bgcolor: 'home-icon-reglas',
            Class: 'fa-gavel',
        }

        case 22: return {
            Hash: '#/reglamento/' + id,
            Title: 'Reglamento actualizado',
            Bgcolor: 'home-icon-reglas',
            Class: 'fa-gavel',
        }

        case 31: return {
            Hash: '#/notifications',
            Title : 'Nuevo residente' ,
            Bgcolor: 'home-icon-garantias',
            Class: 'fa-user-plus',
        }

        case 41: return {
            Hash: '#/pagos/collected',
            Title: 'Se ha realizado un pago',
            Bgcolor: 'home-icon-pagos',
            Class: 'fa-credit-card',
        }

        case 53: return {
            Hash: '#/recordatorio/' + id,
            Title: 'Recordatorios eMilenium' ,
            Bgcolor: 'home-icon-recordatorios',
            Class: 'fa-clock-o',
        }

        case 61: return {
            Hash: '#/solicitudes-de-garantia/' + id,
            Title: 'Solicitud aprobada' ,
            Bgcolor: 'home-icon-garantias',
            Class: 'fa-certificate',
        }
        case 62: return {
            Hash: '#/solicitudes-de-garantia/' + id,
            Title: 'Solicitud denegada' ,
            Bgcolor: 'home-icon-garantias',
            Class: 'fa-certificate',
        }
        case 63: return {
            Hash: '#/solicitudes-de-garantia/' + id,
            Title: 'Solicitud finalizada' ,
            Bgcolor: 'home-icon-garantias',
            Class: 'fa-certificate',
        }

        case 91: return {
            Hash: '#/pagos/pending',
            Title: 'Se aproxima la fecha límite de pago',
            Bgcolor: 'home-icon-pagos',
            Class: 'fa-credit-card',
        }

        case 92: return {
            Hash: '#/garantia/' + id,
            Title: 'Expiración de garantía',
            Bgcolor: 'home-icon-garantias',
            Class: 'fa-certificate',
        }

        case 93: return {
            Hash: '#/evento/' + id,
            Title: 'Evento proximo' ,
            Bgcolor: 'home-icon-eventos',
            Class: 'fa-ticket',
        }

        case 94: return {
            Hash: '#/pagos/pending',
            Title: 'Pago pendiente' ,
            Bgcolor: 'home-icon-pagos',
            Class: 'fa-credit-card',
        }
    }
}

app.Resident.AppendNotifications = function (){
    app.PageNumber++
    var notifications = ''
    var GetNotifications = $.getJSON(app.BaseUrl + 'api/resident/notifications/last?pageNumber=' + app.PageNumber + '&pageSize=7')
    $.when(GetNotifications)
    .done(function () {
        if (GetNotifications.responseJSON.Items.length > 0) {
            notifications = app._getNotificationsHTML(GetNotifications.responseJSON.Items)
            $('#notifications').append(notifications)
        }
        if (GetNotifications.responseJSON.Items.length < 7) {
            $('#show-more-notifications').hide()
        }            
    })
}

app._getNotificationsHash = function (type, id) {
    switch (type) {
        case 00: return '#/mensajes/' + id;
        case 01: return '#/evento/' + id;
        case 02: return '#/evento/' + id;
        case 11: return '#/noticia/' + id;
        case 12: return '#/noticia/' + id;
        case 21: return '#/reglamento/' + id;
        case 22: return '#/reglamento/' + id;
        case 31: return '#/settings';
        case 41: return '#/pagos/collected';
        case 53: return '#/recordatorio/' + id;
        case 91: return '#/pagos/pending';
        case 92: return '#/garantia/' + id;
        case 93: return '#/evento/' + id;
        case 94: return '#/pagos/pending';
        default: return '#/panel'
    }
}

app.Resident.NotificationCount = function () {
    $.getJSON(app.BaseUrl + 'api/resident/notifications/count', function (response) {
        if (response>0){
            $('#notification-icon').attr('data-count',response).addClass('badgeR');
        }else{
            $('#notification-icon').attr('data-count',response).removeClass('badgeR')
        }    
    })
}

// Outcomes module
app.Resident.RenderOutcomes = function (selectedDate){
    $('#brand').text('Gastos')
    var d = new Date()

    if (!selectedDate){
        selectedDate = d.toISOString().substring(0, 7).replace("-","/")
    }

    var currentMonth = d.toISOString().substring(0, 7)    

    app.Sammy.swap(app.Reset)

    var html = ''

    $.getJSON(app.BaseUrl + 'api/resident/outcomes/searchByMonth?Month=' + selectedDate , function (model) {
        // Outcomes
        var totalGastos = model.TotalOutcomes;
        var OutcomesConcepts = ''
        var outcomes="";
            $.each(model.Outcomes, function (i, obj) { 

                OutcomesConcepts = '';
                $.each(obj.Concepts, function (i, obj2) {
                    OutcomesConcepts += "<tr data-id='" + obj2.PaymentConceptId + "'>";
                    OutcomesConcepts += "    <td>Cuota de " + obj2.Description + "<\/td>";
                    OutcomesConcepts += "    <td style='text-align:right'>" + obj2.Amount + "<\/td>";
                    OutcomesConcepts += "<\/tr>";
                });

                outcomes += "<a class='a-nostyle outcome-row' data-toggle='collapse' href='#outcomes-concepts" + i + "' aria-expanded='false' aria-controls='outcomes-concepts" + i + "'>";
                outcomes += "   <div class=\"row gastos-row\" style='border-bottom: 1px solid #ddd; height:45px; font-weight:bold'>";
                outcomes += "       <div class=\"gastos-row-item col-xs-7 col-sm-7 col-md-7 col-lg-7\">";
                outcomes += "           <span class='span-vcenter'>";
                outcomes +=               obj.Name ;
                outcomes += "           <\/span>";
                outcomes += "       <\/div>";
                outcomes += "       <div class=\"gastos-row-item col-xs-3 col-sm-3 col-md-3 col-lg-3\">";
                outcomes += "           <span class='span-vcenter'>";
                outcomes +=               obj.Total
                outcomes += "           <\/span>";
                outcomes += "       <\/div>";
                outcomes += "       <div class=\"gastos-row-item col-xs-2 col-sm-2 col-md-2 col-lg-2\" style='text-align:right'>";
                outcomes += "           <span class='span-vcenter'>";
                outcomes += "               <i class='fa fa-angle-down fa-2x'><\/i>";
                outcomes += "           <\/span>";
                outcomes += "       <\/div>";
                outcomes += "   <\/div>";
                outcomes += "<\/a>";
                outcomes += "<div class=\"concept-collapsible row collapse fontsm\" id='outcomes-concepts" + i + "'>";
                outcomes += "    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">";
                outcomes += "        <table class=\"table table-striped nopad-nomar\">";
                outcomes +=            OutcomesConcepts
                outcomes += "        <\/table>";
                outcomes += "    <\/div>";
                outcomes += "<\/div>";
            });

        // Incomes
        var ingresos = model.Incomes;

        var IncomesConcepts = ''
            IncomesConcepts += "<tr>";
            IncomesConcepts += "    <td>" + ingresos.NumberIncomes + " cuotas de " + ingresos.IncomeMonth + "<\/td>";
            IncomesConcepts += "    <td style='text-align:right'>" + ingresos.Collected + "<\/td>";
            IncomesConcepts += "<\/tr>";

        var incomes="";
            incomes += "<a class='a-nostyle income-row' data-toggle='collapse' href='#incomes-concepts' aria-expanded='false' aria-controls='incomes-concepts'>";
            incomes += "    <div class=\"row gastos-row\" style='border-bottom: 1px solid #ddd; height:45px; font-weight:bold'>";
            incomes += "        <div class=\"gastos-row-item col-xs-7 col-sm-7 col-md-7 col-lg-7\">";
            incomes += "            <span class='span-vcenter'>";
            incomes +=                 ingresos.IncomeMonth
            incomes += "            <\/span>";
            incomes += "        <\/div>";
            incomes += "        <div class=\"gastos-row-item col-xs-3 col-sm-3 col-md-3 col-lg-3\">";
            incomes += "            <span class='span-vcenter'>";
            incomes +=                ingresos.Collected
            incomes += "            <\/span>";
            incomes += "        <\/div>";
            incomes += "        <div class=\"gastos-row-item col-xs-2 col-sm-2 col-md-2 col-lg-2\" style='text-align:center'>";
            incomes += "            <span class='span-vcenter'>";
            incomes += "                <i class='fa fa-angle-down fa-2x'><\/i>";
            incomes += "            <\/span>";
            incomes += "        <\/div>";
            incomes += "    <\/div>";
            incomes += "<\/a>";
            incomes += "<div class=\"concept-collapsible row collapse\" id='incomes-concepts'>";
            incomes += "    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">";
            incomes += "        <table class=\"table table-striped nopad-nomar\">";
            incomes +=            IncomesConcepts
            incomes += "        <\/table>";
            incomes += "    <\/div>";
            incomes += "<\/div>";

            


        if (model.Outcomes.length < 1) {
            outcomes = "<div style='width:100%; padding:15px; text-align: center'>"
            outcomes += "   <p class='not-found-icon'><i class='fa fa-info-circle fa-5x'></i></p>"
            outcomes += "   <p class='not-found-text fontlg'>No hay conceptos por gastos en el mes seleccionado.</p>"
            outcomes += "</div>"
        }

        if (ingresos.Collected_value == 0) {
            incomes = "<div style='width:100%; padding:15px; text-align: center'>"
            incomes += "   <p class='not-found-icon'><i class='fa fa-info-circle fa-5x'></i></p>"
            incomes += "   <p class='not-found-text fontlg'>No hay pagos recibidos en el mes seleccionado.</p>"
            incomes += "</div>"
        }

        // Outcomes HTML
            html += "<div id='mlqmarkos12' class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='padding:11px; height: inherit;'>";
            html += "   <div style='margin-bottom:10px'>";
            html += "       <input id='monthpicker' class='fontlg' type='month' min='2014-01' max='" + currentMonth + "' value='" + (selectedDate == '' ? currentMonth : selectedDate.replace("/","-") ) + "' >";
            html += "   <\/div>";
            html += "   <div role=\"tabpanel\">";
            html += "";
            html += "       <ul class=\"nav nav-tabs\" role=\"tablist\">";
            html += "           <li role=\"presentation\" class=\"tab-w50 active\">";
            html += "               <a id='outcomesTab' href=\"#gastos\" aria-controls=\"gastos\" role=\"tab\" data-toggle=\"tab\">";
            html += "                   <p class='concept fontmd'>Gastos<\/p>";
            html += "                   <p class='tab-total fontsm'>" + totalGastos + "<\/p>";
            html += "               <\/a>";
            html += "           <\/li>";
            html += "           <li role=\"presentation\" class='tab-w50'>";
            html += "               <a id='incomesTab' href=\"#ingresos\" aria-controls=\"ingresos\" role=\"tab\" data-toggle=\"tab\">";
            html += "                   <p class='concept fontmd'>Ingresos<\/p>";
            html += "                   <p class='tab-total fontsm'>" + ingresos.Collected + "<\/p>";
            html += "               <\/a>";
            html += "           <\/li>";
            html += "       <\/ul>";
            html += "";
            html += "       <div class=\"tab-content\">";
            html += "           <div role=\"tabpanel\" class=\"tabs-content tab-pane fade in active\" id=\"gastos\">";
            html += "              <div class='gastos-container'>";
            html +=                    outcomes ;
            html += "              <\/div>";
            html += "           <\/div>";
            html += "           <div role=\"tabpanel\" class=\"tabs-content tab-pane fade\" id=\"ingresos\">";
            html += "               <div class='gastos-container'>";
            html +=                    incomes ;
            html += "               <\/div>";
            html += "           <\/div>";
            html += "       <\/div>";
            html += "";
            html += "   <\/div> ";
            html += "<\/div>";

    }).done(function () {
        app.Sammy.swap(html, function () {
            app.ShowBack('#/panel');

            var outcomesTab = $('#outcomesTab')
            var incomesTab = $('#incomesTab')

            outcomesTab.on('show.bs.tab', function (event) {
                outcomesTab.toggleClass('e-tab-active')
                incomesTab.toggleClass('e-tab-active')
            })

            incomesTab.on('show.bs.tab', function (event) {
                outcomesTab.toggleClass('e-tab-active')
                incomesTab.toggleClass('e-tab-active')
            })

            app.Hammerify({
                id: 'mlqmarkos12',
                right: function () { 

                    if (incomesTab.hasClass('e-tab-active')) {
                        outcomesTab.tab('show')
                    } else {
                        incomesTab.tab('show')
                    }
                },
                left: function () { 

                    if (incomesTab.hasClass('e-tab-active')) {
                        outcomesTab.tab('show')
                    } else {
                        incomesTab.tab('show')
                    }
                }
            })
        })
    })
}

// Reminders module
app.Reminders.RenderReminders = function () {

    $('#brand').text('Recordatorios')
    app.hideTabs()

    app.Sammy.swap(app.Reset)

    $.ajax({
        url: app.BaseUrl + 'api/resident/alerts?PageNumber=1',
        type: 'GET',
        contentType: 'application/json',
        statusCode: {
            200: function (response) {
                
                var html = ''
                var reminders="";

                if (response.Items.length == 0) {
                    html += "<div class='not-found col-xs-12 col-sm-12 col-md-12 col-lg-12'>"
                    html += "   <span class='span-vcenter'>"
                    html += "       <p class='not-found-icon'><i class='fa fa-info-circle fa-5x'></i></p>"
                    html += "       <p class='not-found-text fontlg'>No tienes recordatorios.</p>"
                    html += "       <p class='not-found-text fontmd'>Agenda un recordatorio de algún pago que tengas que realizar.</p>"
                    html += "       <p class='not-found-text fontmd'>Recibe recordatorios a tu email o en tu celular de los pagos de la luz, agua, cable, etc.</p>"
                    html += "   </span>"
                    html += "</div>"
                }
                else {
                    var date = ''
                    var props = {}
                    var periodicity = ''
                    var creationDate = ''

                    reminders += "<div class=\"row\" style='margin:0px; margin-bottom:30px'>";

                    $.each(response.Items, function (i, obj) {
                        date = moment(obj.ScheduleDate).format('LLLL')
                        periodicity = app.Reminders.getPeriodicityTitle(obj.Periodicity)
                        creationDate = moment(obj.CreationDate).format('LLLL')
                        props = app.Reminders.getPropsFromType(obj.ResidentAlertType)



                        reminders += "<div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 reminder-row\" data-id='" + obj.ResidentAlertId + "'>";
                        reminders += "    <div class=\"col-xs-2 col-sm-2 col-md-1 col-lg-1 div-table centered-text\">";
                        reminders += "        <span class='span-vcenter'>";
                        reminders += "            <div class='img-circle reminder-icon " + props.bg + "'>";
                        reminders += "                <span class='span-vcenter'>";
                        reminders += "                    <img src='" + props.dir + "' class='img22'>";
                        reminders += "                <\/span>";
                        reminders += "            <\/div>";
                        reminders += "        <\/span>";
                        reminders += "    <\/div>";
                        reminders += "    <div class=\"col-xs-8 col-sm-8 col-md-10 col-lg-10 div-table\">";
                        reminders += "        <span class='span-vcenter'>";
                        reminders += "            <p class='nopad-nomar'><strong>" + obj.Title + "<\/strong><\/p>";
                        reminders += "            <p class='fontxs nopad-nomar'>" + periodicity + "<\/p>";
                        reminders += "            <p class='fontxs nopad-nomar'>" + date + "<\/p>";
                        reminders += "        <\/span>";
                        reminders += "    <\/div>";
                        reminders += "    <div class=\"col-xs-2 col-sm-2 col-md-1 col-lg-1 div-table text-center edit-reminder-div\">";
                        reminders += "          <span class='span-vcenter'>";
                        reminders += "              <img src=\"assets\/img\/reminders/pencil.png\" class='img20'>";
                        reminders += "          <\/span>";
                        reminders += "    <\/div>";
                        reminders += "<\/div>";

                    })
                        reminders += "<\/div>";
                }

                    html += reminders
                    html += "<a class='elevation animate' href='#/recordatorios/crear'>"
                    html += "   <img src='assets/img/Thin_add_button_256(1).png' class='img44'>"
                    html += "</a>"
                    // html += "<nav class=\"navbar navbar-default navbar-fixed-bottom navbar-add\" id='add'>";
                    // html += "    <div class=\"container-fluid\" style='height:inherit; display: table; text-align:center; color:white'>";
                    // html += "        <span class=\"span-vcenter\" style='width:100%'>";
                    // html += "            <img src=\"assets\/img\/Add_circular_button_64.png\" class='img30'>";
                    // html += "        <\/span>";
                    // html += "    <\/div>";
                    // html += "<\/nav>";

                app.Sammy.swap(html, function () {
                    app.ShowBack('#/panel');
                    $('.animate').addClass('move')
                })

            },
            400: function (response) {
                app.ShowAlert(JSON.parse(response.responseText).ModelState)
            }
        }
    })
}

app.Reminders.getPropsFromType = function(type){
    var props = {}
    switch(type){
        case 0: props.dir = 'assets/img/reminders/custom.png'; props.bg = 'bg-custom'; break;
        case 1: props.dir = 'assets/img/reminders/light.png'; props.bg = 'bg-light'; break;
        case 2: props.dir = 'assets/img/reminders/drop.png'; props.bg = 'bg-water'; break;
        case 3: props.dir = 'assets/img/reminders/tv.png'; props.bg = 'bg-tv'; break;
        case 4: props.dir = 'assets/img/reminders/phone.png'; props.bg = 'bg-phone'; break;
        case 5: props.dir = 'assets/img/reminders/creditcard.png'; props.bg = 'bg-creditcard'; break;
        case 6: props.dir = 'assets/img/reminders/college.png'; props.bg = 'bg-college'; break;
    }
    return props
}

app.Reminders.ViewReminder = function(residentAlertId) {
    app.Sammy.swap(app.Reset)
    $.ajax({
        url: app.BaseUrl + 'api/resident/alerts/' + residentAlertId,
        type: 'GET',
        contentType: 'application/json',
        statusCode: {
            200: function (r) {
                
                var counter = moment(r.ScheduleDate).format('YYYY/MM/DD HH:mm:ss')
                var date = moment(r.ScheduleDate).format('LLLL')
                $('#brand').text(r.Title)

                var sharedWith = ''
                $.each(r.Residents, function (i, obj){
                    sharedWith += "<p class='nopad-nomar'>" + obj.Name + " " + obj.FirstLastName + " " + obj.SecondLastName + "<\/p>";
                })

                var reminder="";
                    reminder += "<div class=\"row\" style='margin:0px; padding:7.5px; background:white'>";
                    reminder += "    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 centered-text\">";
                    reminder += "        <span class='fontbold fontlg nopad-nomar timer-countdown' id='timer' data-countdown='" + counter + "'>Cargando...<\/span>";
                    reminder += "    <\/div>";
                    reminder += "<\/div>";

                    reminder += "<div class=\"row\" style='margin:0px; padding:7.5px; background:white'>";
                    reminder += "    <div class=\"centered-text fontxlg col-xs-2 col-sm-2 col-md-1 col-lg-1\" style='color:#ddd'>";
                    reminder += "        <i class=\"fa fa-clock-o\"><\/i>";
                    reminder += "    <\/div>";
                    reminder += "    <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
                    reminder += "        <p class='fontbold nopad-nomar fontmd'>Frecuencia<\/p>";
                    reminder += "         <span id='event-date'>" + app.Reminders.getPeriodicityTitle(r.Periodicity) + "<\/span>";
                    reminder += "    <\/div>";
                    reminder += "<\/div>";

                    if (app.SessionData.Resident.ResidentId != r.CreatorId){
                        reminder += "<div class=\"row\" style='margin:0px; padding:7.5px; background:white'>";
                        reminder += "    <div class=\"centered-text fontxlg col-xs-2 col-sm-2 col-md-1 col-lg-1\" style='color:#ddd'>";
                        reminder += "        <i class=\"fa fa-user\"><\/i>";
                        reminder += "    <\/div>";
                        reminder += "    <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
                        reminder += "        <p class='fontbold nopad-nomar fontmd'>Creado por<\/p>";
                        reminder += "         <span id='event-date'>" + r.Creator + "<\/span>";
                        reminder += "    <\/div>";
                        reminder += "<\/div>";
                    }

                    reminder += "<div class=\"row\" style='margin:0px; padding:7.5px; background:white'>";
                    reminder += "    <div class=\"centered-text fontxlg col-xs-2 col-sm-2 col-md-1 col-lg-1\" style='color:#ddd'>";
                    reminder += "        <i class=\"fa fa-calendar\"><\/i>";
                    reminder += "    <\/div>";
                    reminder += "    <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
                    reminder += "        <p class='fontbold nopad-nomar fontmd'>Próximo recordatorio<\/p>";
                    reminder += "         <span id='event-date'>" + date + "<\/span>";
                    reminder += "    <\/div>";
                    reminder += "<\/div>";

                    reminder += "<div class=\"row\" style='margin:0px; padding:7.5px; background:white'>";
                    reminder += "    <div class=\"centered-text fontxlg col-xs-2 col-sm-2 col-md-1 col-lg-1\" style='color:#ddd'>";
                    reminder += "        <i class=\"fa fa-at\"><\/i>";
                    reminder += "    <\/div>";
                    reminder += "    <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
                    reminder += "        <p class='fontbold nopad-nomar fontmd'>Envío de email<\/p>";
                    reminder += "         <span id='event-date'>" + (r.SendEmail ? 'Activo' : 'Inactivo') + "<\/span>";
                    reminder += "    <\/div>";
                    reminder += "<\/div>";

                    reminder += "<div class=\"row\" style='margin:0px; padding:7.5px; background:white'>";
                    reminder += "    <div class=\"centered-text fontxlg col-xs-2 col-sm-2 col-md-1 col-lg-1\" style='color:#ddd'>";
                    reminder += "        <i class=\"fa fa-globe\"><\/i>";
                    reminder += "    <\/div>";
                    reminder += "    <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
                    reminder += "        <p class='fontbold nopad-nomar fontmd'>Envío de notificación push<\/p>";
                    reminder += "         <span id='event-date'>Activo<\/span>";
                    reminder += "    <\/div>";
                    reminder += "<\/div>";

                    if (app.SessionData.Resident.ResidentId == r.CreatorId){
                        if (r.Residents.length > 0){
                            reminder += "<div class=\"row\" style='margin:0px; padding:7.5px; background:white'>";
                            reminder += "    <div class=\"centered-text fontxlg col-xs-2 col-sm-2 col-md-1 col-lg-1\" style='color:#ddd'>";
                            reminder += "        <i class=\"fa fa-users\"><\/i>";
                            reminder += "    <\/div>";
                            reminder += "    <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
                            reminder += "        <p class='fontbold nopad-nomar fontmd'>Compartido con<\/p>";
                            reminder +=          sharedWith
                            reminder += "    <\/div>";
                            reminder += "<\/div>";
                        }
                    }

                    reminder += "<nav class=\"navbar navbar-default navbar-fixed-bottom navbar-add\" id='remove-reminder' data-id='" + r.ResidentAlertMembershipId + "'>";
                    reminder += "    <div class=\"container-fluid\" style='height:inherit; display: table; text-align:center; color:white'>";
                    reminder += "        <span class=\"span-vcenter\" style='width:100%'>";
                    reminder += "            <img src=\"assets\/img\/remove.png\" class='img30'>";
                    reminder += "        <\/span>";
                    reminder += "    <\/div>";
                    reminder += "<\/nav>";



                app.Sammy.swap(reminder, function () {
                    app.ShowBack('#/recordatorios');
                    var timer = $('#timer')
                    timer.countdown(timer.data('countdown'), function (event) {
                        timer.html(event.offset.days > 0 ?
                            event.strftime('%-D día%!D %H:%M:%S') :
                            event.strftime('%H:%M:%S'))
                    })
                })
            },
            400: function (response) {
                app.getDoesntExistHTML('El recordatorio que buscas no existe')

                app.Sammy.swap(app.DoesntExist, function () {
                    app.ShowBack('#/recordatorios');
                })
            },
        }
    })
}

app.Reminders.getPeriodicityTitle = function (periodicity) {
    switch (periodicity) {
        default:
        case 0: return 'Sólo una vez'
        case 1: return 'Cada mes'
        case 2: return 'Cada 2 meses'
        case 3: return 'Cada 3 meses'
    }
}

app.Reminders.getHTMLFormReminders = function (formid, submitId, submitText, showShare){

    var html="";
        html += "<div class=\"row\" style='margin:0px; background:white'>";
        html += "   <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='padding:7.5px; padding-top:0px'>";
        html += "       <form id='" + formid + "'>";
        html += "           <div class=\"row\" style='padding-bottom:20px; height:60px;'>";
        html += "               <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-4 div-table\">";
        html += "                   <span class='span-vcenter'>";
        html += "                       <p class='fontmd nopad-nomar'>Fecha<\/p>";
        html += "                   <\/span>";
        html += "               <\/div>";
        html += "               <div class=\"col-xs-10 col-sm-10 col-md-10 col-lg-8 div-table\">";
        html += "                   <span class='span-vcenter'>";
        html += "                       <input type=\"datetime-local\" id=\"ScheduleDate\" name=\"ScheduleDate\" class=\"styled-input fontmd\" data-val=\"true\" data-val-required=\"Fecha es requerida.\" placeholder='Fecha del recordatorio' value='Fecha del recordatorio'>";
        html += "                       <div class=\"form-error\"><span data-valmsg-replace=\"true\" data-valmsg-for=\"ScheduleDate\" class=\"field-validation-valid\"><\/span><\/div>";
        html += "                   <\/span>";
        html += "               <\/div>";
        html += "           <\/div>";
        html += "           <div class=\"row\" style='padding-bottom:7.5px; height:60px' id='reminder-type-row'>";
        html += "               <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">";
        html += "                   <select class=\"styled-input fontmd\" name=\"ResidentAlertType\" id=\"ResidentAlertType\" data-val=\"true\" data-val-required=\"Típo de recordatorio es requerido.\" aria-required=\"true\" aria-invalid=\"false\" aria-describedby=\"ResidentAlertType-error\">";
        html += "                       <option disabled selected>Tipo de recordatorio<\/option>";
        html += "                       <option value='0'>Otro<\/option>";
        html += "                       <option value='1'>Recibo de luz<\/option>";
        html += "                       <option value='2'>Recibo de agua<\/option>";
        html += "                       <option value='3'>Recibo de cable<\/option>";
        html += "                       <option value='4'>Recibo de teléfono<\/option>";
        html += "                       <option value='5'>Pago de tarjeta bancaria<\/option>";
        html += "                       <option value='6'>Pago de colegiatura<\/option>";
        html += "                   <\/select>";
        html += "                   <div class=\"form-error\">";
        html += "                       <span data-valmsg-replace=\"true\" data-valmsg-for=\"ResidentAlertType\" class=\"field-validation-valid\"><\/span>";
        html += "                   <\/div>";
        html += "               <\/div>";
        html += "           <\/div>";
        html += "           <div class=\"row hidden\" id='title-row' style='padding-bottom:7.5px; height:60px;'>";
        html += "               <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">";
        html += "                   <input type=\"text\" id=\"Title\" name=\"Title\" class=\"styled-input fontmd\" data-val=\"true\" data-val-required=\"Titulo es requerido.\" placeholder='Título'>";
        html += "                   <div class=\"form-error\"><span data-valmsg-replace=\"true\" data-valmsg-for=\"Title\" class=\"field-validation-valid\"><\/span><\/div>";
        html += "               <\/div>";
        html += "           <\/div>";
        html += "           <div class=\"row\" style='padding-bottom:7.5px; height:75px'>";
        html += "               <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">";
        html += "                   <select class=\"styled-input fontmd\" name=\"Periodicity\" id=\"Periodicity\" data-val=\"true\" data-val-required=\"Periodicidad es requerida.\">";
        html += "                       <option disabled selected>Periodicidad del recordatorio<\/option>";
        html += "                       <option value='0'>Recordarme solo una vez<\/option>";
        html += "                       <option value='1'>Recordarme cada mes<\/option>";
        html += "                       <option value='2'>Recordarme cada dos meses<\/option>";
        html += "                       <option value='3'>Recordarme cada tres meses<\/option>";
        html += "                   <\/select>";
        html += "                   <div class=\"form-error\">";
        html += "                       <span data-valmsg-replace=\"true\" data-valmsg-for=\"Periodicity\" class=\"field-validation-valid\"><\/span>";
        html += "                   <\/div>";
        html += "               <\/div>";
        html += "           <\/div>";
        html += "           <div class=\"row\" style='margin-top:10px'>";
        html += "               <div class=\"col-xs-10 col-sm-10 col-md-10 col-lg-10\">";
        html += "                   <p class='fontmd nopad-nomar'>Notificacion al dispositivo movil<\/p>";
        html += "               <\/div>";
        html += "               <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2\">";
        html += "                   <div class=\"switch\">";
        html += "                       <input type=\"checkbox\" class=\"cmn-toggle cmn-toggle-round\" id=\"Mobile\" name=\"Mobile\" checked disabled>";
        html += "                       <label for=\"Mobile\" style='margin:0 auto'><\/label>";
        html += "                   <\/div>";
        html += "               <\/div>";
        html += "           <\/div>";
        html += "           <br>";
        html += "           <div class=\"row\">";
        html += "               <div class=\"col-xs-10 col-sm-10 col-md-10 col-lg-10\">";
        html += "                   <p class='fontmd nopad-nomar'>Enviar email<\/p>";
        html += "               <\/div>";
        html += "               <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2\">";
        html += "                   <div class=\"switch\">";
        html += "                       <input type=\"checkbox\" class=\"cmn-toggle cmn-toggle-round\" id=\"SendEmail\" name=\"SendEmail\">";
        html += "                       <label for=\"SendEmail\" style='margin:0 auto'><\/label>";
        html += "                   <\/div>";
        html += "               <\/div>";
        html += "           <\/div>";
        html += "           <br>";
        if (showShare){
            html += "           <div class=\"row\">";
            html += "               <div class=\"col-xs-10 col-sm-10 col-md-10 col-lg-10\">";
            html += "                   <p class='fontmd nopad-nomar'>Compartir recordatorio<\/p>";
            html += "               <\/div>";
            html += "               <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2\">";
            html += "                   <div class=\"switch\">";
            html += "                       <input type=\"checkbox\" class=\"cmn-toggle cmn-toggle-round\" id=\"Share\" name=\"Share\">";
            html += "                       <label for=\"Share\" style='margin:0 auto'><\/label>";
            html += "                   <\/div>";
            html += "               <\/div>";
            html += "           <\/div>";
            html += "           <br>";
        }
        html += "           <div class=\"row hidden\" id='cohabitants' style='padding-bottom: 52px'>";
        html += "           <\/div>";
        html += "            <nav class=\"navbar navbar-default navbar-fixed-bottom\" id='" + submitId + "' style='height:52px;'>";
        html += "               <div class=\"container-fluid\" style='height:inherit; display: table; text-align:center; color:white'>";
        html += "                   <span class=\"span-vcenter\" style='width:100%'>";
        html += "                       <div class=\"footer-total fontxlg\">" + submitText + " <span class='pull-right'><i class=\"fa fa-angle-right fontxxxlg\"><\/i><\/span><\/div>";
        html += "                   <\/span>";
        html += "               <\/div>";
        html += "           <\/nav>";
        html += "       <\/form>";
        html += "   <\/div>";
        html += "<\/div>";

    return html
}

app.Reminders.CreateReminder = function (reminder) {
    $('#brand').text('Agendar recordatorio')
    
    app.Sammy.swap(app.Reset)
    
    $.ajax({
        url: app.BaseUrl + 'api/resident/cohabitants/',
        type: 'GET',
        statusCode: {
            200: function (response) {
                var cohabitants="";
                $.each(response.Items, function (i, obj){
                    cohabitants += "<div class=\"cohabitant-row\" style='height:40px; border-bottom:1px solid #ddd'>";
                    cohabitants += "    <div class=\"col-xs-2 col-sm-3 col-md-4 col-lg-4 div-table text-center\">";
                    cohabitants += "        <span class='span-vcenter'>";
                    cohabitants += "            <input class='cohabitant-item' type='checkbox' data-id='" + obj.ResidentId + "'>";
                    cohabitants += "        <\/span>";
                    cohabitants += "    <\/div>";
                    cohabitants += "    <div class=\"col-xs-10 col-sm-9 col-md-8 col-lg-8 div-table\">";
                    cohabitants += "        <span class='span-vcenter'>";
                    cohabitants += "            <p class='nopad-nomar fontmd'>" + obj.Name + " " + obj.FirstLastName + " " + obj.SecondLastName +"<\/p>";
                    cohabitants += "        <\/span>";
                    cohabitants += "    <\/div>";
                    cohabitants += "<\/div>";
                })

                var html = app.Reminders.getHTMLFormReminders('resident-alerts-post-form', 'create-reminder', 'Agendar', true)

                app.Sammy.swap(html, function () {
                    app.ShowBack('#/recordatorios');
                    $('#cohabitants').html(cohabitants)

                    var form = $('#resident-alerts-post-form')
                    form.removeData('validator')
                    form.removeData('unobtrusiveValidation')
                    $.validator.unobtrusive.parse(form)
                })
            }
        }
    })
}

app.Reminders.EditReminder = function(id){
    $('#brand').text('Editar recordatorio')
    app.Sammy.swap(app.Reset)

    $.ajax({
        url: app.BaseUrl + 'api/resident/alerts/' + id,
        type: 'GET',
        statusCode: {
            200: function (reminder) {
                
                var html = app.Reminders.getHTMLFormReminders('resident-alerts-put-form', 'edit-reminder', 'Guardar', false)

                var scheduleDate = moment(reminder.ScheduleDate).format('YYYY-MM-DD[T]HH:mm:ss')
                app.Sammy.swap(html, function () {
                    app.ShowBack('#/recordatorios');

                    var form = $('#resident-alerts-put-form')
                    form.removeData('validator')
                    form.removeData('unobtrusiveValidation')
                    $.validator.unobtrusive.parse(form)

                    if(reminder.ResidentAlertType == 0){
                        $('#Title').val(reminder.Title)
                        $('#title-row').slideDown()
                    }else{
                        $('#reminder-type-row').hide()
                    }

                    // $('#ResidentAlertType').val(reminder.ResidentAlertType).prop('disabled', true);

                    $("#Periodicity").val(reminder.Periodicity)

                    $("#ScheduleDate").val(scheduleDate)

                    $("#SendEmail").prop('checked', reminder.SendEmail)

                    $("#Share").closest('.row').remove()

                })
            },
            400: function (response) {
                app.getDoesntExistHTML('El recordatorio que buscas no existe.')

                app.Sammy.swap(app.DoesntExist, function () {
                    app.ShowBack('#/recordatorios');
                })
            },
        }
    })

}


// Settings module
app.Resident.RenderSettings = function () {
    $('#brand').text('Milenium Construcasa')
    // $('#navbar').removeClass('hidden')
    $('#tabs').removeClass('hidden')
    $('.active').removeClass('active')
    $('#tab3').addClass('active');

    app.Sammy.swap(app.Reset)

    var html="";

    var profileRequest = $.getJSON(app.BaseUrl + 'api/resident/profile/')
    var paymentsRequest = $.getJSON(app.BaseUrl + 'api/resident/payments')
    var warrantiesRequest =  $.getJSON(app.BaseUrl + 'api/resident/warranties/')

    $.when(paymentsRequest, warrantiesRequest, profileRequest)
    .done(function () {
        var payments = paymentsRequest.responseJSON
        var profile = profileRequest.responseJSON
        var lastPayment = ''
        //Get the last payment
        var collectedPayments = paymentsRequest.responseJSON.CollectedPayments
        if (collectedPayments.length > 0)   lastPayment = moment(collectedPayments[collectedPayments.length-1].PayMonth).format('MMMM [del] YYYY')
        else                                lastPayment = 'No hay pagos registrados'

        // Get all warranties with RemainingDays > 0 and count it
        var warranties = warrantiesRequest.responseJSON.Items
        var validWarranties = 0
        $.each(warranties, function (i, obj) {
            if (obj.RemainingDays > 0) validWarranties++
        })

        html += "       <div class='content nopad-nomar' id=\"settings\" style='color:#000; height: inherit'>";
        html += "           <div class='row conf-row whitebg'>";
        html += "               <div class='col-xs-2' style='height:inherit'>";
        html += "                   <div class='conf-icon'>";
        html += "                       <span class='span-vcenter'>";
        html += "                           <div class='config-bgb bgb-grey img-circle'>";
        html += "                               <span class='span-vcenter'>";
        html += "                                   <i class=\"fa fa-user fa-2x\"><\/i>";
        html += "                               <\/span>";
        html += "                           <\/div>";
        html += "                       <\/span>";
        html += "                   <\/div>";
        html += "               <\/div>";
        html += "               <div class='col-xs-8' style='height:inherit;'>";
        html += "                   <div class='conf-content fontlg'>";
        html += "                       <span class='span-vcenter'>";
        html += "                           Información";
        html += "                       <\/span>";
        html += "                   <\/div>";
        html += "               <\/div>";
        html += "               <div class='col-xs-2' style='height:inherit'>";
        html += "                   <div class='conf-icon'>";
        html += "                       <span class='span-vcenter'>";
        html += "                           <i class=\"fa fa-angle-down fa-2x show-more\" content='miperfil'><\/i>";
        html += "                       <\/span>";
        html += "                   <\/div>";
        html += "               <\/div>";
        html += "           <\/div>";
        html += "           <div class='col-xs-12 conf-hidden-content hidden' id='miperfil' style='background:#fff'>";
        html += "               <div class='container-fluid' style='border-bottom:1px solid #b0b0b0; margin-top:10px;'><strong>MI PERFIL<\/strong><\/div>";
        html += "                   <div class='row' style='margin-top:15px;' align='center'>";
        html += "                       <div class='col-xs-4'>";
        html += "                           <span class='thumbnail' id='profile-picture' style='text-align:center; z-index:1500; max-width:80px; max-height:80px; min-width:80px; min-height:80px; margin-bottom:5px'>";
        html += "                               <img id='profilepic' style='max-height:70px; max-width:70px;' src='" + app.BaseUrl + "/content/images/uploads/" + ( profile.ImageCode || 'profile-new.jpg') + "'>";
        html += "                           <\/span>";
        html += "                           <div id='edit-profile-picture' style='position:absolute; width:80px; z-index:1; height:20px; opacity: 0.3; background:black; color:white; bottom:5px; margin-left:-40px; left:50%'>";
        html += "                               <div class='div-table pull-right' style='font-size:0px; padding-right:2px;'>";
        html += "                                   <span class='span-vcenter'>";
        html += "                                       <i class='fa fa-camera' style='font-size:14px; margin-right:3px'></i>";
        html += "                                   </span>";
        html += "                               </div>";
        html += "                           </div>";
        html += "                       <\/div>";
        html += "";
        html += "                       <div class='col-xs-8' style='text-align:left'> ";
        html += "                           " + profile.Name + " " + profile.FirstLastName + " " + profile.SecondLastName + "<br> ";
        html += "                           Tel: " +app.LocalPhone+ "<br> ";
        html += "                           Cel: " +profile.MobilePhone+ "<br> ";
        html += "                           Email: " +profile.Email+ "";
        html += "                       <\/div> ";
        html += "                   <\/div> ";
        html += "";
        html += "                   <div class='container-fluid' style='border-bottom:1px solid #b0b0b0; margin-top:10px;'><strong>MI RESIDENCIA<\/strong><\/div> ";
        html += "                       <div class='row' style='margin-top:15px;'> ";
        html += "                           <div class='col-xs-12' id='residence-data-content'> ";
        html += "                               <div class='residence-data'> ";
        html += "                                   "+app.Lot.Street+" #"+app.Lot.HouseNo+"<br> ";
        html += "                                   "+app.SettlementName+"<br> ";
        html += "                                   C.P. "+app.SettlementZip+"<br> ";
        html += "                           <\/div> ";
        html += "                           <div class='residence-data'> ";
        html += "                               "+app.Lot.Model+"<br> ";
        html += "                               <strong class='fontsm'>Modelo<\/strong><br> ";
        html += "                           <\/div> ";
        html += "                           <div class='residence-data'> ";
        html += "                               "+app.Lot.SaleDate+"<br> ";
        html += "                               <strong class='fontsm'>Fecha de compra<\/strong><br> ";
        html += "                           <\/div> ";
        html += "                           <div class='residence-data'> ";
        html += "                               " + lastPayment + "<br> ";
        html += "                               <strong class='fontsm'>Última cuota pagada<\/strong><br> ";
        html += "                           <\/div> ";
        html += "                           <div class='residence-data'> ";
        html += "                               " + payments.PendingPayments.length + "<br> ";
        html += "                               <strong class='fontsm'>Meses con adeudo<\/strong><br> ";
        html += "                           <\/div> ";
        html += "                           <div class='residence-data'> ";
        html += "                               " + payments.Debt + "<br> ";
        html += "                               <strong class='fontsm'>Monto de adeudo<\/strong><br> ";
        html += "                           <\/div> ";
        html += "                           <div class='residence-data'> ";
        html += "                               <a href='#/garantias'>" + validWarranties + "<\/a><br> ";
        html += "                               <strong class='fontsm'>Garantías vigentes<\/strong><br> ";
        html += "                           <\/div> ";
        
        if (localStorage.getItem('LotLength') > 1) {
            html += "                           <div class='residence-data'> ";
            html += "                               <a href='#/selecciona-residente' class='btn btn-primary btn-block'>Cambiar de lote<\/a><br> ";
            html += "                           <\/div> ";
        }

        html += "                   <\/div> ";
        html += "               <\/div> ";
        html += "           <\/div>";
        html += "           <div class='row conf-row whitebg' style='margin:0px'>";
        html += "               <div class='col-xs-2' style='height:inherit'>";
        html += "               <div class='conf-icon'>";
        html += "                   <span class='span-vcenter'>";
        html += "                       <div class='config-bgb bgb-grey img-circle'>";
        html += "                           <span class='span-vcenter'>";
        html += "                               <i class=\"fa fa-user-plus fa-2x\"><\/i>";
        html += "                           <\/span>";
        html += "                       <\/div>";
        html += "                   <\/span>";
        html += "               <\/div>";
        html += "               <\/div>";
        html += "               <div class='col-xs-8' style='height:inherit'>";
        html += "               <div class='conf-content fontlg'>";
        html += "                   <span class='span-vcenter'>";
        html += "                       Invitar cohabitante";
        html += "                   <\/span>";
        html += "               <\/div>";
        html += "               <\/div>";
        html += "               <div class='col-xs-2' style='height:inherit'>";
        html += "               <div class='conf-icon'>";
        html += "                   <span class='span-vcenter'>";
        html += "                       <i class=\"fa fa-angle-down fa-2x show-more\" content='invitar'><\/i>";
        html += "                   <\/span>";
        html += "               <\/div>";
        html += "               <\/div>";
        html += "           <\/div>";
        html += "           <div id='invitar' class='hidden' style='background:#fff'>";
        html +=                 app.Resident.GetResidentInviteForm('invite-form', 'Invitar')
        html += "           <\/div>";
        html += "";
        html += "           <!-- Configuracion -->";
        html += "           <div class='row conf-row whitebg' style='margin:0px'>";
        html += "               <div class='col-xs-2' style='height:inherit'>";
        html += "               <div class='conf-icon'>";
        html += "                   <span class='span-vcenter'>";
        html += "                       <div class='config-bgb bgb-grey img-circle'>";
        html += "                           <span class='span-vcenter'>";
        html += "                               <i class=\"fa fa-cog fa-2x\"><\/i>";
        html += "                           <\/span>";
        html += "                       <\/div>";
        html += "                   <\/span>";
        html += "               <\/div>";
        html += "               <\/div>";
        html += "               <div class='col-xs-8' style='height:inherit'>";
        html += "               <div class='conf-content fontlg'>";
        html += "                   <span class='span-vcenter'>";
        html += "                       Configuración";
        html += "                   <\/span>";
        html += "               <\/div>";
        html += "               <\/div>";
        html += "               <div class='col-xs-2' style='height:inherit'>";
        html += "               <div class='conf-icon'>";
        html += "                   <span class='span-vcenter'>";
        html += "                       <i class=\"fa fa-angle-down fa-2x show-more\" content='configuracion'><\/i>";
        html += "                   <\/span>";
        html += "               <\/div>";
        html += "               <\/div>";
        html += "           <\/div>";
        html += "";
        html += "           <!-- Hidden content -->";
        html += "           <div id='configuracion' class='col-xs-12 conf-hidden-content hidden' style='background:#fff'>";
        html += "";
        html += "               <div class='container-fluid' style='border-bottom:1px solid #b0b0b0; margin-top:10px;'><strong >MI CUENTA<\/strong><\/div>";
        html += "               <div class='row'>";
        html += "                   <div class='col-xs-12'>";
        html += "                       <a href='#/logout' class='btn btn-default btn-block' style='margin:10px 0px 10px 0px; color: #000'><i class='fa fa-sign-out fa-fw'></i>Cerrar sesión</a>";
        html += "                   <\/div>";
        html += "               <\/div>";
        html += "           <\/div>";
        html += "       <\/div>";
        html += "<nav class=\"navbar navbar-default navbar-fixed-bottom hidden\" id='nav-camera' style='color:white;'>";
        html += "    <div id='choose-from-camera' class=\"centered-text col-xs-6 col-sm-6 col-md-6 col-lg-6\" style='height:inherit; display: table; border-right:1px solid #ddd'>";
        html += "        <span class=\"span-vcenter\">";
        html += "            <i  class=\"fa fa-camera fa-2x fa-fw\"><\/i>";
        html += "        <\/span>";
        html += "    <\/div>";
        html += "    <div id='choose-from-gallery' class=\"centered-text col-xs-6 col-sm-6 col-md-6 col-lg-6\" style='height:inherit; display: table;'>";
        html += "        <span class=\"span-vcenter\">";
        html += "            <i class=\"fa fa-picture-o fa-2x fa-fw\"><\/i>";
        html += "        <\/span>";
        html += "    <\/div>";
        html += "<\/nav>";

        app.Sammy.swap(html,function(){
            $('#residence-data-content .residence-data:last-child').css('border-bottom','none');
            $('#residence-data-content .residence-data:first-child').css('padding-top','0');

            var form = $('#invite-form')

            form.removeData('validator')
            form.removeData('unobtrusiveValidation')
            $.validator.unobtrusive.parse(form)

            $('#Name').focus()

            app.Hammerify({
                id: 'settings',
                always: function (event) { $('.tab-btn .active').removeClass('active') },
                left: function (event) { window.location = '#/panel' },
                right: function (event) { window.location = '#/notifications' }
            })
        })
    })
}

app.Resident.RenderInviteCohabitant = function () {

    if (!app.SessionData) { window.location = '#/logout'; return }
    if (app.SessionData.Resident.ResidentType != 0) { window.location = '#/panel'; return }
    app.UpdateTitle('Invitar cohabitante', 'fa fa-group')

    app.UpdateBreadCrumbs([
        { Url: '#/invitar/', Text: 'Invitar cohabitante' },
    ]);

    $('.side-menu li').removeClass('active')

    var html = app.Resident.GetResidentInviteForm('invite-form', 'Invitar')

    app.Sammy.swap(html, function () {

        var form = $('#invite-form')

        form.removeData('validator')
        form.removeData('unobtrusiveValidation')
        $.validator.unobtrusive.parse(form)

        $('#Name').focus()
    })
}

app.Resident.GetResidentInviteForm = function (id, submitText) {

    return '' +
        '<div class="col-xs-12 col-sm-12" style="padding-top:10px; padding-bottom:10px; background:#fff">' +
            '<form method="POST" action="" id="' + id + '">' +
                '<div class="validation-list-container"></div>' +
                '<div class="row">' +
                    '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-6 col-lg-offset-3">' +
                        '<div class="widget">' +
                            '<div class="widget-body">' +
                                '<div class="form-group">' +
                                    // '<label for="Name">Nombre</label>' +
                                    '<input type="text" class="styled-input" placeholder="Nombre" name="Name" id="Name" data-val-required="Nombre es requerido." data-val="true"' +
                                        'data-val-regex="Nombre contiene caractéres inválidos." data-val-regex-pattern="' + app.GetInputRegex() + '">' +
                                    '<div class="form-error"><span data-valmsg-replace="true" data-valmsg-for="Name" class="field-validation-valid"></span></div>' +
                                '</div>' +
                                '<div class="form-group">' +
                                    // '<label for="FirstLastName">Apellido paterno</label>' +
                                    '<input type="text" class="styled-input" placeholder="Apellido paterno" name="FirstLastName" id="FirstLastName" data-val-required="Apellido paterno es requerido." data-val="true"' +
                                        'data-val-regex="Apellido paterno contiene caractéres inválidos." data-val-regex-pattern="' + app.GetInputRegex() + '">' +
                                    '<div class="form-error"><span data-valmsg-replace="true" data-valmsg-for="FirstLastName" class="field-validation-valid"></span></div>' +
                                '</div>' +
                                '<div class="form-group">' +
                                    // '<label for="SecondLastName">Apellido materno</label>' +
                                    '<input type="text" class="styled-input" placeholder="Apellido materno" name="SecondLastName" id="SecondLastName" data-val-required="Apellido materno es requerido." data-val="true"' +
                                        'data-val-regex="Apellido materno contiene caractéres inválidos." data-val-regex-pattern="' + app.GetInputRegex() + '">' +
                                    '<div class="form-error"><span data-valmsg-replace="true" data-valmsg-for="SecondLastName" class="field-validation-valid"></span></div>' +
                                '</div>' +
                                '<div class="form-group">' +
                                    // '<label for="Email">Email</label>' +
                                    '<input type="email" class="styled-input" placeholder="Email" name="Email" id="Email" data-val-required="Email es requerido." data-val="true"' +
                                        'data-val-email="Formato de email inválido.">' +
                                    '<div class="form-error"><span data-valmsg-replace="true" data-valmsg-for="Email" class="field-validation-valid"></span></div>' +
                                '</div>' +
                                '<div class="form-group">' +
                                    // '<label for="MobilePhone">Teléfono móvil</label>' +
                                    '<input type="number" class="styled-input" placeholder="Teléfono móvil a 10 dígitos" name="MobilePhone" id="MobilePhone" data-val="true"' +
                                        'data-val-digits="Teléfono móvil sólo puede contener dígitos" data-val-length="Teléfono móvil a 10 dígitos" data-val-length-min="10" data-val-length-max="10">' +
                                    '<div class="form-error"><span data-valmsg-replace="true" data-valmsg-for="MobilePhone" class="field-validation-valid"></span></div>' +
                                '</div>' +
                                '<div class="form-group">' +
                                    // '<label for="Type">Típo de residente</label>' +
                                    '<select class="styled-input" name="Type" id="Type" data-val="true" data-val-required="Típo de residente es requerido.">' +
                                        '<option value="">-- Selecciona típo de residente --</option>' +
                                        '<option value="0">Primario</option>' +
                                        '<option value="1">Secundario</option>' +
                                    '</select>' +
                                    '<div class="form-error"><span data-valmsg-replace="true" data-valmsg-for="Type" class="field-validation-valid"></span></div>' +
                                '</div>' +
                                '<button type="submit" data-loading-text="<i></i> Cargando..." class="btn btn-icon btn-block btn-success btn-block"><i></i>' + submitText + '</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                // '<div class="row">' +
                //     '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-3">' +
                //     '</div>' +
                // '</div>' +
            '</form>' +
        '</div>'
}

app.Resident.RenderPasswordChange = function () {

    app.UpdateTitle('Cambio de contraseña', 'fa fa-barcode')

    app.UpdateBreadCrumbs([
        { Url: '#/password-change', Text: 'Cambio de contraseña' },
    ])

    $('.side-menu li').removeClass('active')

    app.Sammy.swap(app.Reset)

    var html = app.Resident.GetPasswordChangeFormHtml('password-change-form')

    app.Sammy.swap('<div id="password-bubble">' + html + '</div>', function () {
        var form = $('#password-change-form')
        form.removeData('validator')
        form.removeData('unobtrusiveValidation')
        $.validator.unobtrusive.parse(form)
        $("#OldPassword").select()
        app.RegisterPasswordEvents()
    })
}

app.Resident.GetPasswordChangeFormHtml = function (id) {
    return '' +
        '<form method="POST" id="' + id + '">' +
            '<div class="validation-list-container"></div>' +
            '<div class="row">' +
                '<div class="col-md-6">' +
                    '<div class="widget">' +
                        '<div class="widget-body">' +
                            '<div class="form-group">' +
                                '<label for="OldPassword">Contraseña anterior</label>' +
                                '<input type="password" class="form-control" placeholder="Contraseña anterior" name="OldPassword" id="OldPassword" data-val-required="Contraseña anterior es requeridas." data-val="true">' +
                                '<div class="form-error"><span data-valmsg-replace="true" data-valmsg-for="OldPassword" class="field-validation-valid"></span></div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<label for="NewPassword">Nueva contraseña</label>' +
                                '<input type="password" class="form-control" placeholder="Nueva contraseña" name="NewPassword" id="NewPassword" data-val-required="Nueva contraseña es requeridas." data-val="true" >' +
                                '<div class="form-error"><span data-valmsg-replace="true" data-valmsg-for="NewPassword" class="field-validation-valid"></span></div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<label for="ConfirmNewPassword">Confirmar nueva contraseña</label>' +
                                '<input type="password" class="form-control" placeholder="Confirmar nueva contraseña" id="ConfirmNewPassword" data-val-required="Confirmar nueva contraseña es requeridos." data-val="true" data-val-equalto-other="NewPassword" data-val-equalto="Las contraseñas no coinciden.">' +
                                '<div class="form-error"><span data-valmsg-replace="true" data-valmsg-for="ConfirmNewPassword" class="field-validation-valid"></span></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<div class="col-md-2">' +
                    '<button type="submit" data-loading-text="<i></i> Cargando..." class="btn btn-icon btn-block btn-success glyphicons circle_ok"><i></i>Cambiar contraseña</button>' +
                '</div>' +
                '<div class="col-md-2">' +
                    '<a href="#/perfil" class="btn btn-icon btn-block btn-default glyphicons circle_remove"><i></i> Cancelar</a>' +
                '</div>' +
            '</div>' +
        '</form>'
}

// Board Members module
app.Resident.RenderBoardMembers = function () {
    $('#brand').text('Comité')
    app.hideTabs()

    // app.UpdateTitle('Mesa directiva', 'fa fa-group')

    // app.UpdateBreadCrumbs([
    //     { Url: '#/comite', Text: 'Mesa directiva' },
    // ])

    // $('.side-menu li').removeClass('active')
    // $('#settlement-menu').addClass('active')

    app.Sammy.swap(app.Reset)

    var listItems = ''
    var html = ''
    $.getJSON(app.BaseUrl + 'api/resident/board-members/', function (response) {
        
        if (response.Items.length > 0) {
            var mobilePhone = ''
            $.each(response.Items, function (i, obj) {
                mobilePhone = obj.MobilePhone.replace(/\(|\)|\s|-/g,'')
                listItems += '' +

                    '<div class="member-row col-xs-12 col-sm-6 col-md-4 col-lg-3">' +
                        '<div class="row" style="height: inherit;">' +
                            '<div class="col-xs-5 col-sm-5 col-md-5 col-lg-5" style="height:inherit; display:table;">' +
                                '<span class="span-vcenter">' +
                                    '<div class="thumbnail">' +
                                        '<img class="img-responsive" alt="avatar"  src="' + app.BaseUrl + '/content/images/uploads/' + obj.Photo + '">' +
                                    '</div>' +
                                '</span>' +
                            '</div>' +
                            '<div class="col-xs-7 col-sm-7 col-md-7 col-lg-7" style="height:inherit">' +
                                '<div class="member-info col-xs-12 col-sm-12 col-md-12 col-lg-12">' +
                                    '<span class="span-vcenter">' +
                                        '<h4 class="board-name text-primary">' + obj.Name + ' ' + (obj.FirstLastName ? obj.FirstLastName : '') + '</h4>' +
                                        '<div class="board-members">' +
                                            '<div class="role fontmd">' + obj.Role + '</div>' +
                                            '<div class="email fontsm">' + obj.Email + '</div>' +
                                        '</div>' +
                                    '</span>' +
                                '</div>' +
                                '<div class="member-info col-xs-12 col-sm-12 col-md-12 col-lg-12" style="text-align:center;">' +
                                    '<span class="span-vcenter">' +
                                        '<i class="text-success fontxxxlg phonecall fa fa-phone fa-2x" data-phone="' + mobilePhone + '"></i>' +
                                    '</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
            })

            html += '<div class="nopad-nomar col-xs-12 col-sm-12 col-md-12 col-lg-12" style="background:white">'
            html +=     listItems
            html += '</div>'
        }
        else {
            html = "<div class='not-found col-xs-12 col-sm-12 col-md-12 col-lg-12'>"
            html += "   <span class='span-vcenter'>"
            html += "       <p class='not-found-icon'><i class='fa fa-info-circle fa-5x'></i></p>"
            html += "       <p class='not-found-text fontlg'>No se han agregado miembros al comité.</p>"
            html += "   </span>"
            html += "</div>"
        }

        

    }).done(function () {
        // app.Sammy.swap('<div class="col-xs-12" style="padding: 10px 0px 10px 0px;">' + listItems + '</div>', function () {
        app.Sammy.swap(html, function () {
            app.ShowBack('#/panel');
        })
    })
}

// Reservations / Event area module
app.Resident.RenderReservations = function () {
    app.hideTabs()
    $('#brand').text('Áreas comunes')

    app.Sammy.swap(app.Reset)

    var reservationsRequest = $.getJSON(app.BaseUrl + 'api/resident/reservations/')
    var eventAreasRequest =  $.getJSON(app.BaseUrl + 'api/resident/event-areas/')

    $.when(reservationsRequest, eventAreasRequest).done(function () {
        
        var day = ''
        var month = ''
        var hour = ''

        var pendingReservations = reservationsRequest.responseJSON.PendingReservations
        var pastReservations = reservationsRequest.responseJSON.PastReservations
        var eventAreas = eventAreasRequest.responseJSON.Items

        var PendingReservations = ''
        var PastReservations = ''
        var areasComunes = ''

        if (pendingReservations.length > 0) {
            PendingReservations += "<div class=\"row\">";
            PendingReservations += "    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 reservas-title\" style='margin-bottom:0px'>";
            PendingReservations += "        MIS RESERVAS";
            PendingReservations += "    <\/div>";
            PendingReservations += "<\/div>";
            PendingReservations += "<div id='row-container'>";
            $.each(pendingReservations, function (i, obj) {
                day = moment(obj.StartDate).format('DD')
                month = moment(obj.StartDate).format('MMM')
                hour = moment(obj.StartDate).format('HH:mm a')

                PendingReservations += "<div class=\"row reservas-row\">";
                PendingReservations += "    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='height:inherit; padding:0px'>";
                PendingReservations += "        <div class=\"col-xs-2 col-sm-2 col-md-1 col-lg-1 reservas-date\">";
                PendingReservations += "            <span class='span-vcenter' style='text-align:center'>";
                PendingReservations += "                <p class='reservas-day fontxxxlg'>" + day + "<\/p>";
                PendingReservations += "                <p class='reservas-month fontmd'>" + month + "<\/p>";
                PendingReservations += "            <\/span>";
                PendingReservations += "        <\/div>";
                PendingReservations += "        <div class=\"col-xs-6 col-sm-7 col-md-7 col-lg-7 reservas-row-content\">";
                PendingReservations += "            <span class='span-vcenter'>";
                PendingReservations += "                <div class=\"row\">";
                PendingReservations += "                    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">";
                PendingReservations += "                        <div class=\"row\">";
                PendingReservations += "                            <strong>" + obj.EventArea.Name + "<\/strong> <small style='color:#b0b0b0'>(" + hour + ")<\/small>";
                PendingReservations += "                        <\/div>";
                PendingReservations += "                        <div class=\"row\">";
                PendingReservations += "                            <p class='reservas-row-by fontsm'>Por " + (obj.Name == app.UserName ? 'mí' : obj.FirstName) + "<\/p>";
                PendingReservations += "                        <\/div>";
                PendingReservations += "                    <\/div>";
                PendingReservations += "                <\/div>";
                PendingReservations += "            <\/span>";
                PendingReservations += "        <\/div>";
                PendingReservations += "        <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2 reservas-row-price fontlg\">";
                PendingReservations += "            <span class='span-vcenter'>";
                PendingReservations += "                " + obj.EventArea.Price + "";
                PendingReservations += "            <\/span>";
                PendingReservations += "        <\/div>";
                PendingReservations += "        <div class=\"col-xs-2 col-sm-1 col-md-1 col-lg-1 reservas-row-icon fontxlg\">";
                PendingReservations += "            <span class='span-vcenter'>";
                PendingReservations += "                <i class=\"fa fa-check-circle-o\"><\/i>";
                PendingReservations += "            <\/span>";
                PendingReservations += "        <\/div>";
                PendingReservations += "    <\/div>";
                PendingReservations += "<\/div>";
            })
            PendingReservations += "<\/div>";
        }else{
            PendingReservations += "<div class='not-found col-xs-12 col-sm-12 col-md-12 col-lg-12' style='padding-top:20px; padding-bottom:20px'>"
            PendingReservations += "   <span class='span-vcenter'>"
            PendingReservations += "       <p class='not-found-icon'><i class='fa fa-info-circle fa-5x'></i></p>"
            PendingReservations += "       <p class='not-found-text fontlg'>No tienes reservas pendientes.</p>"
            PendingReservations += "   </span>"
            PendingReservations += "</div>"
        }

    
        if (pastReservations.length > 0) {
            PastReservations += "<div class=\"row\" style='margin:0px'>";
            PastReservations += "   <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 reservas-anteriores\">";
            PastReservations += "       <span class='span-vcenter'>";
            PastReservations += "           <p style='margin:0px'>RESERVAS ANTERIORES";
            PastReservations += "           <span class='pull-right' style='padding-right:5px'><i class=\"arrow fa fa-angle-down fa-lg\"><\/i><\/span><\/p>";
            PastReservations += "       <\/span>";
            PastReservations += "   <\/div>";
            PastReservations += "<\/div>";
            PastReservations += "<div id='reservas-anteriores' style='display:none'>";
            $.each(pastReservations, function (i, obj) {
                day = moment(obj.StartDate).format('DD')
                month = moment(obj.StartDate).format('MMM')
                hour = moment(obj.StartDate).format('HH:mm a')

                PastReservations += "<div class=\"row reservas-row\" style='margin:0px'>";
                PastReservations += "   <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='height:inherit; padding:0px'>";
                PastReservations += "       <div class=\"col-xs-2 col-sm-2 col-md-1 col-lg-1 reservas-date\">";
                PastReservations += "           <span class='span-vcenter' style='text-align:center'>";
                PastReservations += "               <p class='reservas-day fontxxxlg'>" + day +"<\/p>";
                PastReservations += "               <p class='reservas-month fontmd'>" + month +"<\/p>";
                PastReservations += "           <\/span>";
                PastReservations += "       <\/div>";
                PastReservations += "       <div class=\"col-xs-6 col-sm-7 col-md-7 col-lg-7 reservas-row-content\">";
                PastReservations += "           <span class='span-vcenter'>";
                PastReservations += "               <div class=\"row\">";
                PastReservations += "                   <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">";
                PastReservations += "                       <div class=\"row\">";
                PastReservations += "                           <strong>" + obj.EventArea.Name + "<\/strong> <small style='color:#b0b0b0'>(" + hour + ")<\/small>";
                PastReservations += "                       <\/div>";
                PastReservations += "                       <div class=\"row\">";
                PastReservations += "                           <p class='reservas-row-by fontsm'>Por " + (obj.Name == app.UserName ? 'mí' : obj.FirstName) + "<\/p>";
                PastReservations += "                       <\/div>";
                PastReservations += "                   <\/div>";
                PastReservations += "               <\/div>";
                PastReservations += "           <\/span>";
                PastReservations += "       <\/div>";
                PastReservations += "       <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2 reservas-row-price fontlg\">";
                PastReservations += "           <span class='span-vcenter'>";
                PastReservations += "               " + obj.EventArea.Price + "";
                PastReservations += "           <\/span>";
                PastReservations += "       <\/div>";
                PastReservations += "       <div class=\"col-xs-2 col-sm-1 col-md-1 col-lg-1 reservas-row-icon fontxlg\">";
                PastReservations += "           <span class='span-vcenter'>";
                PastReservations += "               <i class=\"fa fa-check-circle-o\"><\/i>";
                PastReservations += "           <\/span>";
                PastReservations += "       <\/div>";
                PastReservations += "   <\/div>";
            PastReservations += "<\/div>";
            })
            PastReservations += "<\/div>";
        }

        if (eventAreas.length > 0) {
            $.each(eventAreas, function (i, obj) {

                areasComunes += "<div class=\"col-xs-12 col-sm-12 col-md-6 col-lg-4 event-box\" data-target='#/area-comun/" + obj.EventAreaId + "'>";
                areasComunes += "    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 event-box-inner\">";
                areasComunes += "        <div style='position:relative; padding-top:7.5px'>";
                areasComunes += "            <img class='img-responsive imagen' src='" + app.BaseUrl + '/content/images/uploads/' + (obj.Image || 'imagenDefaultArea.png') + "'>";
                areasComunes += "            <div class='text-center fontlg price-tag'>";
                areasComunes += "                <span class='span-vcenter' style='padding-left:5px; padding-right:5px;'>";
                areasComunes += "                   <p class='nopad-nomar fontsm'>Reserva por<\/p>";
                areasComunes += "                   <p class='nopad-nomar'>" + obj.Price + "<\/p>";
                areasComunes += "                <\/span>";
                areasComunes += "            <\/div>";
                areasComunes += "        <\/div>";
                areasComunes += "        <div class='text-center' style='padding:7.5px'>";
                areasComunes += "            <p class='nomar fontmd fontbold'>" + obj.Name + "<\/p>";
                areasComunes += "            <p class='nomar fontmd' style='color:#bbb'>Capacidad máxima " + obj.MaxGuests + " invitados.<\/p>";
                areasComunes += "        <\/div>";
                areasComunes += "    <\/div>";
                areasComunes += "<\/div>";
            })
        } else {

            areasComunes = "<div class='not-found col-xs-12 col-sm-12 col-md-12 col-lg-12' style='position:fixed; padding-bottom:100px'>"
            areasComunes += "   <span class='span-vcenter'>"
            areasComunes += "       <p class='not-found-icon'><i class='fa fa-info-circle fa-5x'></i></p>"
            areasComunes += "       <p class='not-found-text fontlg'>No se han agregado areas comunes al fraccionamiento.</p>"
            areasComunes += "   </span>"
            areasComunes += "</div>"
        }

        var html="";
        html += "<div class=\"row\" style='margin:0px; height:inherit'>";

        html += "    <div class='fontbold color-emilenium'>";
        html += "        <div id='eventAreasTab' class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6 text-center e-tab e-tab-active\" href=\"#areas\" aria-controls=\"areas\" role=\"tab\" data-toggle=\"tab\" style='background:white'>";
        html += "            <span class='span-vcenter'>";
        html += "                <span>AREAS<\/span>";
        html += "            <\/span>";
        html += "        <\/div>";
        html += "        <div id='reservationsTab' class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6 text-center e-tab\" href=\"#reservations\" aria-controls=\"reservations\" role=\"tab\" data-toggle=\"tab\" style='background:white'>";
        html += "            <span class='span-vcenter'>";
        html += "                <span>RESERVAS<\/span>";
        html += "            <\/span>";
        html += "        <\/div>";
        html += "    <\/div>";
        html += "    <div class=\"tab-content\" style='height:inherit'>";
        html += "        <div id=\"areas\" role=\"tabpanel\" class=\"tab-pane fade in active\" style='height:inherit'>";
        html += "            <div class=\"row\" style='margin:0px; height:inherit'>";
        html +=                 areasComunes
        html += "            <\/div>";
        html += "        <\/div>";
        html += "        <div id=\"reservations\" role=\"tabpanel\" class=\"tab-pane fade\" style='height: inherit'>";
        html += "            <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='padding:7.5px; background:white'>";
        html +=                 PendingReservations
        html +=                 PastReservations
        html += "            <\/div>";
        html += "        <\/div>";
        html += "    <\/div>";
        html += "<\/div>";

        app.Sammy.swap(html, function () {

            app.ShowBack('#/panel');

            var eventAreasTab = $('#eventAreasTab')
            var reservationsTab = $('#reservationsTab')

            eventAreasTab.on('show.bs.tab', function (event) {
                eventAreasTab.toggleClass('e-tab-active')
                reservationsTab.toggleClass('e-tab-active')
            })

            reservationsTab.on('show.bs.tab', function (event) {
                eventAreasTab.toggleClass('e-tab-active')
                reservationsTab.toggleClass('e-tab-active')
            })

            app.Hammerify({
                id: 'areas',
                right: function (event) { reservationsTab.tab('show') },
                left: function (event) { reservationsTab.tab('show') }
            })

            app.Hammerify({
                id: 'reservations',
                left: function (event) { eventAreasTab.tab('show') },
                right: function (event) { eventAreasTab.tab('show') }
            })
        })    
    })
}

app.Resident.RenderReservation = function (eventAreaReservationId) {
    app.hideTabs()
    $('#brand').text('Reservaciones')
    // $('.side-menu li').removeClass('active')
    // $('#home-menu').addClass('active')

    app.Sammy.swap(app.Reset)

    $.getJSON(app.BaseUrl + 'api/resident/reservation/' + eventAreaReservationId + '/', function (eventAreaReservation) {

        if (eventAreaReservation.PaymentDate) {

            app.Sammy.swap('' +
                '<h3>Tu pago de ' + eventAreaReservation.EventArea.Price + ' (reservación de ' + eventAreaReservation.EventArea.Name + ') ha sido registrado. Gracias.</h3>' +
                '<br>' +
                '<br>' +
                '<a href="#/reservaciones">Regresar a mis reservaciones</a>')
            return
        }

        var html = '' +
            '<div class="row">' +
                '<div class="col-xs-12 col-sm-6 col-md-6 col-lg-4">' +
                    '<h4>Pago pendiente (' + eventAreaReservation.EventArea.Price + ').</h4>' +
                    '<button id="show-ezpendo-iframe"  class="btn btn-success btn-icon btn-block glyphicons circle_ok" ' +
                        'data-url="' + eventAreaReservation.EndPoint + eventAreaReservation.Token + '" ' +
                        'data-loading-text="<i></i>Cargando..."><i></i> Pagar ya</button>' +
                '</div>' +
            '</div>'

        app.Sammy.swap(html, function () {
            app.ShowBack('#/reservaciones');
            // app.UpdateTitle('Reservación de ' + eventAreaReservation.EventArea.Name, 'fa fa-clipboard')

            // app.UpdateBreadCrumbs([
            //     { Url: '#/reservaciones', Text: 'Reservaciones' },
            //     { Url: '#/reservacion/' + eventAreaReservationId, Text: 'Reservación de ' + eventAreaReservation.EventArea.Name },
            // ])
        })
    })
}

app.Resident.RenderEventArea = function (eventAreaId) {
    app.hideTabs()

    app.Sammy.swap(app.Reset)

    $.ajax({
        url: app.BaseUrl + 'api/resident/event-area/' + eventAreaId,
        type: 'GET',
        statusCode: {
            200: function (response) {
                

                $('#brand').html(response.Name)

                var html="";
                    // html += "<div class=\"row\" style='margin:0px; background:white; margin-bottom:52px; border-bottom:1px solid #ddd'>";
                    html += "<div class=\"row\" style='margin:0px; background:white; border-bottom:1px solid #ddd; position:fixed; left:0px; right:0px; top:53px; bottom:53px; overflow:auto'>";
                    html += "    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='margin:0px; padding:7.5px'>";
                    html += "        <div class=\"row\" style='padding:7.5px'>";
                    html += "            <div class=\"col-xs-2 col-sm-2 col-md-1 col-lg-1 text-center fontxlg\" style='color:#ddd'>";
                    html += "                <i class=\"fa fa-pencil-square-o\"><\/i>";
                    html += "            <\/div>";
                    html += "            <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\" style='text-align:justify'>";
                    html += "                <p class='fontbold nopad-nomar fontmd'>Descripción<\/p>";
                    html += "                <span id='description'>" + response.Description.removeMarkup() + "<\/span>";
                    html += "            <\/div>";
                    html += "        <\/div>";
                    html += "        <div class=\"row\" style='padding:7.5px'>";
                    html += "            <div class=\"col-xs-2 col-sm-2 col-md-1 col-lg-1 text-center fontxlg\" style='color:#ddd'>";
                    html += "                <i class=\"fa fa-users\"><\/i>";
                    html += "            <\/div>";
                    html += "            <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
                    html += "                <p class='fontbold nopad-nomar fontmd'>Capacidad máxima<\/p>";
                    html += "                <span id='capacity'>" + response.MaxGuests + "<\/span>";
                    html += "            <\/div>";
                    html += "        <\/div>";
                    html += "        <div class=\"row\" style='padding:7.5px'>";
                    html += "            <div class=\"col-xs-2 col-sm-2 col-md-1 col-lg-1 text-center fontxlg\" style='color:#ddd'>";
                    html += "                <i class=\"fa fa-usd\"><\/i>";
                    html += "            <\/div>";
                    html += "            <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
                    html += "                <p class='fontbold nopad-nomar fontmd'>Precio<\/p>";
                    html += "                <span id='price'>" + response.Price + "<\/span>";
                    html += "            <\/div>";
                    html += "        <\/div>";
                    html += "        <div class=\"row\" style='padding:7.5px'>";
                    html += "            <div class=\"col-xs-2 col-sm-2 col-md-1 col-lg-1 text-center fontxlg\" style='color:#ddd'>";
                    html += "                <i class=\"fa fa-clock-o\"><\/i>";
                    html += "            <\/div>";
                    html += "            <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
                    html += "                <p class='fontbold nopad-nomar fontmd'>Máximo de horas<\/p>";
                    html += "                <span id='hours'>" + response.Duration + "<\/span>";
                    html += "            <\/div>";
                    html += "        <\/div>";
                    html += "    <\/div>";
                    html += "    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='margin-top:7.5px'>";
                    html += "        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='border-bottom:1px solid #ddd; padding-left:0'>";
                    html += "            <p class='fontbold fontmd nopad-nomar'>RESERVAR<\/p>";
                    html += "        <\/div>";
                    html += "        <div class=\"row\">";
                    html += "            <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-4\" style='height:60px; display:table;'>";
                    html += "                <span class='span-vcenter'>";
                    html += "                    <p class='fontmd nopad-nomar'>Fecha<\/p>";
                    html += "                <\/span>";
                    html += "            <\/div>";
                    html += "            <div class=\"col-xs-10 col-sm-10 col-md-10 col-lg-8\" style='height:60px; display:table'>";
                    html += "                <span class='span-vcenter'>";
                    html += "                    <form id='event-area-reservation-form'>";
                    html += "                        <input type=\"hidden\" name=\"EventAreaId\" value='" + response.EventAreaId + "' \/>";
                    html += "                        <input id='booktime' type='datetime-local' class='styled-input' name='StartDate'>";
                    html += "                    <\/form>";
                    html += "                <\/span>";
                    html += "            <\/div>";
                    html += "        <\/div>";
                    html += "    <\/div>";
                    html += "<\/div>";
                    html += "<nav class=\"navbar navbar-default navbar-fixed-bottom\" id='book-area' style='height:52px;'>";
                    html += "    <div class=\"container-fluid div-table text-center\" style='color:white'>";
                    html += "        <span class=\"span-vcenter\" style='width:100%'>";
                    html += "            <div class=\"footer-total fontxlg\">Reservar <span class='pull-right'><i class=\"fa fa-angle-right fontxxxlg\"><\/i><\/span><\/div>";
                    html += "        <\/span>";
                    html += "    <\/div>";
                    html += "<\/nav>";

                app.Sammy.swap(html, function () {
                    app.ShowBack('#/reservaciones')
                })              
            },
            400: function (e) {
                app.getDoesntExistHTML('El area común que buscas no existe')

                app.Sammy.swap(app.DoesntExist, function () {
                    app.ShowBack('#/reservaciones');
                })
            }
        }
    })



    $.getJSON(app.BaseUrl + 'api/resident/event-area/' + eventAreaId, function (eventArea) {
                
    })
}

// Events module
app.Resident.RenderEvents = function () {
    app.hideTabs();
    $('#brand').text('Eventos')

    app.Sammy.swap(app.Reset)

    $.ajax({
        url: app.BaseUrl + 'api/resident/events/',
        type: 'GET',
        statusCode: {
            200: function (e) {
                
                var date = ''
                var status = ''

                var pendingEvents = ''
                    pendingEvents += "<div class='row' style='background:white; margin:0px'>";

                    $.each(e.PendingEvents, function (i, obj) {
                        date = moment(obj.StartDate)
                        switch(obj.Status){
                            case 0: status = '<img src="assets/img/circle.png" class="imgs-circle" />'; break
                            case 1: status = '<img src="assets/img/check.png" class="imgs-check" />'; break
                            case 2: status = '<img src="assets/img/cancel.png" class="imgs-cancel" />'; break
                        }
                        pendingEvents += "<div class=\"event-row col-xs-12 col-sm-12 col-md-12 col-lg-12\" data-id='" + obj.EventId + "'>";
                        pendingEvents += "    <div class=\"event-column centered-text col-xs-2 col-sm-2 col-md-1 col-lg-1\">";
                        pendingEvents += "        <span class='span-vcenter'>";
                        pendingEvents += "            <p class='news-day fontxxlg'>" + date.format('DD') + "<\/p>";
                        pendingEvents += "            <p class='news-month fontmd'>" + date.format('MMM') + "<\/p>";
                        pendingEvents += "        <\/span>";
                        pendingEvents += "    <\/div>";
                        pendingEvents += "    <div class=\"event-column col-xs-8 col-sm-8 col-md-10 col-lg-10\">";
                        pendingEvents += "        <span class='span-vcenter'>";
                        pendingEvents += "            <p class='fontmd nopad-nomar'><strong>" + obj.Title + "<\/strong><\/p>";
                        pendingEvents += "            <p class='nopad-nomar'><i class=\"fa fa-map-marker\"><\/i> " + obj.Location + "<\/p>";
                        pendingEvents += "        <\/span>";
                        pendingEvents += "    <\/div>";
                        pendingEvents += "    <div class=\"event-column centered-text col-xs-2 col-sm-2 col-md-1 col-lg-1\">";
                        pendingEvents += "        <span class='span-vcenter'>";
                        if (obj.ManageInvitations){
                            pendingEvents +=            status
                        }
                        pendingEvents += "        <\/span>";
                        pendingEvents += "    <\/div>";
                        pendingEvents += "<\/div>";
                    })

                    pendingEvents += "</div>";
                    


                var pastEvents="";
                if (e.PastEvents.length > 0){
                    pastEvents += "<a id='showPastEvents' class=\"a-nostyle\" data-toggle=\"collapse\" href=\"#pastEvents\" aria-expanded=\"false\" aria-controls=\"pastEvents\">";
                    pastEvents += "     <div class=\"row\" style='height:45px; margin:0px; border-bottom:1px solid #ddd;' id='showPastEvents-row'>";
                    pastEvents += "         <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='height:inherit;'>";
                    pastEvents += "             <div class=\"col-xs-2 col-sm-2 col-md-1 col-lg-1\" style=' height:inherit; display:table'>";
                    pastEvents += "                 <span class='span-vcenter'>";
                    pastEvents += "                 <\/span>";
                    pastEvents += "             <\/div>";
                    pastEvents += "             <div class=\"col-xs-8 col-sm-8 col-md-10 col-lg-10 centered-text fontlg\" style=' height:inherit; display:table'>";
                    pastEvents += "                 <span class='span-vcenter'>";
                    pastEvents += "                     Eventos pasados";
                    pastEvents += "                 <\/span>";
                    pastEvents += "             <\/div>";
                    pastEvents += "             <div class=\"col-xs-2 col-sm-2 col-md-1 col-lg-1 centered-text\" style=' height:inherit; display:table'>";
                    pastEvents += "                 <span class='span-vcenter'>";
                    pastEvents += "                     <i id='angleArrow' class='fa fa-angle-down fa-2x'></i>";
                    pastEvents += "                 <\/span>";
                    pastEvents += "             <\/div>";
                    pastEvents += "         <\/div>";
                    pastEvents += "     <\/div>";
                    pastEvents += "<\/a>";
                    pastEvents += "<div class='row' style='background:white; margin:0px'>";
                    pastEvents += "     <div class=\"collapse\" id=\"pastEvents\">";

                    $.each(e.PastEvents, function (i, obj) {
                        date = moment(obj.StartDate)
                        switch(obj.Status){
                            case 0: status = '<img src="assets/img/circle.png" class="imgs-circle" />'; break
                            case 1: status = '<img src="assets/img/check.png" class="imgs-check" />'; break
                            case 2: status = '<img src="assets/img/cancel.png" class="imgs-cancel" />'; break
                        }

                        
                        pastEvents += "         <div class=\"event-row col-xs-12 col-sm-12 col-md-12 col-lg-12\">";
                        pastEvents += "             <div class=\"div-table centered-text col-xs-2 col-sm-2 col-md-1 col-lg-1\">";
                        pastEvents += "                 <span class='span-vcenter'>";
                        pastEvents += "                     <p class='news-day fontxxlg'>" + date.format('DD') + "<\/p>";
                        pastEvents += "                     <p class='news-month fontmd'>" + date.format('MMM') + "<\/p>";
                        pastEvents += "                 <\/span>";
                        pastEvents += "             <\/div>";
                        pastEvents += "             <div class=\"div-table col-xs-8 col-sm-8 col-md-10 col-lg-10\">";
                        pastEvents += "                 <span class='span-vcenter text-ellipsis'>";
                        pastEvents += "                     <strong class='fontmd'>" + obj.Title + "<\/strong>";
                        pastEvents += "                     <p class='nopad-nomar'><i class=\"fa fa-map-marker\"><\/i> " + obj.Location + "<\/p>";
                        pastEvents += "                 <\/span>";
                        pastEvents += "             <\/div>";
                        pastEvents += "             <div class=\"div-table centered-text col-xs-2 col-sm-2 col-md-1 col-lg-1\">";
                        pastEvents += "                 <span class='span-vcenter'>";
                        pastEvents += "                 <\/span>";
                        pastEvents += "             <\/div>";
                        pastEvents += "         <\/div>";
                    })

                    pastEvents += "     <\/div>";
                    pastEvents += "<\/div>";
                }
                if (e.PendingEvents.length < 1){
                    pendingEvents = ""
                    if (e.PastEvents.length > 1){
                        pendingEvents += "<div class='row whitebg' style='margin:0px; border-bottom:1px solid #ddd'>"
                        pendingEvents += "  <div class='not-found col-xs-12 col-sm-12 col-md-12 col-lg-12' style='height:auto; padding-top:30px; padding-bottom:30px'>"
                    }else{
                        pendingEvents += "<div class='row whitebg' style='margin:0px; border-bottom:1px solid #ddd; height:inherit'>"
                        pendingEvents += "  <div class='not-found col-xs-12 col-sm-12 col-md-12 col-lg-12' style='height:inherit;'>"
                    }
                    pendingEvents += "     <span class='span-vcenter'>"
                    pendingEvents += "         <p class='not-found-icon'><i class='fa fa-info-circle fa-5x'></i></p>"
                    pendingEvents += "         <p class='not-found-text fontlg'>No hay eventos próximos en calendario.</p>"
                    pendingEvents += "     </span>"
                    pendingEvents += "  </div>"
                    pendingEvents += "</div>"
                }

                if (e.PastEvents.length < 1) pastEvents = ''
                
                var html="";
                    html +=     pendingEvents
                    html +=     pastEvents
                
                app.Sammy.swap(html, function () {
                    app.ShowBack('#/panel');
                })
            }
        }
    })


    // $.getJSON(app.BaseUrl + 'api/resident/events/', function (response) {
    //     var html = ""

    //     var events = ''

    //     var pastEvents = ''
    //     var date
    //     $.each(response.PastEvents, function (i, obj) {
            // date = moment(obj.StartDate)

            // pastEvents += "<div class=\"col-xs-12 col-sm-6 col-md-4 col-lg-3\" style='margin:7.5px 0px 7.5px 0px;'>";
            // pastEvents += "         <div class=\"row event\" style='margin:0px 0px 7.5px 0px;'>";
            // pastEvents += "             <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 event-title-row\">";
            // pastEvents += "                 <div class='event-title-div'><p class='event-title fontlg'>" + obj.Title + "<\/p><\/div>";
            // pastEvents += "                 <p class='event-place'>en " + obj.Location + "<\/p>";
            // pastEvents += "             <\/div>";
            // pastEvents += "             <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 event-content-row\">";
            // pastEvents += "                 <span class='span-vcenter'>";
            // pastEvents += "                     <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2\">";
            // pastEvents += "                         <i class=\"fa fa-fw fa-calendar fa-3x \"><\/i>";
            // pastEvents += "                     <\/div>";
            // pastEvents += "                     <div class=\"col-xs-10 col-sm-10 col-md-10 col-lg-10\" align='center'>";
            // pastEvents += "                         <p class='event-date fontlg'>" + date.format('DD/MMM/YYYY') + "<\/p>";
            // pastEvents += "                         <p class='event-time'>" + date.format('HH:mm') + "<\/p>";
            // pastEvents += "                     <\/div>";
            // pastEvents += "                 <\/span>";
            // pastEvents += "             <\/div>";
            // pastEvents += "             <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 event-status-row fontxxxlg\">";
            // pastEvents += "                 <span class='span-vcenter'>";
            //         switch (obj.Status) {
            //             case 1: pastEvents += '<i class="text-muted fa fa-check-circle" style="color: green;"></i> Aceptado'; break;
            //             default:
            //             case 2: pastEvents += '<i class="text-muted fa fa-times-circle" style="color: red;"></i> Rechazado'; break;
            //         }
            // // pastEvents += "                     " + (obj.Status == 2 ? '(rechazado)' : obj.Status == 1 ? '(aceptado)' : '') + "<i class=\"fa fa-check-circle\" style='color:#609450'><\/i> Aceptado";
            // pastEvents += "                 <\/span>";
            // pastEvents += "             <\/div>";
            // pastEvents += "             <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 event-show-more-row\">";
            // pastEvents += "                 <span class='span-vcenter'>";
            // pastEvents += "                     <a href='#/evento/" + obj.EventId + "' class=\"btn btn-default\" style='color:#7c7c7c;'><i class=\"fa fa-fw fa-calendar\"><\/i> Ver más<\/a>";
            // pastEvents += "                 <\/span>";
            // pastEvents += "             <\/div>";
            // pastEvents += "         <\/div>";
            // pastEvents += "     <\/div>";

            // pastEvents += "";
            // pastEvents += "<div class=\"col-xs-12 col-sm-6 col-md-4 col-lg-3 eventbox\" style='padding:10px'>";
            // pastEvents += "             <div class=\"row\" style='background: #4a8bc2; color:white!important; border-bottom:1px solid white; padding:5px 2px 5px 11px;'>";
            // pastEvents += "                 <span>" + obj.Title + ' ' + (obj.Status == 2 ? '(rechazado)' : obj.Status == 1 ? '(aceptado)' : '') + "<\/span>";
            // pastEvents += "             <\/div>";
            // pastEvents += "             <div class=\"row\" style='background: #4a8bc2; color:white!important'>";
            // pastEvents += "                 <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2\" style='display:table; text-align:center; height:50px'>";
            // pastEvents += "                     <span class='span-vcenter' style='height:50px'>";
            // pastEvents += "                         <i class=\"fa fa-fw fa-calendar fa-2x \"><\/i>";
            // pastEvents += "                     <\/span>";
            // pastEvents += "                 <\/div>";
            // pastEvents += "                 <div class=\"col-xs-10 col-sm-10 col-md-10 col-lg-10\" style='display:table; height:50px' >";
            // pastEvents += "                     <span class='span-vcenter'>";
            // pastEvents += "                         <p class='event-date'>" + date + "<\/p>";
            // pastEvents += "                         <p class='event-time'>" + datetime + "<\/p>";
            // pastEvents += "                     <\/span>";
            // pastEvents += "                 <\/div>";
            // pastEvents += "             <\/div>";
            // pastEvents += "             <div class=\"row\" style='background: #f9f9f9 !important; border-bottom:1px solid #ddd'>";
            // pastEvents += "                 <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2\" style='display:table; text-align:center; height:50px'>";
            // pastEvents += "                     <span class='span-vcenter' style='height:50px'>";
            // pastEvents += "                         <i class=\"fa fa-fw fa-map-marker fa-2x\"><\/i>";
            // pastEvents += "                     <\/span>";
            // pastEvents += "                 <\/div>";
            // pastEvents += "                 <div class=\"col-xs-10 col-sm-10 col-md-10 col-lg-10\" style='display:table; height:50px' >";
            // pastEvents += "                     <span class='span-vcenter'>";
            // pastEvents += "                         <p class='event-date'>" + obj.Location + "<\/p>";
            // pastEvents += "                     <\/span>";
            // pastEvents += "                 <\/div>";
            // pastEvents += "             <\/div>";
            // pastEvents += "             <div class=\"row event-lastrow\">";
            // pastEvents += "                 <div class='btn-group'>";
            // pastEvents += "                     <a href='#/evento/" + obj.EventId + "' class='btn btn-default' style='color:#000!important'>";
            // pastEvents += "                         <i class=\"fa fa-fw fa-calendar\"><\/i> Ver más";
            // pastEvents += "                     <\/a>";
            // pastEvents += "                 <\/div>";
            // pastEvents += "             <\/div>             ";
            // pastEvents += "         <\/div>";
        // })

        // var pendingEvents = ''
        // $.each(response.PendingEvents, function (i, obj) {
        //     date = moment(obj.StartDate)


        //     pendingEvents += "<div class=\"col-xs-12 col-sm-6 col-md-4 col-lg-3\" style='margin:7.5px 0px 7.5px 0px;'>";
        //     pendingEvents += "         <div class=\"row event\" style='margin:0px 0px 7.5px 0px;'>";
        //     pendingEvents += "             <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 event-title-row\">";
        //     pendingEvents += "                 <div class='event-title-div'><p class='event-title fontlg'>" + obj.Title + "<\/p><\/div>";
        //     pendingEvents += "                 <p class='event-place'>en " + obj.Location + "<\/p>";
        //     pendingEvents += "             <\/div>";
        //     pendingEvents += "             <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 event-content-row\">";
        //     pendingEvents += "                 <span class='span-vcenter'>";
        //     pendingEvents += "                     <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2\">";
        //     pendingEvents += "                         <i class=\"fa fa-fw fa-calendar fa-3x \"><\/i>";
        //     pendingEvents += "                     <\/div>";
        //     pendingEvents += "                     <div class=\"col-xs-10 col-sm-10 col-md-10 col-lg-10\" align='center'>";
        //     pendingEvents += "                         <p class='event-date fontxlg'>" + date.format('DD/MMM/YYYY') + "<\/p>";
        //     pendingEvents += "                         <p class='event-time'>" + date.format('HH:mm') + "<\/p>";
        //     pendingEvents += "                     <\/div>";
        //     pendingEvents += "                 <\/span>";
        //     pendingEvents += "             <\/div>";
        //     pendingEvents += "             <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 event-status-row fontxxxlg\">";
        //     pendingEvents += "                 <span class='span-vcenter'>";
        //             switch (obj.Status) {
        //                 case 2: pendingEvents += '<i class="text-muted fa fa-times-circle" style="color: red;"></i> Rechazado'; break;
        //                 case 1: pendingEvents += '<i class="text-muted fa fa-check-circle" style="color: green;"></i> Aceptado'; break;
        //                 default: pendingEvents += '<i class="text-muted fa fa-clock-o" style="color: #4a8bc2;"></i> Pendiente'; break;
        //             }
        //     // pendingEvents += "                     " + (obj.Status == 2 ? '(rechazado)' : obj.Status == 1 ? '(aceptado)' : '') + "<i class=\"fa fa-check-circle\" style='color:#609450'><\/i> Aceptado";
        //     pendingEvents += "                 <\/span>";
        //     pendingEvents += "             <\/div>";
        //     pendingEvents += "             <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 event-show-more-row\">";
        //     pendingEvents += "                 <span class='span-vcenter'>";
        //     pendingEvents += "                     <a href='#/evento/" + obj.EventId + "' class=\"btn btn-default\" style='color:#7c7c7c;'><i class=\"fa fa-fw fa-calendar\"><\/i> Ver más<\/a>";
        //     pendingEvents += "                 <\/span>";
        //     pendingEvents += "             <\/div>";
        //     pendingEvents += "         <\/div>";
        //     pendingEvents += "     <\/div>";

            // pendingEvents += "";
            // pendingEvents += "<div class=\"col-xs-12 col-sm-6 col-md-4 col-lg-3 eventbox\" style='padding:10px'>";
            // pendingEvents += "             <div class=\"row\" style='background: #4a8bc2; color:white!important; border-bottom:1px solid white; padding:5px 2px 5px 11px;'>";
            // pendingEvents += "                 <span>" + obj.Title + ' ' + (obj.Status == 2 ? '(rechazado)' : obj.Status == 1 ? '(aceptado)' : '') + "<\/span>";
            // pendingEvents += "             <\/div>";
            // pendingEvents += "             <div class=\"row\" style='background: #4a8bc2; color:white!important'>";
            // pendingEvents += "                 <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2\" style='display:table; text-align:center; height:50px'>";
            // pendingEvents += "                     <span class='span-vcenter' style='height:50px'>";
            // pendingEvents += "                         <i class=\"fa fa-fw fa-calendar fa-2x \"><\/i>";
            // pendingEvents += "                     <\/span>";
            // pendingEvents += "                 <\/div>";
            // pendingEvents += "                 <div class=\"col-xs-10 col-sm-10 col-md-10 col-lg-10\" style='display:table; height:50px' >";
            // pendingEvents += "                     <span class='span-vcenter'>";
            // pendingEvents += "                         <p class='event-date'>" + date + "<\/p>";
            // pendingEvents += "                         <p class='event-time'>" + datetime + "<\/p>";
            // pendingEvents += "                     <\/span>";
            // pendingEvents += "                 <\/div>";
            // pendingEvents += "             <\/div>";
            // pendingEvents += "             <div class=\"row\" style='background: #f9f9f9 !important; border-bottom:1px solid #ddd'>";
            // pendingEvents += "                 <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2\" style='display:table; text-align:center; height:50px'>";
            // pendingEvents += "                     <span class='span-vcenter' style='height:50px'>";
            // pendingEvents += "                         <i class=\"fa fa-fw fa-map-marker fa-2x\"><\/i>";
            // pendingEvents += "                     <\/span>";
            // pendingEvents += "                 <\/div>";
            // pendingEvents += "                 <div class=\"col-xs-10 col-sm-10 col-md-10 col-lg-10\" style='display:table; height:50px' >";
            // pendingEvents += "                     <span class='span-vcenter'>";
            // pendingEvents += "                         <p class='event-date'>" + obj.Location + "<\/p>";
            // pendingEvents += "                     <\/span>";
            // pendingEvents += "                 <\/div>";
            // pendingEvents += "             <\/div>";
            // pendingEvents += "             <div class=\"row event-lastrow\">";
            // pendingEvents += "                 <div class='btn-group'>";
            // pendingEvents += "                     <a href='#/evento/" + obj.EventId + "' class='btn btn-default' style='color:#000!important'>";
            // pendingEvents += "                         <i class=\"fa fa-fw fa-calendar\"><\/i> Ver más";
            // pendingEvents += "                     <\/a>";
            // pendingEvents += "                 <\/div>";
            // pendingEvents += "             <\/div>             ";
            // pendingEvents += "         <\/div>";
        // })
        
        // events = pendingEvents + pastEvents 
        
        
    // })
}

app.Resident.RenderEvent = function (eventId) {
    app.hideTabs();
    $('#brand').text('Eventos')

    app.Sammy.swap(app.Reset)

    $.ajax({
        url: app.BaseUrl + 'api/resident/event/' + eventId,
        type: 'GET',
        statusCode: {
            200: function (e) {
                
                var status
                switch(e.Status){
                    case 0: 
                        status = 'Pendiente';
                        break
                    case 1: status = 'Aceptado'; break
                    case 2: status = 'Rechazado'; break
                }

                var now = moment()

                var start = moment(e.StartDate)
                var end = moment(e.EndDate)

                var date = ''
                var time = ''
                
                var sameDay = now.isSame(start,'day')                
                
                if (sameDay) {
                    
                    var isBefore = now.isBefore(start)
                    var isAfter = now.isAfter(end)

                    if (isBefore) {
                        date = start.calendar().firstToUpper()
                        time = start.format('HH:mm [a ]') + end.format('HH:mm')
                    } else if (isAfter) {
                        date = end.fromNow()
                    } else {
                        date = 'En este momento'
                        time = start.format('HH:mm [a ]') + end.format('HH:mm')
                    }

                } else {
                    var difference = start.diff(now, 'days', true)
                    
                    if (difference > -7 && difference < 6.999) {

                        date = start.calendar().firstToUpper()
                        time = start.format('HH:mm [a ]') + end.format('HH:mm')
                    } else {

                        date = start.format('dddd ') + start.calendar()
                        time = start.format('HH:mm [a ]') + end.format('HH:mm')
                    }                           
                }

                var html="";
                    html += "<div id='event-container' class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='background:white; padding: 7.5px; border-bottom:1px solid #ddd'>";
                    html += "    <div class=\"row\" style='padding:7.5px'>";
                    html += "        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 centered-text\">";
                    html += "            <p class='fontbold fontlg'>" + e.Title + "<\/p>";
                    html += "        <\/div>"
                    html += "        <div class=\"centered-text fontxlg col-xs-2 col-sm-2 col-md-1 col-lg-1\" style='color:#ddd'>";
                    html += "            <i class=\"fa fa-calendar\"><\/i> ";
                    html += "        <\/div>";
                    html += "        <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
                    html += "            <p class='fontbold nopad-nomar fontmd'>Fecha<\/p>";
                    html += "            <span id='event-date'>" + date + "<\/span>";
                    html += "        <\/div>             ";
                    html += "    <\/div>";

                    if (!e.IsPastEvent){
                        html += "    <div class=\"row\" style='padding:7.5px'>";
                        html += "        <div class=\"centered-text fontxlg col-xs-2 col-sm-2 col-md-1 col-lg-1\" style='color:#ddd'>";
                        html += "            <i class=\"fa fa-clock-o\"><\/i> ";
                        html += "        <\/div>";
                        html += "        <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
                        html += "            <p class='fontbold nopad-nomar fontmd'>Hora<\/p>";
                        html += "            <span id='event-time'>" + time + "<\/span>";
                        html += "        <\/div>             ";
                        html += "    <\/div>";
                    }

                    html += "    <div class=\"row\" style='padding:7.5px'>";
                    html += "        <div class=\"centered-text fontxlg col-xs-2 col-sm-2 col-md-1 col-lg-1\" style='color:#ddd'>";
                    html += "            <i class=\"fa fa-map-marker\"><\/i> ";
                    html += "        <\/div>";
                    html += "        <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
                    html += "            <p class='fontbold nopad-nomar fontmd'>Lugar<\/p>";
                    html += "            <span id='event-place'>" + e.Location + "<\/span>";
                    html += "        <\/div>             ";
                    html += "    <\/div>";

                    if(e.ManageInvitations){
                        html += "    <div class=\"row\" style='padding:7.5px'>";
                        html += "        <div class=\"centered-text fontxlg col-xs-2 col-sm-2 col-md-1 col-lg-1\" style='color:#ddd'>";
                        html += "            <i class=\"fa fa-bell\"><\/i>";
                        html += "        <\/div>";
                        html += "        <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
                        html += "            <p class='fontbold nopad-nomar fontmd'>Status<\/p>";
                        html += "            <span id='event-status'>" + status + "<\/span>";
                        html += "        <\/div>             ";
                        html += "    <\/div>";

                        html += "    <div class=\"row\" style='padding:7.5px'>";
                        html += "        <div class=\"centered-text fontxlg col-xs-2 col-sm-2 col-md-1 col-lg-1\" style='color:#ddd'>";
                        html += "            <i class=\"fa fa-users\"><\/i>";
                        html += "        <\/div>";
                        html += "        <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
                        html += "            <p class='fontbold nopad-nomar fontmd'>Residentes confirmados<\/p>";
                        html += "            <span id='event-members'>" + (e.GoingMembers>0 ? e.GoingMembers : "Ninguno") + "<\/span>";
                        html += "        <\/div>";
                        html += "    <\/div>";
                    }

                    html += "    <div class=\"row\" style='padding:7.5px'>";
                    html += "        <div class=\"centered-text fontxlg col-xs-2 col-sm-2 col-md-1 col-lg-1\" style='color:#ddd'>";
                    html += "            <i class=\"fa fa-info-circle\"><\/i>";
                    html += "        <\/div>";
                    html += "        <div class=\"fontmd col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
                    html += "            <p class='nopad-nomar' id='event-description'>" + e.Body + "<\/span><\/p>";
                    html += "        <\/div>             ";
                    html += "    <\/div>";

                    if(e.ManageInvitations){
                        html += "    <nav class=\"navbar navbar-default navbar-fixed-bottom hidden\" id='nav-pendingevent' style='color:white'>";
                        html += "        <div id='event-accept' class=\"event-answer centered-text col-xs-6 col-sm-6 col-md-6 col-lg-6\" data-event-id='" + e.EventId + "' data-id='" + e.EventMembershipId + "' data-answer=\"true\" style='height:inherit; display: table; border-right:1px solid #ddd'>";
                        html += "            <span class=\"span-vcenter\">";
                        html += "                <i  class=\"fa fa-check fa-2x fa-fw\"><\/i>";
                        html += "            <\/span>";
                        html += "        <\/div>";
                        html += "        <div id='event-reject' class=\"event-answer centered-text col-xs-6 col-sm-6 col-md-6 col-lg-6\" data-event-id='" + e.EventId + "' data-id='" + e.EventMembershipId + "' data-answer=\"false\" style='height:inherit; display: table;'>";
                        html += "            <span class=\"span-vcenter\">";
                        html += "                <i class=\"fa fa-times fa-2x fa-fw\"><\/i>";
                        html += "            <\/span>";
                        html += "        <\/div>";
                        html += "    <\/nav>";
                    }

                    html += "<\/div>";



                // var confirmacion = ''
                // var asistencia = ''
                // if (event.Status == 1 || event.Status == 2) {
                //     switch (event.Status) {
                //         case 2: asistencia += '<i class="text-muted fa fa-times-circle" style="color: red;"></i> Rechazado'; break;
                //         case 1: asistencia += '<i class="text-muted fa fa-check-circle" style="color: green;"></i> Aceptado'; break;
                //         default: return;
                //     }
                // } else {
                //     if (!event.IsPastEvent){
                //         confirmacion += "<div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='margin-bottom:10px'>";
                //         confirmacion += "    <div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\" style='text-align:center'>";
                //         confirmacion += "        <button data-event-id='" + event.EventId + "' data-id='" + event.EventMembershipId + "' data-answer=\"true\" data-loading-text=\"<i><\/i> Cargando...\" class=\"event-answer btn btn-icon btn-success\"><i class=\"fa fa-check-circle\"><\/i> Aceptar<\/button>";
                //         confirmacion += "    <\/div>";
                //         confirmacion += "    <div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\" style='text-align:center'>";
                //         confirmacion += "        <button data-event-id='" + event.EventId + "' data-id='" + event.EventMembershipId + "' data-answer=\"false\" data-loading-text=\"<i><\/i> Cargando...\" class=\"event-answer btn btn-icon btn-danger\"><i class=\"fa fa-times-circle\"><\/i> Rechazar<\/button>";
                //         confirmacion += "    <\/div>";
                //         confirmacion += "<\/div>"
                //     }
                // }

                // var html="";
                //     html += "<div class=\"single-event col-xs-12 col-sm-12 col-md-12 col-lg-12\">";
                //     html += "    <div class=\"panel panel-default\">";
                //     html += "        <div class=\"panel-body\">";
                //     html += "            <div class=\"row\">";
                //     html += "                <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 reservas-warn\">";
                //     html += "                    <strong>" + event.Title + "<\/strong> "+asistencia+"";
                //     html += "                <\/div>";
                //     html += "            <\/div>";
                //     html += "            <div class=\"row\">";
                //     html += "                <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">";
                //     html += "                    " + event.Body + "";
                //     html += "                    <br>";
                //     html += "                    <br>";
                //     html += "                    <p class=\"pull-right\"><em>Horario de <strong>" + event.StartDate + "<\/strong> a <strong>" + event.EndDate + "<\/strong><\/em><\/p><br>";
                //     html += "                    ";
                //     html += "                <\/div>";
                //     html += "            <\/div>";
                //     html += "        <\/div>";
                //     html += "    <\/div>";
                //     html += "<\/div>";
                //     html += "</br>"+confirmacion+"";


                app.Sammy.swap(html, function () {
                    if ( e.Status == 0 ){
                        $('#event-container').css('margin-bottom','52px')
                        $('#nav-pendingevent').fadeIn(1000)
                    }
                    
                    app.ShowBack('#/eventos');
                })
            },
            400: function (response) {
                app.getDoesntExistHTML('El evento que buscas no existe')

                app.Sammy.swap(app.DoesntExist, function () {
                    app.ShowBack('#/eventos');
                })
            },
        }
    }).always(function () {
        app.Loading = false
    })

    // $.getJSON(app.BaseUrl + 'api/resident/event/' + eventId, function (event) {
    //     var confirmacion = ''
    //     var asistencia = ''
    //     if (event.Status == 1 || event.Status == 2) {
    //         switch (event.Status) {
    //             case 2: asistencia += '<i class="text-muted fa fa-times-circle" style="color: red;"></i> Rechazado'; break;
    //             case 1: asistencia += '<i class="text-muted fa fa-check-circle" style="color: green;"></i> Aceptado'; break;
    //             default: return;
    //         }
    //     } else {
    //         confirmacion += "<div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='margin-bottom:10px'>";
    //         confirmacion += "           <div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\" style='text-align:center'>";
    //         confirmacion += "               <button data-event-id='" + event.EventId + "' data-id='" + event.EventMembershipId + "' data-answer=\"true\" data-loading-text=\"<i><\/i> Cargando...\" class=\"event-answer btn btn-icon btn-success\"><i class=\"fa fa-check-circle\"><\/i> Aceptar<\/button>";
    //         confirmacion += "           <\/div>";
    //         confirmacion += "           <div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6\" style='text-align:center'>";
    //         confirmacion += "               <button data-event-id='" + event.EventId + "' data-id='" + event.EventMembershipId + "' data-answer=\"false\" data-loading-text=\"<i><\/i> Cargando...\" class=\"event-answer btn btn-icon btn-danger\"><i class=\"fa fa-times-circle\"><\/i> Rechazar<\/button>";
    //         confirmacion += "           <\/div>";
    //         confirmacion += "       <\/div>";
    //     }

    //     var html="";
    //         html += "<div class=\"single-event col-xs-12 col-sm-12 col-md-12 col-lg-12\">";
    //         html += "           <div class=\"panel panel-default\">";
    //         html += "               <div class=\"panel-body\">";
    //         html += "                   <div class=\"row\">";
    //         html += "                       <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 reservas-warn\">";
    //         html += "                           <strong>" + event.Title + "<\/strong> "+asistencia+"";
    //         html += "                       <\/div>";
    //         html += "                   <\/div>";
    //         html += "                   <div class=\"row\">";
    //         html += "                       <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">";
    //         html += "                           " + event.Body + "";
    //         html += "                           <br>";
    //         html += "                           <br>";
    //         html += "                           <p class=\"pull-right\"><em>Horario de <strong>" + event.StartDate + "<\/strong> a <strong>" + event.EndDate + "<\/strong><\/em><\/p><br>";
    //         html += "                           ";
    //         html += "                       <\/div>";
    //         html += "                   <\/div>";
    //         html += "               <\/div>";
    //         html += "           <\/div>";
    //         html += "       <\/div>";
    //         html += "       </br>"+confirmacion+"";


    //     app.Sammy.swap(html, function () {
    //         app.ShowBack();
    //         var clear = false
    //         var txt = ''

    //         switch (event.Status) {
    //             case 1: txt = 'Evento (aceptado)'; clear = true; break
    //             case 2: txt = 'Evento (rechazado)'; clear = true; break
    //         }

    //         if (clear) $('#event-answer-buttons-container').html('')
    //         txt = txt == '' ? 'Evento (pendiente)' : txt
    //     })
    // })
}

// News module
app.Resident.RenderNews = function () {
    app.hideTabs();
    $('#brand').text('Noticias')

    app.Sammy.swap(app.Reset)

    $.getJSON(app.BaseUrl + 'api/resident/news/', function (response) {
        
        var html = "<div class='not-found col-xs-12 col-sm-12 col-md-12 col-lg-12'>"
            html += "   <span class='span-vcenter'>"
            html += "       <p class='not-found-icon'><i class='fa fa-info-circle fa-5x'></i></p>"
            html += "       <p class='not-found-text fontlg'>No hay noticias. Las noticias sólamente pueden ser creadas por el administrador.</p>"
            html += "   </span>"
            html += "</div>"

        var buffer = ''
        var content =''
        // var month = ''
        var date
        $.each(response.Items, function (i, obj) {
            content = obj.Body.replace(/<(?:.|\n)*?>/gm, '');
            date = moment(obj.CreationDate)
            // month = obj.CreationDate.substring(3, 6)
            buffer += "";
            buffer += "<a class='a-nostyle' href='#/noticia/" + obj.NewId + "'>";
            buffer += " <div class='row new_row nopad-nomar' style='margin:0px;' > <!-- ADD new_row_r class and add news-title-r for already readed new  -->";
            buffer += "     <div class='col-xs-2 col-sm-2 col-md-1 col-lg-1 news-date' align='center'>";
            buffer += "         <span class='span-vcenter'>";
            buffer += "             <p class='news-day fontxxxlg'>" + date.format('DD') + "<\/p> <!-- Day (if 5th day turn 05 not 5) -->";
            buffer += "             <p class='news-month fontlg'>" + date.format('MMM') + "<\/p> <!-- Month (3 letters) -->";
            buffer += "         <\/span>";
            buffer += "     <\/div>";
            buffer += "     <div class='col-xs-9 col-sm-10 col-md-11 col-lg-11' style='padding:7.5px'>";
            buffer += "         <div class='row new-title-div fontmd'><span class='news-title'>" + obj.Title + "<\/span><\/div> <!-- Remove news-title class and add news-title-r for already new -->";
            buffer += "         <div class=\"row\">";
            buffer += "             <div class=\"fontsm ellipsis\"> <!-- Remove ellipsis class and add ellipsis-r for already readed new -->";
            buffer += "                 <div style='text-align:justify'>" + content + "<\/div> ";
            buffer += "             <\/div>";
            buffer += "         <\/div>";
            buffer += "     <\/div>";
            buffer += " <\/div>";
            buffer += "<\/a>";

            // buffer += '' +
            //     '<div class="col-xs-12 col-sm-12 col-md-6 col-md-4">' +
            //         '<div class="widget">' +
            //             '<div class="innerAll border-bottom" style="height: 85px;">' +
            //                 '<h4 class="text-primary">' + obj.Title + '</h4>' +
            //                 '<span class="text-muted">' + obj.CreationDate + '</span>' +
            //             '</div>' +
            //             '<div class="row row-merge bg-white">' +
            //                 '<div class="col-md-6">' +
            //                     '<span class="innerAll text-center display-block text-muted">' +
            //                         '<i class="fa fa-fw fa-group"></i> <strong>' + obj.Members + '</strong> Miembros' +
            //                     '</span>' +
            //                 '</div>' +
            //                 '<div class="col-md-6">' +
            //                     '<a href="#/noticia/' + obj.NewId + '" class="innerAll text-center display-block text-muted">' +
            //                         '<i class="fa fa-fw fa-plus"></i> Ver más' +
            //                     '</a>' +
            //                 '</div>' +
            //             '</div>' +
            //         '</div>' +
            //     '</div>'
        })

        if (response.Items.length > 0) { html = '<div class="container-fluid nopad-nomar" >' + buffer + '</div>' }

        app.Sammy.swap(html, function () {
            app.ShowBack('#/panel');
        })
    })
}

app.Resident.RenderNew = function (newId) {
    app.hideTabs();
    $('#brand').text('Noticias')

    app.Sammy.swap(app.Reset)
    $.ajax({
        url: app.BaseUrl + 'api/resident/new/' + newId,
        type: 'GET',
        statusCode: {
            200: function (_new) {
                var date = moment(_new.CreationDate)
                var html = '' +
                    '<div class="widget widget-body-white padding-none">' +
                        '<div class="widget-body padding-none">' +
                            '<div class="bg-gray innerAll">' +
                                '<div class="row">' +
                                    '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="text-align:justify">' +
                                        '<h4><strong>' + _new.Title +'</strong></h4>'+
                                        '<p class="fontsm"><em>' + date.format('DD/MMM/YYYY') + ' a las ' + date.format('HH:mm') +' hrs.</em></p>' +
                                        _new.Body +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                app.Sammy.swap(html, function () {
                    app.ShowBack('#/noticias');
                })
            },
            400: function (response) {
                app.getDoesntExistHTML('La noticia que buscas no existe')

                app.Sammy.swap(app.DoesntExist, function () {
                    app.ShowBack('#/noticias');
                })
            },
        }
    }).always(function () {
        app.Loading = false
    })
}

// Admin messages
app.Resident.RenderMessage = function (msgId) {
    app.hideTabs();
    $('#brand').text('Mensajes')

    app.Sammy.swap(app.Reset)

    $.ajax({
        url: app.BaseUrl + 'api/resident/admin-messages/' + msgId,
        type: 'GET',
        statusCode: {
            200: function (r) {
                var html = '' +
                    '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="padding-top:10px">' +
                        '<div class="widget widget-body-white padding-none">' +
                            '<div class="widget-body padding-none">' +
                                '<div class="bg-gray innerAll">' +
                                    '<div class="row">' +
                                        '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12" style="text-align:justify">' +
                                            '<h4><strong>' + r.Title + '</strong></h4>'+
                                            '<p class="fontsm"><em>' + r.CreationDate + '</em></p>' +
                                            r.Body +
                                            '<div style="width:100%; text-align:center">' +
                                                '<p><strong>' + r.Sender + '</strong></p>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>'
                    '</div>'

                app.Sammy.swap(html, function () {
                    app.ShowBack('#/notifications');
                })
            },
            400: function (response) {
                app.getDoesntExistHTML('El mensaje que buscas no existe')

                app.Sammy.swap(app.DoesntExist, function () {
                    app.ShowBack('#/notifications');
                })
            },
        }
    }).always(function () {
        app.Loading = false
    })
}








// Warranties module
app.Resident.RenderWarranties = function (warrantyId) {
    
    app.hideTabs()
    
    $('#brand').text('Garantías')
    
    app.Sammy.swap(app.Reset)

    var claimsRequest = $.getJSON(app.BaseUrl + 'api/resident/warranty-claims')
    var warrantiesRequest = $.getJSON(app.BaseUrl + 'api/resident/warranties')

    var errorMessage = function (message) {
        //var error = "<br>"
        //error += "<div class='row' style='margin: 0px'>"
        //error += "    <div class='not-found col-xs-12 col-sm-12 col-md-12 col-lg-12'>"
        //error += "       <span class='span-vcenter'>"
        //error += "           <p class='not-found-icon'><i class='fa fa-info-circle fa-5x'></i></p>"
        //error += "           <p class='not-found-text fontlg'>" + message + "</p>"
        //error += "       </span>"
        //error += "    </div>"
        //error += "</div>"

        var error = "<div style='position:fixed; height:100%; width:100%; top:50%; left:50%; margin-top:-50%; margin-left:-50%; text-align:center; display:table; padding:0 20px;'>"
        error += "     <span class='span-vcenter'>"
        error += "      <p class='not-found-icon'><i class='fa fa-info-circle fa-5x'></i></p>"
        error += "      <p class='not-found-text fontlg'>" + message + "</p>"
        error += "     </span>"
        error += "  </div>"

        return error
    }

    $.when(claimsRequest, warrantiesRequest).always(function () {
        
        var warrantiesHtml = ''
        var warrantyClaimsHtml = ''

        var warrantiesTemplate = function (warranties) {

            if (!warranties || !warranties.length) {
                warrantiesHtml = errorMessage('No se encontraron garantías')
                return
            }

            var getData = function (warranty) {

                if (warranty.RemainingDays > 1) {
                    return '' +
                    '<p style="display: none" class="nopad-nomar fontmd">' + warranty.RemainingDays + '</p>' +
                    '<p style="display: none" class="nopad-nomar fontxs" style="line-height:10px">días</p>'
                }
                else if (warranty.RemainingDays == 1)  {
                    return '' +
                    '<p style="display: none" class="nopad-nomar fontmd">1</p>' +
                    '<p style="display: none" class="nopad-nomar fontxs" style="line-height:10px">día</p>'
                } else  {
                    return ''
                }

            }

            $.each(warranties, function (i, obj) {
                
                var expirationDate = moment(obj.ExpirationDate).format('DD [de] MMMM [del] YYYY')

                warrantiesHtml += "<div class=\"row warranty-link warranty-row\" data-id='" + obj.WarrantyId + "'>";
                warrantiesHtml += "   <div class=\"col-xs-3 col-sm-3 col-md-2 col-lg-1 div-table\">";
                warrantiesHtml += "       <span class=\"span-vcenter chart\" data-percent='" + (obj.RemainingPercentage * -1 + 100) + "'>";
                warrantiesHtml += "           <div class='text-center days-left'>";
                warrantiesHtml += "               <span class='span-vcenter'>";
                warrantiesHtml += getData(obj)
                warrantiesHtml += "               <\/span>";
                warrantiesHtml += "           <\/div>";
                warrantiesHtml += "       <\/span>";
                warrantiesHtml += "   <\/div>";
                warrantiesHtml += "   <div class=\"warranty-info col-xs-7 col-sm-7 col-md-9 col-lg-10\">";
                warrantiesHtml += "       <span class='span-vcenter text-ellipsis'>";
                warrantiesHtml += "           <strong class='fontmd'>" + obj.Title + "<\/strong>";
                warrantiesHtml += "           <p class='nopad-nomar'>" + ( obj.RemainingDays>1 ? (obj.RemainingDays>1 ? 'Vence en ' + obj.RemainingDays + ' días' : 'Vence en 1 día') : 'Venció el ' + expirationDate ) + "<\/p>";
                warrantiesHtml += "       <\/span>";
                warrantiesHtml += "   <\/div>";
                warrantiesHtml += "   <div class=\"col-xs-2 col-sm-2 col-md-1 col-lg-1 div-table text-center\">";
                warrantiesHtml += "       <span class='span-vcenter'>";
                warrantiesHtml += "           <i class='fa fa-angle-right fa-2x'><\/i>";
                warrantiesHtml += "       <\/span>    ";
                warrantiesHtml += "   <\/div>";
                warrantiesHtml += "<\/div>";
            })

            warrantiesHtml = '<div class="row" style="margin:0px; pading-top: 30px;">' + warrantiesHtml + '</div>'
        }

        var warrantyClaimsTemplate = function (warrantyClaims) {

            if (!warrantyClaims || !warrantyClaims.length) {
                warrantyClaimsHtml = errorMessage('No se encontraron solicitudes de garantías')
                return
            }

            $.each(warrantyClaims, function (i, warrantyClaim) {

                var status = {}

                switch (warrantyClaim.Status) {
                    default:
                    case 0: status = { message: 'Pendiente', className: 'text-default', icon: 'fa fa-clock-o' }; break
                    case 1: status = { message: 'Aprobada', className: 'text-success', icon: 'fa fa-check' }; break
                    case 2: status = { message: 'Denegada', className: 'text-danger', icon: 'fa fa-times' }; break
                    case 3: status = { message: 'Finalizada', className: 'text-success', icon: 'fa fa-check-circle' }; break
                }

                var creationDate = moment(warrantyClaim.CreationDate)

                var endDate = ''
                if (warrantyClaim.EndDate) endDate = moment(warrantyClaim.EndDate)

                warrantyClaimsHtml += "<div class=\"row claim-link warranty-row\" data-id='" + warrantyClaim.WarrantyClaimId + "'>";
                warrantyClaimsHtml += "   <div class=\"col-xs-3 col-sm-3 col-md-3 col-lg-3 div-table\">";
                warrantyClaimsHtml += "       <span class='span-vcenter centered-text " + status.className + "'>";
                warrantyClaimsHtml += "           <i class='" + status.icon + "'></i> " + status.message;
                warrantyClaimsHtml += "       <\/span>";
                warrantyClaimsHtml += "   <\/div>";
                warrantyClaimsHtml += "   <div class=\"warranty-info col-xs-7 col-sm-7 col-md-7 col-lg-7\">";
                warrantyClaimsHtml += "       <span class='span-vcenter text-ellipsis'>";
                warrantyClaimsHtml += "           <strong class='fontmd'>" + warrantyClaim.WarrantyTitle + "<\/strong>";
                warrantyClaimsHtml += "           <p class='nopad-nomar fontxs' style='line-height:10px'>Solicitado el día: " + creationDate.format('LLLL') + "<\/p>";
                warrantyClaimsHtml += "       <\/span>";
                warrantyClaimsHtml += "   <\/div>";
                warrantyClaimsHtml += "   <div class=\"col-xs-2 col-sm-2 col-md-1 col-lg-1 div-table text-center\">";
                warrantyClaimsHtml += "       <span class='span-vcenter'>";
                warrantyClaimsHtml += "           <i class='fa fa-angle-right fa-2x'><\/i>";
                warrantyClaimsHtml += "       <\/span>";
                warrantyClaimsHtml += "   <\/div>";
                warrantyClaimsHtml += "<\/div>";
            })

            warrantyClaimsHtml = '<div class="row" style="margin:0px; pading-top: 30px;">' + warrantyClaimsHtml + '</div>'
        }


        warrantiesTemplate(warrantiesRequest.responseJSON.Items)
        warrantyClaimsTemplate(claimsRequest.responseJSON)

        var tabsHtml =
        '<div class="row whitebg" style="margin: 0px">' +
            '<div class="fontbold color-emilenium">' +
                '<div id="warrantiesTab" class="col-xs-6 col-sm-6 col-md-6 col-lg-6 text-center e-tab e-tab-active" href="#warranties" aria-controls="warranties" role="tab" data-toggle="tab" style="background:white">' +
                    '<span class="span-vcenter">' +
                       '<span>CONCEPTOS</span>' +
                   '</span>' +
                '</div>' +
                '<div id="claimsTab" class="col-xs-6 col-sm-6 col-md-6 col-lg-6 text-center e-tab" href="#claims" aria-controls="laims" role="tab" data-toggle="tab" style="background:white">' +
                    '<span class="span-vcenter">' +
                        '<span>SOLICITUDES</span>' +
                    '</span>' +
                '</div>' +
            '</div>' +
            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 padding-none whitebg">' +
                '<div class="tab-content">' +
                    '<div role="tabpanel" class="tab-pane fade in active" id="warranties">' +
                        warrantiesHtml +
                    '</div>' +
                    '<div role="tabpanel" class="tab-pane fade" id="claims">' +
                        warrantyClaimsHtml +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>'

        app.Sammy.swap('<div id="bubble">' + tabsHtml + '</div>', function () {

            app.ShowBack('#/panel')

            var warrantiesTab = $('#warrantiesTab')
            var claimsTab = $('#claimsTab')

            warrantiesTab.on('show.bs.tab', function (event) {
                warrantiesTab.toggleClass('e-tab-active')
                claimsTab.toggleClass('e-tab-active')
            })

            claimsTab.on('show.bs.tab', function (event) {
                warrantiesTab.toggleClass('e-tab-active')
                claimsTab.toggleClass('e-tab-active')
            })

            app.Hammerify({
                id: 'warranties',
                right: function (event) { claimsTab.tab('show') },
                left: function (event) { claimsTab.tab('show') }
            })

            app.Hammerify({
                id: 'claims',
                left: function (event) { warrantiesTab.tab('show') },
                right: function (event) { warrantiesTab.tab('show') }
            })

            var bubble = $('#bubble')

            bubble.on('click', '.claim-link', function (event) {
                window.location = '#/solicitudes-de-garantia/' + $(this).data('id')
            })

            bubble.on('click', '.warranty-link', function (event) {
                window.location = '#/garantia/' + $(this).data('id')
            })

            var getWarrantyColor = function (percentage){
               
               if (percentage == 0) {
                   return '#eee'    //none
               } else if(percentage < 10){
                   return '#bd362f' //red
               } else if(percentage > 60){
                   return '#609450' //green
               } else {
                   return '#4a8bc2' //blue
               }
            }

            $('.chart').each(function (i) {

                var chart = $(this)

                chart.find('p').show()

                chart.easyPieChart({
                   size: 50,
                   barColor: getWarrantyColor(chart.data('percent') * -1 + 100),
                   scaleLength: 0,
                   lineCap: 'round',
                   lineWidth: 4,
                   animate:{ duration: 1000, enabled:true}
                });
           })
        })
    })
}

app.Resident.RenderWarranty = function (warrantyId) {
    
    app.hideTabs()
    
    $('#brand').text('Garantías')
    
    app.Sammy.swap(app.Reset)

    var request = $.getJSON(app.BaseUrl + 'api/resident/warranty/' + warrantyId)

    request.done(function (warranty) {
        
        var template = function (warranty) {
            var expirationDate = moment(warranty.ExpirationDate)
            var expired = moment().isAfter(expirationDate)
            var remainingDays = '(' + warranty.RemainingDays + ' ' + (warranty.RemainingDays > 1 ? 'días restantes' : 'día restante') + ')'


            var html="";
            html += "<div id='bubble' class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='background:white; padding: 7.5px; border-bottom:1px solid #ddd; margin-bottom:52px'>";
            html += "    <div class=\"row\" style='padding:7.5px'>";
            html += "        <div class=\"centered-text fontlg col-xs-12 col-sm-12 col-md-12 col-lg-12\">";
            html += "            <p>" + warranty.Title + "<\/p> ";
            html += "        <\/div>";
            html += "        <div class=\"centered-text fontxlg col-xs-2 col-sm-2 col-md-1 col-lg-1\" style='color:#ddd'>";
            html += "            <i class=\"fa fa-calendar\"><\/i> ";
            html += "        <\/div>";
            html += "        <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
            html += "            <p class='fontbold nopad-nomar fontmd'>" + (expired ? 'Garantía expirada' : 'Fecha de expiración') + "<\/p>";
            html += "            <span id='expiration-date'>" + (expired ? ('Venció el ' + expirationDate.format('DD [de] MMMM [de] YYYY ')) : (expirationDate.format('DD [de] MMMM [de] YYYY ') + remainingDays)) + ".<\/span>";
            html += "        <\/div>             ";
            html += "    <\/div>";

            html += "    <div class=\"row\" style='padding:7.5px'>";
            html += "        <div class=\"centered-text fontxlg col-xs-2 col-sm-2 col-md-1 col-lg-1\" style='color:#ddd'>";
            html += "            <i class=\"fa fa-clock-o\"><\/i> ";
            html += "        <\/div>";
            html += "        <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\">";
            html += "            <p class='fontbold nopad-nomar fontmd'>Validéz de garantía<\/p>";
            html += "            <span id='warranty-duration'>" + warranty.ValidDays + " días.<\/span>";
            html += "        <\/div>             ";
            html += "    <\/div>";

            html += "    <div class=\"row\" style='padding:7.5px'>";
            html += "        <div class=\"centered-text fontxlg col-xs-2 col-sm-2 col-md-1 col-lg-1\" style='color:#ddd'>";
            html += "            <i class=\"fa fa-info-circle\"><\/i>";
            html += "        <\/div>";
            html += "        <div class=\"col-xs-10 col-sm-10 col-md-11 col-lg-11\" style='text-align: justify'>";
            html += "            <p id='warranty-description' class='nopad-nomar'>" + warranty.Description.removeMarkup() + "<\/span><\/p>";
            html += "        <\/div>";
            html += "    <\/div>";
            html += "    <div class=\"row\" style='padding:7.5px;'>";
            html += "        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 text-center fontxs\" style='font-style:italic; color:#bbb'>";
            html += "            <p id='warranty-warn' class='nopad-nomar'>Todas las garantías comienzan su vigencia en la fecha de entrega de la casa (" + app.SessionData.Resident.Lot.SaleDate + ")<\/span><\/p>";
            html += "        <\/div>";
            html += "    <\/div>";

            if (warranty.WarrantyClaimId) {

                html += "<nav class=\"navbar navbar-default navbar-fixed-bottom\" id='view-warranty-claim' style='height:52px;' data-id='" + warranty.WarrantyClaimId + "'>";
                html += "    <div class=\"container-fluid\" style='height:inherit; display: table; text-align:center; color:white'>";
                html += "        <span class=\"span-vcenter\" style='width:100%'>";
                html += "            <div class=\"fontxlg\">Ver solicitud &nbsp;<span class='pull-right'><i class=\"fa fa-angle-right fontxxxlg\"><\/i><\/span><\/div>";
                html += "        <\/span>";
                html += "    <\/div>";
                html += "<\/nav>";

            } else {

                html += "<nav class=\"navbar navbar-default navbar-fixed-bottom\" id='claim-warranty' style='height:52px;' data-id='" + warrantyId + "'>";
                html += "    <div class=\"container-fluid\" style='height:inherit; display: table; text-align:center; color:white'>";
                html += "        <span class=\"span-vcenter\" style='width:100%'>";
                html += "            <div class=\"fontxlg\">Solicitar garantía &nbsp;<span class='pull-right'><i class=\"fa fa-angle-right fontxxxlg\"><\/i><\/span><\/div>";
                html += "        <\/span>";
                html += "    <\/div>";
                html += "<\/nav>";

            }

            html += "<\/div>";
            return html
        }

        var html = template(warranty)

        app.Sammy.swap(html, function () {
            app.ShowBack('#/garantias')

            $('#claim-warranty').click(function (event) {
                window.location = '#/garantia/' + $(this).data('id') + '/solicitud'
            })

            $('#view-warranty-claim').click(function (event) {
                window.location = '#/solicitudes-de-garantia/' + $(this).data('id')
            })
        })
    })

    request.fail(function (response) {
        var error = "<div class='not-found col-xs-12 col-sm-12 col-md-12 col-lg-12'>"
        error += "   <span class='span-vcenter'>"
        error += "       <p class='not-found-icon'><i class='fa fa-info-circle fa-5x'></i></p>"
        error += "       <p class='not-found-text fontlg'>Por el momento no se han registrado garantías.</p>"
        error += "   </span>"
        error += "</div>"

        app.Sammy.swap(error, function () {
            app.ShowBack('#/panel')
        })
    })
}

app.Resident.ClaimWarranty = function (warrantyId, lotWarrantyId){
    // Flag to see if there are images to upload
    var uploadImages = Object.keys(app.Images.data.dict).length > 0

    var description = $('#claim-warranty-description').val()
    var anotation = $('#claim-warranty-anotations').val()

    if (description == ''){
        app.ShowAlert('Debe describir el problema.')
        return
    }

    if (anotation == ''){
        app.ShowAlert('Debe dejar al menos una anotación.')
        return
    }


    if(uploadImages){
        app.Images.formData = app.Images.data.safe()

        var imageUploadRequest = $.ajax({
            type: 'POST',
            url: app.BaseUrl + 'api/warranty/image/',
            mimeType: 'multipart/form-data',
            contentType: false,
            processData: false,
            data: app.Images.formData
        })

        $.when(imageUploadRequest).always(function () {

            if (imageUploadRequest.status != 200) {
                app.ShowErrors(JSON.parse(response.responseText).ModelState)
                return
            }

            var images = JSON.parse(imageUploadRequest.responseText)

            var data = { Annotations: anotation, Description: description, Images: images.Items }

            var warrantyClaimRequest =  $.ajax({
                type: 'POST',
                url: app.BaseUrl + 'api/resident/warrantyRequest/' + lotWarrantyId,
                contentType: 'application/json',
                data: JSON.stringify(data)
            })

            $.when(warrantyClaimRequest).always(function () {
                var response = warrantyClaimRequest.responseJSON

                if (warrantyClaimRequest.status != 200) {
                    app.ShowErrors(JSON.parse(response.responseText).ModelState)
                    return
                }

                clearObj(app.Images.formData)
                clearObj(app.Images.data.dict)
                window.location = '#/garantia/' + warrantyId
                app.ShowAlert('La garantía ha sido solicitada exitosamente. En breve nos comunicaremos con usted.')

                return
            })
        })
        return false

    }else{
        app.showConfirm('Es recomendable adjuntar fotos del problema. ¿Desea continuar sin adjuntar fotos?', ['OK','Cancelar'], function (index){
            if (index == 1){
                var data = { Annotations: anotation, Description: description, Images: [] }

                $.ajax({
                    type: 'POST',
                    url: app.BaseUrl + 'api/resident/warrantyRequest/' + lotWarrantyId,
                    contentType: 'application/json',
                    data: JSON.stringify(data),
                    statusCode: {
                        200: function (response) {
                            window.location = '#/garantia/' + warrantyId
                            app.ShowAlert('La garantía ha sido solicitada exitosamente. En breve nos comunicaremos con usted.')
                        },
                        400: function (response) {
                            app.ShowErrors(JSON.parse(response.responseText).ModelState)
                        },
                    },
                })
            }else{
                return
            }
        })
    }
}

app.Resident.RenderClaim = function (context) {

    var warrantyClaimId = context.params.id

    app.hideTabs()
    $('#brand').text('Solicitud de garantía')
    app.Sammy.swap(app.Reset)
    
    var warrantyClaimsRequest = $.get(app.BaseUrl + 'api/resident/warranty-claims/' + warrantyClaimId)

    warrantyClaimsRequest.done(function (warrantyClaim) {

        var endDate = moment(warrantyClaim.WarrantyEndDate)
        var creationDate = moment(warrantyClaim.CreationDate)

        var status = {}

        switch (warrantyClaim.Status) {
            case 0: status = { message: 'Solicitud pendiente', color: 'inherit', icon: 'fa fa-clock-o' }; break
            case 1: status = { message: 'Solicitud aprobada', color: app.Colors.Success, icon: 'fa fa-check' }; break
            case 2: status = { message: 'Solicitud denegada', color: app.Colors.Danger, icon: 'fa fa-times' }; break
            case 3: status = { message: 'Solicitud finalizada', color: app.Colors.Success, icon: 'fa fa-check-circle' }; break
        }

        var statusHtml =
        '<div class="row">' +
            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 centered-text">' +
                '<i style="color:' + status.color + '; font-size: 150px;" class="' + status.icon + '"></i>' +
                '<br>' +
                '<h3 style="color:' + status.color + '; font-size: 25px; font-weight: bold;">' + status.message + '</h3>' +
            '</div>' +
        '</div>'

        var thumbs = ''
        $.each(warrantyClaim.Images, function (i, warrantyClaimImage) {
            thumbs +=
            '<li class="col-xs-6 col-sm-6 col-md-4 col-lg-3">' +
                '<a class="thumb no-ajaxify centered-text" href="' + app.BaseUrl + '/content/images/uploads/' + warrantyClaimImage.Code + '" data-gallery="gallery">' +
                    '<img style="max-height: 200px" src="' + app.BaseUrl + '/content/images/uploads/' + warrantyClaimImage.Code + '" alt="photo">' +
                '</a>' +
                '<p class="centered-text">' +
                    '<button class="btn btn-danger btn-xs remove-image" data-id="' + warrantyClaimImage.WarrantyClaimImageId + '">Eliminar</button>' +
                '</p>' +
            '</li>'
        })

        var fileUploadHtml = ''
        if (!warrantyClaim.EndDate) {

            fileUploadHtml =
            '<input type="file" id="Image">' +
            '<div class="upload-progress" style="display: none">' + app.Reset + '</div>' +
            '<br>' +
            '<button class="btn btn-primary" id="upload-image" data-loading-text="Cargando..." ' +
                'data-id="' + warrantyClaim.WarrantyClaimId + '">Subir imagen</button><br><br>'
        }

        var html =
        '<div class="row whitebg" style="margin: 0px">' +
            '<div class="col-xs-12 col-sm-8 col-md-8 col-lg-8">' +
                '<div style="padding: 15px">' +
                    '<h3>' + warrantyClaim.WarrantyTitle + '</h3>' +
                    '<small>' + warrantyClaim.WarrantyDescription + '</small>' +
                    '<hr>' +
                    '<strong>Folio:</strong> ' + warrantyClaim.Folio + '<br>' +
                    '<strong>Duración:</strong> ' + warrantyClaim.WarrantyValidDays + ' días<br>' +
                    '<strong>Expiración:</strong> ' + endDate.format('LL') + '<br>' +
                    '<strong>Fecha de solicitud:</strong> ' + creationDate.format('LLLL') + '<br>' +
                    '<strong>Descripción del problema:</strong> ' + warrantyClaim.Description + '<br>' +
                    '<strong>Anotaciones:</strong> ' + warrantyClaim.Annotations + '<br>' +
                '</div>' +
            '</div>' +
            '<div class="col-xs-12 col-sm-4 col-md-4 col-lg-4 centered-text">' +
                '<div style="padding: 15px">' +
                    statusHtml +
                '</div>' +
            '</div>' +
            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">' +
                '<div style="padding: 15px">' +
                    fileUploadHtml +
                    '<div id="blueimp-gallery" class="blueimp-gallery blueimp-gallery-controls">' +
                        '<div class="slides"></div>' +
                        '<h3 class="title"></h3>' +
                        '<a class="prev no-ajaxify">‹</a>' +
                        '<a class="next no-ajaxify">›</a>' +
                        '<a class="close no-ajaxify">×</a>' +
                        '<a class="play-pause no-ajaxify"></a>' +
                        '<ol class="indicator"></ol>' +
                    '</div>' +
                    '<div class="gallery">' +
                        '<ul id="warranty-claim-images" class="row">' +
                            thumbs +
                        '</ul>' +
                    '</div>'
                '</div>' +
            '</div>' +
        '</div>'

        app.Sammy.swap(html, function () {

            app.ShowBack('#/garantias')

            $('#upload-image').on('click', function (event) {
                
                event.preventDefault()

                if (app.Loading) return false

                var button = $(event.currentTarget)

                var imagesContainer = $('#warranty-claim-images')

                var warrantyClaimId = button.data('id')

                var fileInput = $('#Image')

                var file = fileInput[0].files[0]

                if (!file || file.size == 0) { return false }

                if (file.size > 5000000) { alert('Maximo 5 megabytes.'); return false }

                button.button('loading')
                app.Loading = true

                var formData = new FormData()
                formData.append('Image', file)

                var progressDOM = $('.upload-progress')

                var tempImageRequest = $.ajax(app._getImageUploadObject(formData, progressDOM))

                tempImageRequest.done(function (response) {

                    app.ShowBack('#/garantias')

                    var jsonResponse = JSON.parse(response)

                    progressDOM.html(app.Reset)

                    var setImageRequest = $.ajax({
                        url: app.BaseUrl + 'api/resident/warranties/' + warrantyClaimId + '/image',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({ FileName: jsonResponse.FileName }),
                    })

                    setImageRequest.done(function (warrantyClaimImage) {

                        app.Loading = false
                        button.button('reset')

                        fileInput.replaceWith(fileInput.val('').clone(true))

                        progressDOM.css('display', 'none')

                        var imageHtml =
                        '<li class="col-xs-6 col-sm-6 col-md-4 col-lg-3">' +
                            '<a class="thumb no-ajaxify centered-text" href="' + app.BaseUrl + '/content/images/uploads/' + warrantyClaimImage.Code + '" data-gallery="gallery">' +
                                '<img style="max-height: 200px" src="' + app.BaseUrl + '/content/images/uploads/' + warrantyClaimImage.Code + '" alt="photo">' +
                            '</a>' +
                            '<p class="centered-text">' +
                                '<button class="btn btn-danger btn-xs remove-image" data-id="' + warrantyClaimImage.WarrantyClaimImageId + '">Eliminar</button>' +
                            '</p>' +
                        '</li>'

                        imagesContainer.append(imageHtml)
                    })

                    setImageRequest.fail(function (request) {
                        app.ShowErrorsAlert(JSON.parse(response.responseText).ModelState)
                        app.Loading = false
                        button.button('reset')
                    })
                })

                tempImageRequest.fail(function (response) {
                    app.ShowErrorsAlert(JSON.parse(response.responseText).ModelState)
                    app.Loading = false
                    button.button('reset')
                })

                return false
            })

            $('#warranty-claim-images').on('click', '.remove-image', function (event) {
                event.preventDefault()

                var result = confirm('¿Confirma eliminar? ¡La información no podra ser recuperada!')
                
                if (!result) return false

                var button = $(event.currentTarget)

                var warrantyClaimImageId = button.data('id')

                var deleteImageRequest = $.ajax({

                    url: app.BaseUrl + 'api/resident/warranties/images/' + warrantyClaimImageId,
                    type: 'DELETE',
                    contentType: 'application/json',
                })

                deleteImageRequest.done(function (response) {
                    button.closest('li').remove()
                })

                deleteImageRequest.fail(function (response) {
                    app.ShowErrorsAlert(JSON.parse(response.responseText).ModelState)
                })

                return false

            })
        })
    })

    warrantyClaimsRequest.fail(function () {

        var errorBody = 
        '<br><br>' +
        '<div class="row" style="margin: 0px;">' + 
            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">' +
                '<div class="center-block" style="width: 50%;">' +
                    '<img src="assets/img/logo3.png" class="img-responsive center-block">' +
                '</div>' +
                '<h3 class="centered-text">Solicitud no encontrada</h3>' + 
            '</div>' +
        '</div>'
        app.ShowBack('#/garantias')
        app.Sammy.swap(errorBody)
    })
}

app.Resident.RenderClaimPostForm = function (context) {

    var warrantyId = context.params.id

    $('#brand').text('Solicitud de garantía')
    app.hideTabs()
    app.Sammy.swap(app.Reset)
    
    var warrantyRequest = $.get(app.BaseUrl + 'api/resident/warranty/' + warrantyId)

    warrantyRequest.done(function (warranty) {

        var expirationDate = moment(warranty.ExpirationDate)
        var expired = false

        if (expirationDate.isBefore(moment())) expired = true

        var html =
        '<div class="row whitebg" style="margin: 0">' +
            '<div class="col-xs-12">' +
                '<div style="padding: 15px">' +
                    '<form id="post-warranty-claim-form">' +
                        '<input type="hidden" name="LotWarrantyId" value="' + warranty.LotWarrantyId + '">' +
                        '<label for="Description">Descripción del problema</label>' +
                        '<div class="form-group">' +
                            '<input type="text" class="form-control" name="Description" id="Description" ' +
                                'data-val-regex="Descripción contiene caractéres inválidos." data-val-regex-pattern="' + app.GetInputRegex() + '" ' +
                                'data-val="true" data-val-required="Descripción del problema es requerida.">' +
                            '<div class="form-error"><span data-valmsg-replace="true" data-valmsg-for="Description" class="field-validation-valid"></span></div>' +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label for="Annotations">Anotaciones</label>' +
                            '<input type="text" class="form-control" name="Annotations" id="Annotations" ' +
                                'placeholder="Pasar de lunes a viernes 10:00AM a 12:00PM" ' +
                                'data-val-regex="Anotaciones contiene caractéres inválidos." data-val-regex-pattern="' + app.GetInputRegex() + '" ' +
                                'data-val="true" data-val-required="Anotaciones son requeridas.">' +
                            '<div class="form-error"><span data-valmsg-replace="true" data-valmsg-for="Annotations" class="field-validation-valid"></span></div>' +
                        '</div>' +
                        '<br>' +
                        '<button type="submit" data-loading-text="Cargando..." autocomplete="off" class="btn btn-success">Enviar solicitud</button>' +
                    '</form>' +
                '</div>' +
            '</div>' +
            '<div class="col-xs-12">' +
                '<div style="padding: 15px">' +
                    '<hr>' +
                    '<h3>' + warranty.Title + '</h3>' +
                    (expired ?
                    '<p><strong>Garantía expirada</strong></p>' :
                    '<p>Duración: <strong>' + warranty.ValidDays + '</strong> días</p>') +
                    '<p>Fecha de expiración: ' + expirationDate.format('LL') + '</p>' +
                    '<p>' +
                        warranty.Description +
                    '</p>' +
                '</div>' +
            '</div>' +
        '</div>'

        app.Sammy.swap(html, function () {

            app.ShowBack('#/garantias')
            
            var form = $('#post-warranty-claim-form')
            $.validator.unobtrusive.parse(form)

            form.on('submit', function (event) {

                event.preventDefault()
                if (app.Loading) { return false; }

                var form = $(event.currentTarget)

                if (!form.valid()) {
                    return false
                }

                var btn = $('button[type="submit"]', form)
                var validator = form.data('validator')

                app.Loading = true
                btn.button('loading')

                var request = form.serializeObject()

                var warrantyClaimRequest = $.ajax({
                    type: 'POST',
                    url: app.BaseUrl + 'api/resident/warranties/' + request.LotWarrantyId + '/claim',
                    contentType: 'application/json',
                    data: JSON.stringify(request)
                })

                warrantyClaimRequest.done(function (warrantyClaim) {
                    window.location = '#/solicitudes-de-garantia/' + warrantyClaim.WarrantyClaimId
                })

                warrantyClaimRequest.fail(function () {
                    btn.button('reset')
                })

                warrantyClaimRequest.always(function () {
                    app.Loading = false
                })
            })

            $('#Description').select()
        })
    })

    warrantyRequest.fail(function (response) {
        var errorBody = 
        '<br><br>' +
        '<div class="row" style="margin: 0px;">' + 
            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">' +
                '<div class="center-block" style="width: 50%;">' +
                    '<img src="assets/img/logo3.png" class="img-responsive center-block">' +
                '</div>' +
                '<h3 class="centered-text">Garantía no encontrada</h3>' + 
            '</div>' +
        '</div>'
        app.ShowBack('#/garantias')
        app.Sammy.swap(errorBody)
    })
}






// Regulations module
app.Resident.RenderRegulations = function () {
    
    $('#brand').text('Reglamentos')
    app.hideTabs()
    app.Sammy.swap(app.Reset)

    var html = ''
    var items = ''

    var request = $.getJSON(app.BaseUrl + 'api/resident/regulations/')

    request.done(function (response) {
        
        $.each(response.Items, function (i, obj) {
            items +="";
            items += "<a class='a-nostyle regulation-row' href='#/reglamento/" + obj.RegulationId + "'>";
            items += "  <div class=\"reg-row row\" style='margin:0px'>";
            items += "      <div class='reg-content col-xs-10 col-sm-10 col-md-11 col-lg-11'>";
            items += "          <span class='span-vcenter'>";
            items += "              <p class='reg-title fontmd fontbold'>" + obj.Title + "<\/p>";
            items += "          <\/span>";
            items += "      <\/div>";
            items += "      <div class='reg-arrow col-xs-2 col-sm-2 col-md-1 col-lg-1'>";
            items += "          <span class='span-vcenter'>";
            items += "              <i class=\"fa fa-angle-right fa-2x\"><\/i>";
            items += "          <\/span>";
            items += "      <\/div>";
            items += "  <\/div>";
            items += "<\/a>";

        })

        if (!response.Items.length < 0){
            html = "<div class='not-found col-xs-12 col-sm-12 col-md-12 col-lg-12'>"
            html += "   <span class='span-vcenter'>"
            html += "       <p class='not-found-icon'><i class='fa fa-info-circle fa-5x'></i></p>"
            html += "       <p class='not-found-text fontlg'>Por el momento no se han agregado reglamentos.</p>"
            html += "   </span>"
            html += "</div>"
        } else {
            html = '<div class="container-fluid nopad-nomar whitebg">'
            html +=     items
            html += '</div>'
        }

        app.Sammy.swap(html, function () {
            app.ShowBack('#/panel')
        })
    })
    request.fail(function (response) {
        var errorBody = 
        '<br><br>' +
        '<div class="row" style="margin: 0px;">' + 
            '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">' +
                '<div class="center-block" style="width: 50%;">' +
                    '<img src="assets/img/logo3.png" class="img-responsive center-block">' +
                '</div>' +
                '<h3 class="centered-text">Solicitud no encontrada</h3>' + 
            '</div>' +
        '</div>'
        app.ShowBack('#/garantias')
        app.Sammy.swap(errorBody)
    })
}

app.Resident.RenderRegulation = function (regulationId) {
    app.hideTabs();
    app.Sammy.swap(app.Reset)

    $.ajax({
        url: app.BaseUrl + 'api/resident/regulation/' + regulationId,
        type: 'GET',
        statusCode: {
            200: function (r) {
                var lastupdate = moment(r.LastUpdateDate).format('DD/MMM/YYYY')
                var html = '' +
                    '<div class="widget widget-body-white padding-none whitebg">' +
                        '<div class="widget-body padding-none">' +
                            '<div class="innerAll">' +
                                '<div class="row">' +
                                    '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">' +
                                        '<h4><strong>' + r.Title + '</strong></h4>' +
                                        r.Body +
                                        '<p class="pull-right fontsm"><em>&Uacute;ltima modificación: ' + lastupdate + '</em></p>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>'
                app.Sammy.swap(html, function () {
                    app.ShowBack('#/reglamentos');
                })
            },
            400: function (response) {
                app.getDoesntExistHTML('El reglamento que buscas no existe')
                app.Sammy.swap(app.DoesntExist, function () {
                    app.ShowBack('#/reglamentos');
                })
            },
        }
    }).always(function () {
        app.Loading = false
    })
}

// Contact module
app.Resident.RenderContact = function () {
    $('#brand').text('Contacto')
    app.hideTabs()
    // app.UpdateTitle('Contacto', 'fa fa-envelope')

    // app.UpdateBreadCrumbs([
    //     { Url: '#/contacto/', Text: 'Contacto' },
    // ])

    // $('.side-menu li').removeClass('active')
    // $('#contact-menu').addClass('active')
    var html = "";
        html += "<div class=\"col-xs-12\" style=\"padding-top: 15px; padding-bottom:15px\">";
        html += "           <form id=\"contact-form\">";
        html += "               <legend>¿Tienes alguna queja o sugerencia?<\/legend>";
        html += "           ";
        html += "               <div class=\"form-group\">";
        html += "                   <textarea rows='5' placeholder=\"Escriba aquí su mensaje\" class=\"form-control\" id=\"Message\" name=\"Message\" data-val=\"true\" data-val-required=\"Mensaje es requerido.\" data-val-regex=\"Concepto contiene caractéres inválidos.\" data-val-regex-pattern='" + app.GetInputRegex() + "'><\/textarea>";
        html += "                   <div class=\"form-error\"><span data-valmsg-replace=\"true\" data-valmsg-for=\"Message\" class=\"field-validation-valid\"><\/span><\/div>";
        html += "               <\/div>";
        html += "               <button type=\"submit\" class=\"btn btn-primary btn-block\">Enviar<\/button>";
        html += "           <\/form>";
        html += "       <\/div>";
        html += "";
        html += "       <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='padding-bottom:15px'>";
        html += "           <div class=\"panel panel-default\">";
        if (app.SessionData.Settlement.SettlementId == 1){
        html += "               <div class='innerAll border-bottom'>";
        html += "                   <img class='center img-responsive img-clean' src='" + app.BaseUrl + "/content\/images\/uploads\/karen.jpg'>";
        html += "               <\/div>";
        }
        html += "               <div class=\"panel-body text-center\">";
        html += "                   <p class=\"lead strong margin-none\">" + app.SessionData.Settlement.ContactName + "<\/p>";
        html += "                   <p class=\"lead margin-none\">Atención a residentes<\/p>";
        html += "                   <p><\/p>";
        html += "                   <h5>" + app.SessionData.Settlement.ContactEmail + "<\/h5>";
        html += "                   <p><\/p><p><\/p>";
        html += "                   <h5>Tel. (662) " + app.SessionData.Settlement.Phone + "<\/h5>";
        html += "               <\/div>";
        html += "           <\/div>";
        html += "       <\/div>";

    app.Sammy.swap(html, function () {
        app.ShowBack('#/panel')
        var form = $('#contact-form')
        form.removeData('validator')
        form.removeData('unobtrusiveValidation')
        $.validator.unobtrusive.parse(form)
    })
}

// Payments module
app.Resident.RenderPayments = function (viewMode) {
    app.hideTabs()
    $('#brand').text('Pagos')

    app.Sammy.swap(app.Reset)

    // TODO: mencionar cual sera el siguiente pago si no hay pagos pendientes
    $.getJSON(app.BaseUrl + 'api/resident/payments', function (response) {
        
        var month
        // Legend to show if no pending payments
        var pendingPayments = "<div class='not-found col-xs-12 col-sm-12 col-md-12 col-lg-12' style='height:inherit'>"
            pendingPayments += "   <span class='span-vcenter'>"
            pendingPayments += "       <span class='text-success'><i class='fa fa-check-circle fa-5x'></i></span>"
            pendingPayments += "       <p class='not-found-text fontlg' style='padding-bottom:10px; margin-top:10px'>Hasta el momento no tienes pagos pendientes. Muchas gracias.</p>"
            pendingPayments += "   </span>"
            pendingPayments += "</div>"
        // var pendingPayments = '<div style="width:100%; text-align:center; padding-top:10px"><span class="text-success"><i class="fa fa-check-circle fa-5x"></i></span></div>'
        //     pendingPayments += '<div style="width:100%; text-align:center"><p class="not-found-text fontlg" style="padding-bottom:10px; margin-top:10px">Hasta el momento no tienes pagos pendientes. Muchas gracias.</p></div>'

        // Show if pending payments
        if (response.PendingPayments.length > 0) {
            pendingPayments = ''
            pendingPayments += "<div class=\"row whitebg\" style='margin:0px;'>";
            pendingPayments += "    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='padding-top:7.5px'>";
            pendingPayments += "        <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='padding:0px; border-bottom:1px solid #ddd;'>";
            pendingPayments += "            <p style='margin-bottom:0px;' id='cuotas-title'>SELECCIONE CUOTAS A PAGAR<\/p>";
            pendingPayments += "        <\/div>";
            pendingPayments += "    <\/div>";
            pendingPayments += "<\/div>";
            pendingPayments += "<div class='payment-container whitebg'>";

            $.each(response.PendingPayments, function (i, obj) {
                month = moment(obj.PayMonth).format('MMMM [del] YYYY')
                pendingPayments += "<div class=\"row row-pending selectable payment-item-row\">";
                pendingPayments += "    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='height:inherit'>";
                pendingPayments += "        <div class=\"col-xs-1 col-sm-1 col-md-1 col-lg-1 row-pending-content\">";
                pendingPayments += "            <span class='span-vcenter'>";
                pendingPayments += "                <input " + app.Resident._isInData(obj.ChargeItemId) + " class=\"payment-item\" type='checkbox' data-date='" + month + "' data-amount='" + obj.Amount_value + "' data-id='" + obj.ChargeItemId + "' >";
                pendingPayments += "            <\/span>";
                pendingPayments += "        <\/div>";
                pendingPayments += "        <div class=\"col-xs-9 col-sm-9 col-md-9 col-lg-9 row-pending-content\" >";
                pendingPayments += "            <span class='span-vcenter'>";
                pendingPayments += "                <p class='nopad-nomar pending-title'>Cuota de " + month + "<\/p>";
                pendingPayments += "            <\/span>";
                pendingPayments += "        <\/div>";
                pendingPayments += "        <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2 row-pending-content\">";
                pendingPayments += "            <span class='span-vcenter'>";
                pendingPayments += "                <p class='nopad-nomar pending-price'>" + accounting.formatMoney(obj.Amount,'$',0,',','') + "<\/p>";
                pendingPayments += "            <\/span>";
                pendingPayments += "        <\/div>";
                pendingPayments += "    <\/div>";
                pendingPayments += "<\/div>";
            })
            pendingPayments += "<\/div>";
            pendingPayments += "<div class=\"panel panel-default\" style='margin:0px; margin-bottom:7.5px' id='pay12'>";
            pendingPayments += "    <div class=\"panel-body\">";
            pendingPayments += "        <div class=\"col-xs-10 col-sm-10 col-md-10 col-lg-10\" style='display:table; height:30px'>";
            pendingPayments += "            <span class='span-vcenter'>";
            pendingPayments += "                <p style='margin:0px;'><strong>Paga 14 meses al precio de 12<\/strong><\/p>";
            pendingPayments += "            <\/span>";
            pendingPayments += "        <\/div>";
            pendingPayments += "        <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2\">";
            pendingPayments += "            <i class='fa fa-angle-right fa-2x'></i>";
            pendingPayments += "        <\/div>";
            pendingPayments += "    <\/div>";
            pendingPayments += "<\/div>";
        }
        
        // Legend to show if no collected payments
        var collectedPayments = '<div style="width:100%; text-align:center"><span class="text-danger"><i class="fa fa-times-circle fa-5x"></i></span></div>'
            collectedPayments += '<div style="width:100%; text-align:center"><p class="not-found-text fontlg" style="padding-bottom:10px; margin-top:10px">Hasta el momento no se ha registrado ningún pago.</p></div>'
        var PaymentDate
        // Show if collected payments

        $.each(response.CollectedPayments, function (i, obj){
            app.Payments.Collected[obj.ChargeItemId] = {'Payant':obj.PayantName, 'Date':obj.PaymentDate}
        })

        

        if (response.CollectedPayments.length > 0){
            response.CollectedPayments.reverse()

            collectedPayments = ''
            collectedPayments += "<div class=\"row whitebg\">";
            collectedPayments += "  <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\">";
            collectedPayments += "      <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='padding:0px; border-bottom:1px solid #ddd'>";
            collectedPayments += "          <p style='margin-bottom:5px;' id='cuotas-title'>CUOTAS<\/p>";
            collectedPayments += "      <\/div>";
            collectedPayments += "  <\/div>";
            collectedPayments += "<\/div>";
            collectedPayments += "<div class='payment-container whitebg'>";
            $.each(response.CollectedPayments, function (i, obj) {
                month = moment(obj.PayMonth).format('MMMM [del] YYYY')
                PaymentDate = moment(obj.PaymentDate).format('DD/MMM/YYYY')
                collectedPayments += "<div class=\"row row-paid\" data-id='" + obj.ChargeItemId + "'>";
                collectedPayments += "  <div class=\"col-xs-1 col-sm-1 col-md-1 col-lg-1 row-paid-content\">";
                collectedPayments += "      <span class='span-vcenter'>";
                collectedPayments += "          <i class=\"fa fa-check\" style='color:#6fc833'><\/i>";
                collectedPayments += "      <\/span>";
                collectedPayments += "  <\/div>";
                collectedPayments += "  <div class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6 row-paid-content\">";
                collectedPayments += "      <span class='span-vcenter'>";
                collectedPayments += "          <p class='nopad-nomar paid-title'>Cuota de " + month + "<\/p>";
                collectedPayments += "          <p class='nopad-nomar paid-date fontsm'>Fecha de pago: " + PaymentDate + "<\/p>";
                collectedPayments += "      <\/span>";
                collectedPayments += "  <\/div>";
                collectedPayments += "  <div class=\"col-xs-3 col-sm-3 col-md-3 col-lg-3 row-paid-content\">";
                collectedPayments += "      <span class='span-vcenter'>";
                collectedPayments += "          <p class='nopad-nomar paid-title'>" + obj.PayType + "<\/p>";
                collectedPayments += "          <p class='nopad-nomar paid-date fontsm'>Tipo de pago<\/p>";
                collectedPayments += "      <\/span>";
                collectedPayments += "  <\/div>";
                collectedPayments += "  <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2 row-paid-content\">";
                collectedPayments += "      <span class='span-vcenter'>";
                collectedPayments += "          <p class='nopad-nomar'><strong>" + accounting.formatMoney(obj.Amount,'$',0,',','') + "<\/strong><\/p>";
                collectedPayments += "      <\/span>";
                collectedPayments += "  <\/div>";
                collectedPayments += "<\/div>";
            })
            collectedPayments += "<\/div>";
        }
        
        var html="";
            if(response.PendingPayments.length > 0){
                html += "<div class='container-fluid nopad-nomar' >";
                html += "    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"  style='padding:10px;'>";
                html += "        <div role=\"tabpanel\">";
                html += "            <ul class=\"nav nav-tabs\" role=\"tablist\" style='font-weight:bold'>";
                html += "                <li class='tab-w50" + (viewMode === 'pending' ? ' active' : '') + "' role='presentation'><a href=\"#pending\" aria-controls=\"pending\" role=\"tab\" data-toggle=\"tab\"><i class=\"fa fa-fw fa-exclamation-circle\"><\/i> Pendientes<\/a><\/li>";
                html += "                <li class='tab-w50" + (viewMode === 'collected' ? ' active' : '') + "' role='presentation'><a href=\"#paid\" aria-controls=\"paid\" role=\"tab\" data-toggle=\"tab\"><i class=\"fa fa-fw fa-check-square-o\"><\/i> Realizados<\/a><\/li>";
                html += "            <\/ul>";
                html += "            <div class=\"tab-content\">";
                html += "                <div role=\"tabpanel\" class=\"tab-pane fade " + (viewMode === 'pending' ? 'in active' : '') + " tabs-content\" id=\"pending\">";
            }else{
                html += "<div class='container-fluid nopad-nomar' style='height:inherit'>";
                html += "    <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"  style='padding:10px; height:inherit'>";
                html += "        <div role=\"tabpanel\" style='height:inherit'>";
                html += "            <ul class=\"nav nav-tabs\" role=\"tablist\" style='font-weight:bold'>";
                html += "                <li class='tab-w50" + (viewMode === 'pending' ? ' active' : '') + "' role='presentation'><a href=\"#pending\" aria-controls=\"pending\" role=\"tab\" data-toggle=\"tab\"><i class=\"fa fa-fw fa-exclamation-circle\"><\/i> Pendientes<\/a><\/li>";
                html += "                <li class='tab-w50" + (viewMode === 'collected' ? ' active' : '') + "' role='presentation'><a href=\"#paid\" aria-controls=\"paid\" role=\"tab\" data-toggle=\"tab\"><i class=\"fa fa-fw fa-check-square-o\"><\/i> Realizados<\/a><\/li>";
                html += "            <\/ul>";
                html += "            <div class=\"tab-content\" style='height:inherit'>";
                html += "                <div role=\"tabpanel\" class=\"tab-pane fade " + (viewMode === 'pending' ? 'in active' : '') + " tabs-content\" id=\"pending\" style='height:inherit'>";
            }
            
            
            html += "                        " + pendingPayments + "";
            
            html += "                    <nav class=\"navbar navbar-default navbar-fixed-bottom\" id='checkout' style='height:52px; display:none'>";
            html += "                        <div class=\"container-fluid\" style='height:inherit; display: table; text-align:center; color:white'>";
            html += "                            <span class=\"span-vcenter\" style='width:100%'>";
            html += "                                <div id='lbl_total' class=\"footer-total fontxlg\">Total <span id='totalCount'></span><span class='pull-right'><i class=\"fa fa-angle-right fontxxxlg\"><\/i><\/span><\/div>";
            html += "                            <\/span>";
            html += "                        <\/div>";
            html += "                    <\/nav>";
            html += "                <\/div>";

            html += "                <div role=\"tabpanel\" class=\"tab-pane fade " + (viewMode === 'collected' ? 'in active' : '') + " tabs-content\" id=\"paid\">";
            
            
            html += "                        " + collectedPayments + "";
            
            html += "                <\/div>";
            html += "            <\/div>";
            html += "        <\/div>";
            html += "    <\/div>";
            html += "<\/div>";

        var html="";
            html += "<div class=\"row\" style='margin:0px; height:inherit;'>";

            html += "    <div class='fontbold color-emilenium'>";
            html += "        <div id='pendingTab' class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6 text-center e-tab " + (viewMode === 'pending' ? 'e-tab-active' : '') + "\" href=\"#pending\" aria-controls=\"pending\" role=\"tab\" data-toggle=\"tab\" style='background:white'>";
            html += "            <span class='span-vcenter'>";
            html += "                <span>PENDIENTES<\/span>";
            html += "            <\/span>";
            html += "        <\/div>";
            html += "        ";
            html += "        <div id='collectedTab' class=\"col-xs-6 col-sm-6 col-md-6 col-lg-6 text-center e-tab " + (viewMode === 'collected' ? 'e-tab-active' : '') + "\" href=\"#collected\" aria-controls=\"collected\" role=\"tab\" data-toggle=\"tab\" style='background:white'>";
            html += "            <span class='span-vcenter'>";
            html += "                <span>REALIZADOS<\/span>";
            html += "            <\/span>";
            html += "        <\/div>";
            html += "    <\/div>";

            html += "    <div class=\"tab-content\" style='height:inherit'>";

            html += "        <div role=\"tabpanel\" class=\"tab-pane fade " + (viewMode === 'pending' ? 'in active' : '') + "\" id=\"pending\" style='height:inherit'>";
            // html += "            <div class=\"row\" style='margin:0px; height:inherit'>";
            html += "            <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 whitebg\" style='border-bottom:1px solid #ddd; " + (response.PendingPayments.length>0 ? '' : 'height:inherit') + "' id='row-pending-container'>";
            html +=                 pendingPayments
            html += "               <nav class=\"navbar navbar-default navbar-fixed-bottom\" id='checkout' style='height:52px; display:none'>";
            html += "                   <div class=\"container-fluid\" style='height:inherit; display: table; text-align:center; color:white'>";
            html += "                       <span class=\"span-vcenter\" style='width:100%'>";
            html += "                           <div id='lbl_total' class=\"footer-total fontxlg\">Total <span id='totalCount'></span><span class='pull-right'><i class=\"fa fa-angle-right fontxxxlg\"><\/i><\/span><\/div>";
            html += "                       <\/span>";
            html += "                   <\/div>";
            html += "               <\/nav>";
            html += "            <\/div>";
            html += "        <\/div>";

            html += "        <div role=\"tabpanel\" class=\"tab-pane fade " + (viewMode === 'collected' ? 'in active' : '') + "\" id=\"collected\">";
            html += "            <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12 whitebg\" style='padding:7.5px; border-bottom:1px solid #ddd'>";
            html +=                 collectedPayments
            html += "            <\/div>";
            html += "        <\/div>";
            html += "    <\/div>";
            html += "<\/div>";


        app.Sammy.swap(html, function () {
            
            app.ShowBack('#/panel')
            app.CountUp = new CountUp("totalCount", 0, 0, 0, 1.5, app.CountUpOptions);
            app.Resident._checkPayment()

            var pendingTab = $('#pendingTab')
            var collectedTab = $('#collectedTab')

            pendingTab.on('show.bs.tab', function (event) {
                pendingTab.toggleClass('e-tab-active')
                collectedTab.toggleClass('e-tab-active')
            })

            collectedTab.on('show.bs.tab', function (event) {
                pendingTab.toggleClass('e-tab-active')
                collectedTab.toggleClass('e-tab-active')
            })

            app.Hammerify({
                id: 'collected',
                right: function (event) { pendingTab.tab('show') },
                left: function (event) { pendingTab.tab('show') }
            })

            app.Hammerify({
                id: 'pending',
                left: function (event) { collectedTab.tab('show') },
                right: function (event) { collectedTab.tab('show') }
            })


            if ($('.payment-item').is(':checked')){
                $('#row-pending-container').css('margin-bottom','52px')
                $('#checkout').fadeIn(1000)
            }
        })
    })
}

app.Resident.RenderPromotionCheckout = function () {
    app.hideTabs()
    $('#brand').text('Checkout')

    app.Sammy.swap(app.Reset)

    $.ajax({
        url: app.BaseUrl + 'api/promotion-order-request',
        type: 'POST',
        statusCode: {
            200: function (promotionCheckoutModel) {
                var data = { Payments: [], Total: promotionCheckoutModel.Amount }
                var total = accounting.formatMoney(data.Total,'$',0,',','')
                var month
                $.each(promotionCheckoutModel.Payments, function (i, obj) {
                    month = moment(obj.PayMonth).format('MMMM [del] YYYY')
                    data.Payments.push({
                        Id: obj.ChargeItemId,
                        Amount: obj.Amount,
                        Date: month,
                    })
                })

                var payments = ''
                $.each(data.Payments, function (i, obj) {
                    payments += "<div class='row row-checkout'> ";
                    payments += "   <div class='col-xs-2 col-sm-2 col-md-1 col-lg-1 row-checkout-content'> ";
                    payments += "       <span class='span-vcenter'> ";
                    payments += "           <i class='fa fa-check' style='color:#6fc833'><\/i> ";
                    payments += "       <\/span> ";
                    payments += "   <\/div> ";
                    payments += "   <div class='col-xs-8 col-sm-8 col-md-9 col-lg-9 row-checkout-content'> ";
                    payments += "       <span class='span-vcenter'> ";
                    payments += "           <p class='nopad-nomar paid-title'>" + obj.Date + "<\/p> ";
                    payments += "       <\/span> ";
                    payments += "   <\/div>";
                    payments += "   <div class='col-xs-2 col-sm-2 col-md-2 col-lg-2 row-checkout-content'> ";
                    payments += "       <span class='span-vcenter'> ";
                    payments += "           <p class='nopad-nomar'><strong>" + obj.Amount + "<\/strong><\/p> ";
                    payments += "       <\/span> ";
                    payments += "   <\/div> ";
                    payments += "<\/div>";
                })

                var html="";
                    html += "       <div class='col-xs-12 col-sm-12 col-md-12 col-lg-12'>";
                    html += "           <div class='payment-container info-panel' style='background:white; border-radius:5px; padding:7.5px'>";
                    html += "               <div class='container-fluid' style='border-bottom:1px solid #b0b0b0;'><strong>MESES A PAGAR<\/strong><\/div>";
                    html += "               " + payments + "";
                    html += "               <div class=\"panel-body fontxxlg\" style='text-align:center;'>";
                    html += "                   <p class='info-panel-content'>Total: <strong>" + total + "<\/strong><\/p>";
                    html += "                   <button id=\"show-ezpendo-iframe\" data-url='" + promotionCheckoutModel.EndPoint + promotionCheckoutModel.Token + "' data-loading-text=\"Procesando orden de pago...\" type=\"submit\" class=\"btn btn-success btn-lg\" style='margin-top:5px'>Proceder con el pago<\/button>";
                    html += "               <\/div>";
                    html += "           <\/div>";
                    html += "       <\/div>";
                    html += "       <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='padding:10px 10px 10px 10px'>";
                    html += "           <div style='text-align:justify; font-style: italic;'>";
                    html += "               <p class='info-panel-content'><strong>Nota:<\/strong><\/p>";
                    html += "               <p class='info-panel-content fontxxs'>";
                    html += "                   Los tiempos para pagar la cuota de mantenimiento son los primeros 10 días de cada mes, los pagos retrasados generarán $20.00 pesos adicionales a la cuota mensual apartir de Abril del 2015.<br>";
                    html += "                   El realizar pagos fuera de tiempo puede limitar el acceso de su vehículo por el carril de residentes, tendrá que accesar por el carril de visitantes. <br>";
                    html += "                   Puede domiciliar las cuotas de mantenimiento a su tarjeta de crédito y no preocuparse más por los pagos, para mas información click aquí. <br>";
                    html += "                   Al liquidar un año completo de cuotas de mantenimiento (12 meses), no se cobrarán 2 meses, es decir el mes 13 y 14 no tendrán costo alguno.<br>";
                    html += "                   Para los pagos en línea, Milenium trabaja con <strong>\"Ezpendo\" (https:\/\/www.ezpendo.com)<\/strong> quien se encarga de la gestión y el procesamiento de pagos a través de internet.";
                    html += "               <\/p>";
                    html += "           <\/div>";
                    html += "       <\/div>";

                app.Sammy.swap(html, function () {
                    app.ShowBack('#/pagos/pending')
                })
                
            },
            400: function (response) {
                app.ShowAlert(JSON.parse(response.responseText).ModelState)
                window.location = '#/pagos/pending'
            },
        }
    }).always(function () {
        app.Loading = false
    })
}

app.Resident.RenderCheckout = function () {
    app.hideTabs()
    $('#brand').text('Checkout')

    var data = app.Resident.Data

    if (data == null || data.Total == null || data.Payments == null || data.Payments.length < 1) {
        window.location = '#/pagos/pending'
        return
    }

    var payments = ''
    $.each(data.Payments, function (i, obj) {
        payments += "<div class='row row-checkout'> ";
        payments += "   <div class='col-xs-2 col-sm-2 col-md-1 col-lg-1 row-checkout-content'> ";
        payments += "       <span class='span-vcenter'> ";
        payments += "           <i class='fa fa-check' style='color:#6fc833'><\/i> ";
        payments += "       <\/span> ";
        payments += "   <\/div> ";
        payments += "   <div class='col-xs-8 col-sm-8 col-md-9 col-lg-9 row-checkout-content'> ";
        payments += "       <span class='span-vcenter'> ";
        payments += "           <p class='nopad-nomar paid-title'>" + obj.Date + "<\/p> ";
        payments += "       <\/span> ";
        payments += "   <\/div>";
        payments += "   <div class='col-xs-2 col-sm-2 col-md-2 col-lg-2 row-checkout-content'> ";
        payments += "       <span class='span-vcenter'> ";
        payments += "           <p class='nopad-nomar'><strong>$" + obj.Amount + "<\/strong><\/p> ";
        payments += "       <\/span> ";
        payments += "   <\/div> ";
        payments += "<\/div>";

    })

    app.Sammy.swap(app.Reset)

    var total = accounting.formatMoney(data.Total,'$',0,',','')

    var html="";
        html += "       <div class='col-xs-12 col-sm-12 col-md-12 col-lg-12'>";
        html += "           <div class='payment-container info-panel' style='background:white; border-radius:5px'>";
        html += "               <div class='container-fluid' style='border-bottom:1px solid #b0b0b0;'><strong>MESES A PAGAR<\/strong><\/div>";
        html += "               " + payments + "";
        html += "               <div class=\"panel-body fontxxlg\" style='text-align:center;'>";
        html += "                   <p class='info-panel-content'>Total: <strong>" + total + "<\/strong><\/p>";
        html += "                   <button id=\"pay\" data-loading-text=\"Procesando orden de pago...\" type=\"submit\" class=\"btn btn-success btn-lg\" style='margin-top:5px'>Proceder con el pago<\/button>";
        html += "               <\/div>";
        html += "           <\/div>";
        html += "       <\/div>";
        html += "       <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\" style='padding-top:10px'>";
        html += "               <div style='text-align:justify; font-style: italic;'>";
        html += "                   <p class='info-panel-content'><strong>Nota:<\/strong><\/p>";
        html += "                   <p class='info-panel-content fontxxs'>";
        html += "                       Los tiempos para pagar la cuota de mantenimiento son los primeros 10 días de cada mes, los pagos retrasados generarán $20.00 pesos adicionales a la cuota mensual apartir de Abril del 2015.<br>";
        html += "                       El realizar pagos fuera de tiempo puede limitar el acceso de su vehículo por el carril de residentes, tendrá que accesar por el carril de visitantes. <br>";
        html += "                       Puede domiciliar las cuotas de mantenimiento a su tarjeta de crédito y no preocuparse más por los pagos, para mas información click aquí. <br>";
        html += "                       Al liquidar un año completo de cuotas de mantenimiento (12 meses), no se cobrarán 2 meses, es decir el mes 13 y 14 no tendrán costo alguno.<br>";
        html += "                       Para los pagos en línea, Milenium trabaja con <strong>\"Ezpendo\" (https:\/\/www.ezpendo.com)<\/strong> quien se encarga de la gestión y el procesamiento de pagos a través de internet.";
        html += "                   <\/p>";
        html += "               <\/div>";
        html += "       <\/div>";

    app.Sammy.swap(html, function () {
        app.ShowBack('#/pagos/pending')
    })
}

app.Resident._checkPayment = function () {
    var total = 0

    var btn = $('#checkout')

    var checkboxes = $('.payment-item:checkbox:checked')

    if (checkboxes.length < 1) { btn.html('Pagar'); btn.button('reset'); return }

    checkboxes.each(function () {
        var temp = $(this)
        total += temp.data('amount')
    })

    btn.html('Pagar $' + total)
}

app.Resident.RenderResponse = function (orderId, token) {

    if (token == null || token.length == 0) { window.location = '#/panel'; return; }
    if (orderId == null || orderId.length == 0) { window.location = '#/panel'; return; }

    if (orderId.indexOf('group-') != -1) {
        $.ajax({
            url: app.BaseUrl + 'api/payment-status/' + token,
            type: 'GET',
            contentType: 'application/json',
            statusCode: {
                200: function (response) {

                    if (!response.Found) {
                        app.Sammy.swap('<h4>Lo sentimos. Tu pago no existe.</h4><br><br><a href="#/pagos">Regresar a mis pagos</a>'); return
                    }

                    if (!response.Pending) {
                        app.Resident.Data = null;

                        var temp = response.Payments.length > 1 ? response.Payments.length + ' meses' : '1 mes';

                        app.Sammy.swap('<h3>Tu pago de $' + response.Total + ' (' + temp + ') ha sido registrado. Gracias.</h3><br><br><a href="#/pagos">Regresar a mis pagos</a>'); return
                    }

                },
                400: function (response) {
                    window.location = '#/pagos/pending';
                    app.ShowAlert(JSON.parse(response.responseText).ModelState)
                },
            }
        }).always(function () {
            app.Loading = false;
        });
        return;
    }

    if (orderId.indexOf('reservation-') != -1) {
        $.ajax({
            url: app.BaseUrl + 'api/reservation-status/' + token,
            type: 'GET',
            contentType: 'application/json',
            statusCode: {
                200: function (response) {

                    if (!response.Found) {
                        app.Sammy.swap('<h4>Lo sentimos. Tu pago no existe.</h4><br><br><a href="#/pagos">Regresar a mis pagos</a>'); return
                    }

                    if (!response.Pending) {
                        app.Sammy.swap('<h3>Tu pago de $' + response.Total + '.00 (reservación de ' + response.EventAreaName + ') ha sido registrado. Gracias.</h3><br><br><a href="#/reservaciones">Regresar a mis reservaciones</a>'); return
                    }

                    window.location = '#/reservaciones';

                },
                400: function (response) {
                    app.ShowAlert(JSON.parse(response.responseText).ModelState)
                    window.location = '#/reservaciones';
                },
            }
        }).always(function () {
            app.Loading = false;
        });
        return;
    }

    app.Sammy.swap('<h4>Ha sucedido un error inesperado al procesar su petición.</h4>');
}

app.Resident._isInData = function (id) {
    var output = ''
    if (app.Resident.Data != null) {
        $.each(app.Resident.Data.Payments, function (i, obj) {
            if (obj.Id == id) output = 'checked'
        })
    }
    return output
}

app.Resident._checkPayment = function () {
    var total = 0
    var lbl = $('#totalCount')

    var checkboxes = $('.payment-item:checkbox:checked')

    if (checkboxes.length < 1) { lbl.html('Pagar'); return }

    checkboxes.each(function () {
        total +=  $(this).data('amount')
    })

    lbl.html(total)
    
    app.CountUp.update(total)
}

app.getDoesntExistHTML = function(message){
    app.DoesntExist = ''
    app.DoesntExist += '<div style="height:inherit; width:100%; display:table; text-align:center;">'
    app.DoesntExist += '   <span class="span-vcenter">'
    app.DoesntExist += '       <div style="width:100%; text-align:center"><span class="text-danger"><i class="fa fa-times-circle fa-5x"></i></span></div>'
    app.DoesntExist += '       <div style="width:100%; text-align:center" class="fontmd"><span style="padding-bottom:10px; margin-top:10px">' + message + '.</span></div>'
    app.DoesntExist += '   </span>'
    app.DoesntExist += '</div>'
}

function clearObj(objectToClean) {
  for (var x in objectToClean) if (objectToClean.hasOwnProperty(x)) delete objectToClean[x];
}


// ========================================
// ========= PHONEGAP API PLUGINS FUNCTIONS
// ========================================

// General
var pushNotification; 
// document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("backbutton", onBackKeyDown, false);

document.addEventListener("deviceready", function(){
    pushNotification = window.plugins.pushNotification;

    //Get device properties
    app.Device.Platform = device.platform.toLowerCase();
    app.Device.DeviceToken = device.uuid
    app.Device.Model = device.model
    app.Device.OSVersion = device.version

    //Get token from GCM or APN (depending on platform)
    if (app.Device.PushToken != '') return
    registerPush(app.Device.Platform)
},false);

function onDeviceReady() {
}

function onBackKeyDown() {
    if(window.location.hash == '#/panel' || window.location.hash == '#/login') {
        navigator.app.exitApp();
    }
    else {
        window.history.back();
    }
}

// Camera

function capturePhoto() {
    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.FILE_URI
    });
}

function chooseFromGallery(){
    navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY
    });
}

function onSuccess(fileURI) {
    $('#nav-camera').hide();
    var retries = 0

    var uploadSuccess = function (r) {
        clearCache();
        retries = 0;
        var img = document.getElementById('profilepic');
        img.src = fileURI;
    }
 
    var uploadFailed = function (error) {
        if (retries == 0) {
            retries ++
            setTimeout(function() {
                onSuccess(fileURI)
            }, 1000)
        } else {
            retries = 0;
            clearCache();
            app.ShowAlert('No se ha podido actualizar la imagen.');
        }
    }
    
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";

    options.headers = {
        'Authorization':'Token ' + window.localStorage.getItem('session-token'),
        'ID': window.localStorage.getItem('ID')
    }

    var ft = new FileTransfer();
    ft.upload(fileURI, encodeURI(app.BaseUrl + "api/resident/image"), uploadSuccess, uploadFailed, options);

    // var image = document.getElementById('profilepic');
    // image.src = "data:image/jpeg;base64," + imageData;
}

function onFail(message) {
    $('#nav-camera').hide();
}

function clearCache() {
    navigator.camera.cleanup();
}


function captureWarrantyPhoto() {
    navigator.camera.getPicture(setWarrantyPhoto, failWarrantyPhoto, { quality: 100,
        destinationType: Camera.DestinationType.FILE_URI
    });
}

function chooseWarrantyPhoto(){
    navigator.camera.getPicture(setWarrantyPhoto, failWarrantyPhoto, { quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY
    });
}

function setWarrantyPhoto(file){
    var cropper="";
        cropper += "<div id='cropper-container' class='hidden'>";
        cropper += "    <img src='" + file + "' class='img-responsive crop-image'>";
        cropper += "<\/div>";
        cropper += "<nav class=\"navbar navbar-default navbar-fixed-bottom hidden\" id='nav-crop' style='color:white'>";
        cropper += "    <div id='ok-crop' class=\"centered-text col-xs-6 col-sm-6 col-md-6 col-lg-6 div-table\" style='border-right:1px solid #ddd'>";
        cropper += "        <span class=\"span-vcenter\">";
        cropper += "            <i  class=\"fa fa-check fa-2x fa-fw\"><\/i>";
        cropper += "        <\/span>";
        cropper += "    <\/div>";
        cropper += "    <div id='cancel-crop' class=\"centered-text col-xs-6 col-sm-6 col-md-6 col-lg-6 div-table\">";
        cropper += "        <span class=\"span-vcenter\">";
        cropper += "            <i class=\"fa fa-times fa-2x fa-fw\"><\/i>";
        cropper += "        <\/span>";
        cropper += "    <\/div>";
        cropper += "<\/nav>";

    $('#app-container').prepend(cropper)

    $('.crop-image').cropper({
        aspectRatio: 1 / 1,
        dragCrop: false,
        // cropBoxMovable: false,
        // cropBoxResizable: false,
        doubleClickToggle: false,
        // autoCropArea: 1,
        built: function(){
            // var buttons = ''
            // buttons += "<div id='ok-crop' style='color:red'><i class='fa fa-check fa-3x'></i></div>";
            // buttons += "<div id='cancel-crop' style='color:red'><i class='fa fa-times fa-3x'></i></div>";
            // $('#cropper-container').append()
        }
    });
    $('#claim-warranty-main-container').hide()
    $('#submit-claim-warranty').hide()
    $('#cropper-container').fadeIn(1000)
    $('#nav-crop').fadeIn(1000)

}

function failWarrantyPhoto(){

}

function uploadWarrantyImage(src, imgCounter){
    app.Images.Counter++
    var lastImage = false

    if (imgCounter == app.Images.Counter) lastImage == true

    var uploadSuccess = function (r) {
        clearCache();
        retries = 0;
    }

    var lastUploadSuccess = function (r) {
        clearCache();
        retries = 0;
        app.ShowAlert('La solicitud ha sido enviada correctamente.');
    }
 
    var uploadFailed = function (error) {
        if (retries == 0) {
            retries ++
            setTimeout(function() {
                uploadWarrantyImage(src)
            }, 1000)
        } else {
            retries = 0;
            clearCache();
            app.ShowAlert('No se ha podido solicitar garantía.');
        }
    }
    
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = src.substr(src.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";

    options.headers = {
        'Authorization':'Token ' + window.localStorage.getItem('session-token'),
        'ID': window.localStorage.getItem('ID')
    }

    var ft = new FileTransfer();

    if (lastImage){
        ft.upload(src, encodeURI(app.BaseUrl + "api/warranty/image/"), lastUploadSuccess, uploadFailed, options);
    }else{
        ft.upload(src, encodeURI(app.BaseUrl + "api/warranty/image/"), uploadSuccess, uploadFailed, options);
    }
}


// Push notifications

function registerPush(platform){
    switch(platform)
    {
        case 'android':
            pushNotification.register(successHandler, errorHandler, { "senderID":"205213363863", "ecb":"onNotification" });
        break;

        case 'ios':
            pushNotification.register(tokenHandler, errorHandler, { "badge":"true", "sound":"true", "alert":"true", "ecb":"onNotificationAPN" });
        break;

        default: alert('Device not supported for push notifications.'); break;
    }
}

function successHandler (result) {
    // alert('result = ' + result);
}

function tokenHandler (regid) {
    app.Device.PushToken = regid;
}

function errorHandler (error) {
    // app.ShowAlert(error)
}

function onNotification(e) {
    

    switch(e.event)
    {
        case 'registered': app.Device.PushToken = e.regid; break;
        
        case 'message':
            if (e.foreground)
            {
                var hash = app._getNotificationsHash(parseInt(e.payload.type), parseInt(e.payload.id));
                
                app.showConfirm(e.payload.title, ['Ver','Cancelar'], function (index) {
                    
                    if(index != 1) return

                    $.ajax({
                        url: app.BaseUrl + 'api/resident/notifications/mobile',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({ NotificationId: e.payload.notificationid }),
                        statusCode: {
                            200: function (response) {
                                app.Resident.NotificationCount()
                            },
                        }
                    })

                    window.location = hash
                })
            }
            else
            {
                var hash = app._getNotificationsHash(parseInt(e.payload.type), parseInt(e.payload.id));
                window.location = hash

                if (e.coldstart) {
                    //todo: handle coldstart
                } else { 
                    //todo: handle background
                }
            }
        break;

        case 'error':
            alert('ERROR -> MSG: ' + e.msg);
        break;

        default:
        break;
    }
}

// iOS
function onNotificationAPN (event) {
    var notificationId = event.NotificationId
    var type = event.Type
    var id = event.Id
    
    var hash = app._getNotificationsHash(parseInt(type), parseInt(id));

    if ( event.alert )
    {
        if (event.foreground == 1){
            app.showConfirm(event.alert, ['Ver','Cancelar'], function (index){
                if(index != 1) return

                $.ajax({
                    url: app.BaseUrl + 'api/resident/notifications/mobile',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ NotificationId: notificationid }),
                    statusCode: {
                        200: function (response) {
                            app.Resident.NotificationCount()
                        },
                    }
                })

                window.location = hash
            })
        }else{
            window.location = hash
        }
    }

    if ( event.sound )
    {
        var snd = new Media(event.sound);
        snd.play();
    }

    if ( event.badge )
    {
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }

}




/*
=======================================================================================================
=======================================================================================================
==============================  _     _     _                            ==============================
============================== | |   (_)   | |                           ==============================
============================== | |    _ ___| |_ ___ _ __   ___ _ __ ___  ==============================
============================== | |   | / __| __/ _ \ '_ \ / _ \ '__/ __| ==============================
============================== | |___| \__ \ ||  __/ | | |  __/ |  \__ \ ============================== 
============================== \_____/_|___/\__\___|_| |_|\___|_|  |___/ ============================== 
=======================================================================================================
=======================================================================================================
*/

// Outcomes module listeners
$(document).on('change', '#monthpicker', function () {
    app.Resident.RenderOutcomes($("#monthpicker").val().replace("-","/"))
});

$(document.body).on('click', '.outcome-row, .income-row', function (e) {
    var arrowIcon = jQuery(this).find(".fa");
    var collapsibleItem = $(this).attr('href')

    if ( $(collapsibleItem).is(':hidden') ) {
        arrowIcon.removeClass('fa-angle-down').addClass('fa-angle-up');
    }else{
        arrowIcon.removeClass('fa-angle-up').addClass('fa-angle-down');
    }

    $('html, body').animate({
        scrollTop: $(this).offset().top-53
    }, 1000);
})

// $(document.body).on('click', '.gastos-row', function (e) {
//     e.preventDefault()
//     $(this).next( ".collapse" ).collapse('toggle')
    // $('html, body').animate({
    //     scrollTop: $(this).offset().top-53
    // }, 1000);
// })

// Notifications module listeners
$(document.body).on('click', '#notifications .a-nostyle', function (event) {
    event.preventDefault()

    var row = $(this)
    var hash = row.prop('href')

    var notificationId = row.data('notification-id')

    if (row.hasClass('unread')) {
        $.ajax({
            url: app.BaseUrl + 'api/resident/notifications/',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ NotificationMembershipId: notificationId }),
            statusCode: {
                200: function (response) {
                    app.Resident.NotificationCount()
                },
            }
        })
    }
    window.location = hash
})

$(document.body).on('click', '#show-more-notifications', function (e) {
    e.preventDefault()
    app.Resident.AppendNotifications()
})

// News module listeners
$(document.body).on('click', '.news-link', function () {
    window.location = '#/noticia/' + $(this).data('id');
})

// Reminders module listeners
$(document.body).on('click', '.reminder-row', function () {
    window.location = '#/recordatorio/' + $(this).data('id');
})

$(document.body).on('click', '#remove-reminder', function () {
    id = $(this).data('id')

    app.showConfirm('¿Confirma eliminar este recordatorio?', ['Eliminar','Cancelar'], function(index){
        if(index != 1) return

        $.ajax({
            url: app.BaseUrl + 'api/resident/alerts/' + id,
            type: 'DELETE',
            contentType: 'application/json',
            statusCode: {
                200: function (response) {
                    window.location = "#/recordatorios"
                },
                400: function (response) {
                    app.ShowErrors(JSON.parse(response.responseText).ModelState)
                },
            }
        })
    })     
})

$(document.body).on('click', '.edit-reminder-div', function (e) {
    e.stopPropagation()
    id = $(this).closest('.reminder-row').data('id')
    window.location = '#/recordatorios/editar/' + id;
})

$(document.body).on('click', '.cohabitant-row', function (e) {
    e.preventDefault()
    var checkbox = $(this).find('.cohabitant-item')
    checkbox.prop("checked", !checkbox.prop("checked"))
})

$(document.body).on('click', '#create-reminder', function () {
    $('#resident-alerts-post-form').trigger( "submit" );
})

$(document.body).on('click', '#edit-reminder', function () {
    $('#resident-alerts-put-form').trigger( "submit" );
})

$(document).on('change', '#ResidentAlertType', function(){
    if ( this.value == 0 ){
        $('#title-row').slideDown();
    } else {
        $('#title-row').slideUp();
    }
})

$(document).on('change', '#Share', function(){
    if ( $(this).is(':checked') ){
        $('#cohabitants').slideDown()
    }else{
        $('#cohabitants').slideUp()
    }
})

$(document.body).on('submit', '#resident-alerts-post-form', function (event) {
    event.preventDefault();

    var form = $(this)
    form.removeData('validator')
    form.removeData('unobtrusiveValidation')
    $.validator.unobtrusive.parse(form)
    var validator = form.validate()

    var request = form.serializeObject()

    if ( moment(request.ScheduleDate).isBefore(moment()) ) {
        app.ShowAlert('Fecha no puede ser anterior al presente.')
        return
    }

    var data = {}

    var title = ''
    if ( request.ResidentAlertType == 0 ){
        title = request.Title
    } else {
        title = $("#ResidentAlertType option:selected").text()
    }

    data = {
        Title: title,
        Periodicity: request.Periodicity,
        ResidentAlertType: request.ResidentAlertType,
        ScheduleDate: request.ScheduleDate,
        SendEmail: request.SendEmail == 'on',
        Share: request.Share == 'on',
        Residents: [],
    }

    var cohabitants = $('.cohabitant-item')
    var temp = null
    cohabitants.each(function () {
        temp = $(this)
        if (temp.prop('checked')) {
            data.Residents.push(temp.data('id'))
        }
    })

    $.ajax({
        url: app.BaseUrl + 'api/resident/alerts/',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        statusCode: {
            200: function (response) {
                window.location = '#/recordatorios'
                app.ShowAlert('El recordatorio ha sido agendado.')
            },
            400: function (response) {
                app.ShowErrors(JSON.parse(response.responseText).ModelState)
            },
        }
    })

    return false
})

$(document).on('submit', '#resident-alerts-put-form', function (event) {
        event.preventDefault();
        var id = window.location.hash.substr(window.location.hash.lastIndexOf('/') + 1);
        var form = $('#resident-alerts-put-form')
        form.removeData('validator')
        form.removeData('unobtrusiveValidation')
        $.validator.unobtrusive.parse(form)
        var validator = form.validate()

        var request = form.serializeObject()

        if ( moment(request.ScheduleDate).isBefore(moment()) ) {
            app.ShowAlert('Fecha no puede ser anterior al presente.')
            return
        }

        var title = ''
        if ( request.ResidentAlertType == 0 ){
            title = request.Title
        } else {
            title = $("#ResidentAlertType option:selected").text()
        }

        data = {
            ResidentAlertId: id,
            ScheduleDate: request.ScheduleDate,
            ResidentAlertType: request.ResidentAlertType,
            Title: title,
            Periodicity: request.Periodicity,
            SendEmail: request.SendEmail == 'on',
        }

        $.ajax({
            url: app.BaseUrl + 'api/resident/alerts/',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data),
            statusCode: {
                200: function (response) {
                    window.location = "#/recordatorios"
                    app.ShowAlert('El recordatorio ha sido actualizado')
                },
                400: function (response) {
                    app.ShowErrors(JSON.parse(response.responseText).ModelState)
                },
            }
        })

        return false;
    })

// Events module listeners
$(document.body).on('click', '.event-row', function () {
    if ( $(this).data('id') ) window.location = '#/evento/' + $(this).data('id');
})

$(document.body).on('click', '.event-answer', function () {
    var btn = $(this);

    var eventId = btn.data('event-id');
    var membershipId = btn.data('id');
    var answer = btn.data('answer');

    $.ajax({
        url: app.BaseUrl + 'api/resident/event/answer',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ EventId: eventId, Answer: answer }),
        statusCode: {
            200: function (response) {
                window.location = '#/eventos';

            },
            400: function (response) {
                app.ShowAlert(JSON.parse(response.responseText).ModelState)
            },
        }
    })
})

$(document.body).on('click', '#showPastEvents', function(){
    var visible = $(this).attr('aria-expanded') === 'true'

    if (visible){
        $('#angleArrow').removeClass('fa-angle-up').addClass('fa-angle-down')
    }else{
        $('#angleArrow').removeClass('fa-angle-down').addClass('fa-angle-up')
    }
    
})

// Board members module listeners
$(document.body).on('click', '.phonecall', function () {
    var phone = $(this).data("phone")
    window.open('tel:'+phone, '_system')
})

// Warranties Listeners

$(document.body).on('click', '.claim-warranty-img-container', function () {
    app.Images.ImgId = $(this).attr('id')
    app.showConfirm('Seleccione una opción', ['Camara','Galería','Cancelar'], function (index){
        switch(index){
            case 1: captureWarrantyPhoto(); break;
            case 2: chooseWarrantyPhoto(); break;
            default: return; break;
        }
    })
})

$(document.body).on('click', '#submit-claim-warranty', function (e) {
    e.preventDefault()
    var warrantyId = $(this).data('warrantyid')
    var lotWarrantyId = $(this).data('lotwarrantyid')

    app.Resident.ClaimWarranty(warrantyId, lotWarrantyId)
})

$(document.body).on('click', '#ok-crop', function () {
    var canvas =  $('.crop-image').cropper('getCroppedCanvas', {
        width: 400,
        height: 300
    })
    var src = canvas.toDataURL("image/jpeg", 0.8);

    if (canvas.toBlob) {
        canvas.toBlob(
            function (blob) {
                app.Images.data.append(app.Images.ImgId, blob);
                // app.Images.formData.append(app.Images.ImgId, blob);
            },
            'image/jpeg'
        );
    }

    var imgContainer = app.Images.ImgId
    $('#'+imgContainer).html('<img class="img-responsive warranty-img" src="' + src + '">')
    $('#cropper-container').remove()
    $('#nav-crop').remove()
    $('#claim-warranty-main-container').fadeIn(1000)
    $('#submit-claim-warranty').fadeIn(1000)
    return

})

$(document.body).on('click', '#cancel-crop', function () {
    $('#cropper-container').remove()
    $('#nav-crop').remove()
    $('#claim-warranty-main-container').fadeIn(1000)
    $('#submit-claim-warranty').fadeIn(1000)
    return
})



// Login listeners
$(document.body).on('focusin', '.form-input', function () {
    $('.footer').hide()
})

$(document.body).on('focusout', '.form-input', function () {
    $('.footer').fadeIn()
})

// Reservations / Events area module listeners
$(document.body).on('click', '.reservas-anteriores', function () {
    if($('#reservas-anteriores').is(':visible')){
        $('.arrow').removeClass('fa-angle-up').addClass('fa-angle-down')
    }else{
        $('.arrow').removeClass('fa-angle-down').addClass('fa-angle-up')
    }
    $('#reservas-anteriores').slideToggle('fast')
    
    $("html, body").animate({ scrollTop: $(document).height() }, 1200);
});

$(document).on('click', '.e-tab', function (e){
    e.preventDefault()
    $('.e-tab-active').removeClass('e-tab-active')
    $(this).addClass('e-tab-active')
})

$(document).on('click', '.event-box', function (e){
    e.preventDefault()
    window.location = $(this).data('target')
})

$(document).on('click', '#book-area', function (e){
    e.preventDefault()
    $('#event-area-reservation-form').trigger( "submit" )
})

$(document.body).on('submit', '#event-area-reservation-form', function (event) {
    event.preventDefault();

    if (!$('#booktime').val()){
        app.ShowAlert('Por favor selecciona fecha.')
        return
    }

    var now = moment()
    var bookTime = moment($('#booktime').val())

    if (bookTime.isBefore(now)){
        app.ShowAlert('La fecha no puede ser anterior a este momento.')
        return
    }

    var request = $(this).serializeObject();

    $.ajax({
        url: app.BaseUrl + 'api/resident/event-area/reservation/',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(request),
        statusCode: {
            200: function (response) {

                if (!response.Token) { window.location = "#/reservaciones"; return; }

                $(window).scrollTop(0)

                var html = '' +
                            '<div id="ezpendo-connecting" class="centered-text" style="height:100%; display: table; text-align:center; width:100%">' +
                                '<span class="span-vcenter">' +
                                    '<img src="' + app.BaseUrl + '/Content/images/ezpendo.png" />' +
                                    '<h3>Conectando con Ezpendo...</h3>' +
                                '</span>' +
                            '</div>' +
                            '<iframe id="iframe-ezpendo" class="iframe-ezpendo hidden" src="' + response.EndPoint + response.Token + '"></iframe>'

                app.Sammy.swap(html, function () {
                    setTimeout(function () {
                        $('#ezpendo-connecting').remove()
                        $('#iframe-ezpendo').fadeIn()
                    }, 1000)                            
                })

                // app.Sammy.swap('<h3 id="ezpendo-connecting">Conectando con Ezpendo...</h3><iframe id="iframe-ezpendo" class="iframe-ezpendo" src="' + response.EndPoint + response.Token + '"></iframe>', function () {
                //     $('#iframe-ezpendo').load(function () {
                //         $('#ezpendo-connecting').fadeOut('slow')
                //     })
                // })
            },
            400: function (response) {
                app.ShowErrors(JSON.parse(response.responseText).ModelState);
                window.location = '#/panel'
            },
        }
    })

    return false;
})

// Settings module listeners
$(document.body).on('click', '.conf-row', function (e) {
    e.preventDefault()

    var that = $(this)

    var arrowIcon = that.find('.show-more');
    var attr = arrowIcon.attr('content');
    var content = $('#' + attr);
    
    if (content.is(':hidden')){
        arrowIcon.removeClass('fa-angle-down').addClass('fa-angle-up');
    } else {
        arrowIcon.removeClass('fa-angle-up').addClass('fa-angle-down');
    }

    $('html, body').animate({
        scrollTop: that.offset().top-96
    }, 1000);

    content.slideToggle()
})

$(document.body).on('submit', '#invite-form', function (event) {
    event.preventDefault();
    if (app.Loading) { return false; } app.Loading = true;

    var btn = $('button[type="submit"]', this);
    btn.button('loading');

    var form = $('#invite-form');
    form.removeData('validator');
    form.removeData('unobtrusiveValidation');
    $.validator.unobtrusive.parse(form);

    var validator = form.validate();

    var request = $(this).serializeObject()
    request.Invite = request.Invite == 'on'

    $.ajax({
        url: app.BaseUrl + 'api/resident/invite',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(request),
        statusCode: {
            200: function (response) {
                $( '[content="invitar"]' ).removeClass('fa-angle-up').addClass('fa-angle-down');
                $('#invitar').addClass('hidden');
                $('#invitar').slideUp('slow');
                $('#invite-form')[0].reset();
                app.ShowAlert('Se ha mandado una invitación al correo ' + request.Email)
            },
            400: function (response) {
                app.ShowErrors(JSON.parse(response.responseText).ModelState);
            },
        }
    }).always(function () {
        btn.button('reset');
        app.Loading = false;
    })

    return false;
})

$(document.body).on('click', '#profile-picture', function (e) {
    e.preventDefault()
    $('#settings').css('margin-bottom','52px')
    $('#nav-camera').fadeIn(1000)
})

$(document.body).on('click', '#edit-profile-picture', function (e) {
    e.preventDefault()
    $('#settings').css('margin-bottom','52px')
    $('#nav-camera').fadeIn(1000)
})

// Payments module listeners
$(document.body).on('click', '#pay12', function () {
            window.location = '#/promotion-checkout'
            return
    app.showConfirm('¿Confirma ir a pagar 12 meses?', ['OK','Cancelar'], function (index){
        if (index == 1){
            return;
        }else{
            return
        }
    })
    
})

$(document.body).on('click', '.payment-item-row', function (e) {
    e.preventDefault()
    var row = $(this)

    var index = row.index()
    
    var rows = $('.payment-item-row')

    rows.each(function () {

        var thisRow = $(this)
        var i = thisRow.index()

        checkBox = thisRow.find('.payment-item')

        if (i <= index) {
            // $('#pending').css('margin-bottom','90px')
            $('#row-pending-container').css('margin-bottom','52px')
            $('#checkout').fadeIn(1000)
            checkBox.prop('checked', true)
            thisRow.addClass('payment-row-bg')
        }
        else {
            checkBox.prop('checked', false)
            thisRow.removeClass('payment-row-bg')
        }
    })

    app.Resident._checkPayment()
})

$(document.body).on('click', '#checkout', function () {
    var list = [];
    var temp = '';
    var total = 0;

    var checkboxes = $('.payment-item:checkbox:checked');

    checkboxes.each(function () {
        temp = $(this);
        total += temp.data('amount');
        list.push({
            Id: temp.data('id'),
            Amount: temp.data('amount'),
            Date: temp.data('date'),
        })
    })

    

    if (list.length < 1) {
        btn.button('reset');
    }
    else {
        app.Resident.Data = { Total: total, Payments: list };
        window.location = '#/checkout';
    }
})

$(document.body).on('click', '#pay', function () {

    if (app.Loading) return; app.Loading = true;

    var btn = $(this);
    btn.button('loading');

    var data = app.Resident.Data;
    if (data == null || data.Total == null || data.Payments == null || data.Payments.length < 1) {
        window.location = '#/pagos/pending';
        app.Loading = false;
        return;
    }

    var list = [];

    $.each(data.Payments, function (i, obj) {
        list.push(obj.Id);
    })
    if (list.length < 1) { window.location = '/'; return; }
    var request = { Charges: list }

    $.ajax({
        url: app.BaseUrl + 'api/resident/payment',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(request),
        statusCode: {
            200: function (response) {
                if (response.Redirect) {

                    $(window).scrollTop(0)

                    var url = response.EndPoint + response.Token

                    var html = '' +
                        '<div id="ezpendo-connecting" class="centered-text" style="height:100%; display: table; text-align:center; width:100%">' +
                            '<span class="span-vcenter">' +
                                '<img src="' + app.BaseUrl + '/Content/images/ezpendo.png" />' +
                                '<h3>Conectando con Ezpendo...</h3>' +
                            '</span>' +
                        '</div>' +
                        '<iframe id="iframe-ezpendo" class="iframe-ezpendo hidden" src="' + url + '"></iframe>'

                    app.Sammy.swap(html, function(){
                        $('#iframe-ezpendo').fadeIn()
                    })
                }
            },
            400: function (response) {
                app.ShowAlert(JSON.parse(response.responseText).ModelState)
                window.location = '#/pagos/pending';
            },
        }
    }).always(function () {
        //btn.button('reset');
        app.Loading = false;
    })
})

$(document.body).on('click', '.row-paid', function () {
    var paymentId = $(this).data('id')
    var payant = app.Payments.Collected[paymentId].Payant
    var paymentDate = moment(app.Payments.Collected[paymentId].Date)

    app.ShowAlert('Pagado por ' + payant + ' el día ' + paymentDate.format('DD [de] MMMM [del] YYYY [a las] HH:mm:ss') )
})

// Contact module listeners
$(document.body).on('submit', '#contact-form', function (event) {
    event.preventDefault();
    if (app.Loading) { return false; } app.Loading = true;

    var btn = $('button[type="submit"]', this);
    btn.button('loading');

    var form = $('#contact-form');
    form.removeData('validator');
    form.removeData('unobtrusiveValidation');
    $.validator.unobtrusive.parse(form);

    var validator = form.validate();

    var request = $(this).serializeObject();

    $.ajax({
        url: app.BaseUrl + 'api/resident/contact',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(request),
        statusCode: {
            200: function (response) {
                app.Sammy.swap('' +
                    '<h3>Tu mensaje ha sido enviado. Un administrador se pondra en contacto contigo en unos minutos.</h3>' +
                    '<br>' +
                    '<br>' +
                    '<a href="#/panel">Volver</a>' +
                    '');
            },
            400: function (response) {
                app.ShowErrors(JSON.parse(response.responseText).ModelState);
            },
        }
    }).always(function () {
        btn.button('reset');
        app.Loading = false;
    })

    return false;
})

// Camera listeners
$(document.body).on('click', '#choose-from-camera', function (e) {
    e.preventDefault()
    capturePhoto()
})

$(document.body).on('click', '#choose-from-gallery', function (e) {
    e.preventDefault()
    chooseFromGallery()
})

// Core app listeners

$('#back').click(function(e) {
    e.preventDefault();

    // var message = $(this).data('message')
    var hash = $(this).data('hash')

    if(app.returnMessage){
        app.showConfirm(app.returnMessage, ['OK','Cancelar'], function (index){
            if (index == 1){
                $(this).addClass('hiddenimportant')
                window.location = hash
            }
        })
    }else{
        $(this).addClass('hiddenimportant')
        if(window.location.hash == '#/panel'){
            navigator.app.exitApp();
        }
        else {
            window.location = hash
        }
    }
});

$(document.body).on('click', '.tab-btn', function (e) {
    e.preventDefault()
    $('.tab-btn .active').removeClass('active');
    var content = $(this).attr("content");
    window.location = "#/"+content;
})

$(document.body).on('click', '#show-ezpendo-iframe', function () {
    var btn = $(this);
    $(window).scrollTop(0)

    var html = '' +
        '<div id="ezpendo-connecting" class="centered-text" style="height:100%; display: table; text-align:center; width:100%">' +
            '<span class="span-vcenter">' +
                '<img src="' + app.BaseUrl + '/Content/images/ezpendo.png" />' +
                '<h3>Conectando con Ezpendo...</h3>' +
            '</span>' +
        '</div>' +
        '<iframe id="iframe-ezpendo" class="iframe-ezpendo hidden" src="' + $(this).data('url') + '"></iframe>'

    app.Sammy.swap(html, function () {
        setTimeout(function () {
            $('#ezpendo-connecting').remove()
            $('#iframe-ezpendo').fadeIn()
        }, 1000)                            
    })
})

$(document).ajaxError(function (event, jqxhr, settings, exception) {        
    if (jqxhr.status == 402) {
        // app.ReturnHash = window.location.hash
        window.location = "#/logout";
    }

    if (jqxhr.status == 404) {
        
        window.location = '#/panel'
    }

    if (jqxhr.status == 417) {
        localStorage.removeItem('ID')
        window.location = '#/selecciona-residente';
    }

    if (jqxhr.status == 500) {
        alert('Ha sucedido un error inesperado al procesar su petición.')
    }
})

$.ajaxSetup({
    beforeSend: function (request) {
        var token = window.localStorage.getItem('session-token') || ''
        var id = window.localStorage.getItem('ID') || ''
        alert(token)
        alert(id)
        if (token != '') request.setRequestHeader('Authorization', 'Token ' + token)
        if (id != '') request.setRequestHeader('ID', id)
    }
})

$(document).ready(function(){
    if(navigator.notification == null){
        navigator.notification = {
            alert: function(msg){
                alert(msg)
            },
            confirm: function(msg){
                confirm(msg)
            }
        }
    }
})