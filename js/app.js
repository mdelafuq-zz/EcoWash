var app = {
    // BaseUrl: 'http://192.168.0.13:1789/',
    BaseUrl: 'http://ecowash.apphb.com/',
    Sammy: null,
    Render: {},
    AllowedPages: ['#/login', '#/register'],
    Session: {}
}

app.Start = function(){
    app.RegisterRoutes()
    var token = localStorage['session-token']
    if(!token){
    	window.location = '#/login'
    }else{
    	window.location = '#/home'
    }
	app.Sammy.run()
}


app.RegisterRoutes = function () {

    app.Sammy = $.sammy('#app-container', function () {

        this.get('/', function (context) { window.location = '#/home' })
        this.get('#/?', function (context) { window.location = '#/home' })


        this.get('#/home/?', function (context) { app.Render.Home() })
        this.get('#/evento/:id/?', function (context) { app.Resident.RenderEvent(context.params['id']) })

        this.get('#/login/?', function (context) { app.Render.Login() })
        this.get('#/logout/?', function (context) { app.Logout() })


        this.notFound = function (context) { if (context !== 'post') { window.location = '#/home' } }

        this.swap = function (content, callback) {
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


app.Login = function(data){
	console.log(data)

	$.ajax({
        url: app.BaseUrl + 'api/login',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        statusCode: {
            200: function (response) {
            	console.log(response)
            	localStorage['session-token'] = response.Token
            	app.Session.Token = response.Token
            	window.location = '#/home'
            },
            400: function (response) {
            },
        }
    })

    return;
}

app.Logout = function(){

}


app.Render.Home = function(){
	console.log("rendering home")
	var html = "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>hola mundo</h1>"
	html += "<h1>ULTIMO</h1>"
	app.Sammy.swap(html, function () {
    })
}

app.Render.Login = function(){
	console.log('you must login first noob')
}



$(document).on('change', '#monthpicker', function () {
});


$(document.body).on('click', '#show-more-notifications', function (e) {
})


$(document.body).on('submit', '#login-form', function (event) {
    event.preventDefault();
    app.Login($(this).serializeObject());
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

$.ajaxSetup({
    beforeSend: function (request) {
        var token = localStorage['session-token'] || ''
        var id = localStorage.getItem('ID') || ''
        if (token) request.setRequestHeader('Authorization', 'Token ' + token)
        if (id) request.setRequestHeader('ID', id)
    }
})