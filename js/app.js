var app = {
    BaseUrl: 'http://192.168.0.10:1789/',
    // BaseUrl: 'http://ecowash.apphb.com/',
    Sammy: null,
    Render: {},
    Services: {
    	Get: {},
    	Post: {}
    },
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

        // this.get('/', function (context) { window.location = '#/home' })
        // this.get('#/?', function (context) { window.location = '#/home' })

        this.get('#/home/?', function (context) { app.Render.Home() })
        this.get('#/encuesta/?', function (context) { app.Render.Surveys() })
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



app.Logout = function(){
	$.ajax({
        url: app.BaseUrl + 'api/logout',
        type: 'POST',
        contentType: 'application/json',
        statusCode: {
            200: function (response) {
            	localStorage.clear()
            	app.Session = {}
            	window.location = '#/login'
            },
            400: function (response) {
            },
        }
    })
}

app.Init = function(){
	$('[data-plugin-counter]:not(.manual), .counters [data-to]').each(function() {
		var $this = $(this),
			opts;

		var pluginOptions = $this.data('plugin-options');
		if (pluginOptions)
			opts = pluginOptions;

		$this.themePluginCounter(opts);
	});

	$('[data-plugin-animate], [data-appear-animation]').each(function() {
		var $this = $(this),
			opts;

		var pluginOptions = $this.data('plugin-options');
		if (pluginOptions)
			opts = pluginOptions;

		$this.themePluginAnimate(opts);
	});

	$('[data-plugin-word-rotate]:not(.manual), .word-rotate:not(.manual)').each(function() {
		var $this = $(this),
			opts;

		var pluginOptions = $this.data('plugin-options');
		if (pluginOptions)
			opts = pluginOptions;

		$this.themePluginWordRotate(opts);
	});

	$('[data-plugin-sticky]:not(.manual)').each(function() {
		var $this = $(this),
			opts;

		var pluginOptions = $this.data('plugin-options');
		if (pluginOptions)
			opts = pluginOptions;

		$this.themePluginSticky(opts);
	});

}

app.SetActiveButton = function (button){
	$('.menu-button').removeClass('active')
	$(button).addClass('active')
}

// Services
//GET
app.Services.Get.Surveys = function(){
	return $.getJSON(app.BaseUrl + 'api/surveys')
}

app.Services.Get.Trees = function(){
	return $.getJSON(app.BaseUrl + 'api/trees')
}

app.Services.Get.Coupons = function(){
	return $.getJSON(app.BaseUrl + 'api/coupons')
}

// POST
app.Services.Post.PostSurvey = function(form){
	console.log(form.Happyness)
	var data = {
		Answer1: form.Happyness === '1',
		Answer2: form.GoodService === '1',
		Answer3: form.Economy === '1',
		Answer4: form.Conferences === '1',
		Answer5: form.Comments
	}
	console.log(data)

	$.ajax({
        url: app.BaseUrl + 'api/surveys',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        statusCode: {
            200: function (response) {
            	console.log(response)
            	if (response.Coupon.GUID){
            		var coupon = response.Coupon.GUID.slice(0,8)
            		console.log(coupon)
            	}
            	// $('#myModal').modal(options)
            	// window.location = '#/promotions'
            },
            400: function (response) {
            },
        }
    })
}

app.Services.Post.Register = function(data){
	$.ajax({
        url: app.BaseUrl + 'api/register',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        statusCode: {
            200: function (response) {
            	var login = {
            		Email: data.Email,
            		Password: data.Password
            	}
            	app.Services.Post.Login(login)
            },
            400: function (response) {
            },
        }
    })
}

app.Services.Post.Login = function(data){
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


// Views
app.Render.Surveys = function(){
	console.log('surveys')
	var html="";
		html += "<div class=\"container\">";
		html += "	<div class=\"row\">";
		html += "		<form id=\"survey-form\">";
		html += "";
		html += "			<div class=\"col-md-3\">";
		html += "				<aside class=\"sidebar\" id=\"sidebar\" data-plugin-sticky data-plugin-options='{\"minWidth\": 991, \"containerSelector\": \".container\", \"padding\": {\"top\": 110}}'>";
		html += "";
		html += "					<h4>Valoramos tu opinión<\/h4>";
		html += "					<p>En Eco Wash nos importa tu opinión, por eso te agradecemos que contestes nuestra encuesta de servicio.<\/p>";
		html += "";
		html += "					<button class=\"btn btn-lg btn-primary mb-lg\" type=\"submit\">Enviar<\/a>";
		html += "					";
		html += "				<\/aside>";
		html += "			<\/div>";
		html += "			<div class=\"col-md-9\">";
		html += "				<!-- <input type=\"radio\" name=\"happyRadio\" value=\"1\"> Si";
		html += "				<input type=\"radio\" name=\"happyRadio\" value=\"0\"> No -->";
		html += "					<ul class=\"list list-icons\">";
		html += "						<li><i class=\"fa fa-leaf\"><\/i> ¿Está contento con el servicio que Eco WASH le brinda?<\/li>";
		html += "						<li>";
		html += "							<div class=\"radio-custom radio-success\">";
		html += "								<input type=\"radio\" id=\"HappyService\" name=\"Happyness\" required value=\"1\">";
		html += "								<label for=\"HappyService\">Si<\/label>";
		html += "							<\/div>";
		html += "							<div class=\"radio-custom radio-danger\">";
		html += "								<input type=\"radio\" id=\"SadService\" name=\"Happyness\">";
		html += "								<label for=\"SadService\">No<\/label>";
		html += "							<\/div>";
		html += "							";
		html += "						<\/li>";
		html += "						<li class=\"hidden\" id=\"HappynessAlert\">";
		html += "							<div class=\"alert alert-success\">";
		html += "								<strong>Te invitamos<\/strong> a que envíes tu queja o sugerencia a nuestro <strong>correo electrónico<\/strong>.";
		html += "							<\/div>";
		html += "						<\/li>";
		html += "						<li><i class=\"fa fa-leaf\"><\/i> ¿Es tratado correctamente por nuestros empleados?<\/li>";
		html += "						<li>";
		html += "							<div class=\"radio-custom radio-success\">";
		html += "								<input type=\"radio\" id=\"GoodService\" name=\"GoodService\" required value=\"1\">";
		html += "								<label for=\"GoodService\">Si<\/label>";
		html += "							<\/div>";
		html += "							<div class=\"radio-custom radio-danger\">";
		html += "								<input type=\"radio\" id=\"BadService\" name=\"GoodService\">";
		html += "								<label for=\"BadService\">No<\/label>";
		html += "							<\/div>";
		html += "						<\/li>";
		html += "						<li><i class=\"fa fa-leaf\"><\/i> ¿Se adapta a su economía nuestros precios y promociones?<\/li>";
		html += "						<li>";
		html += "							<div class=\"radio-custom radio-success\">";
		html += "								<input type=\"radio\" id=\"GoodEconomy\" name=\"Economy\" required value=\"1\">";
		html += "								<label for=\"GoodEconomy\">Si<\/label>";
		html += "							<\/div>";
		html += "							<div class=\"radio-custom radio-danger\">";
		html += "								<input type=\"radio\" id=\"BadEconomy\" name=\"Economy\">";
		html += "								<label for=\"BadEconomy\">No<\/label>";
		html += "							<\/div>";
		html += "						<\/li>";
		html += "						<li><i class=\"fa fa-leaf\"><\/i> ¿Asiste a nuestras conferencias y talleres?<\/li>";
		html += "						<li>";
		html += "							<div class=\"radio-custom radio-success\">";
		html += "								<input type=\"radio\" id=\"Conferences\" name=\"Conferences\" required value=\"1\">";
		html += "								<label for=\"Conferences\">Si<\/label>";
		html += "							<\/div>";
		html += "							<div class=\"radio-custom radio-danger\">";
		html += "								<input type=\"radio\" id=\"NoConferences\" name=\"Conferences\">";
		html += "								<label for=\"NoConferences\">No<\/label>";
		html += "							<\/div>";
		html += "						<\/li>";
		html += "						<li class=\"hidden\" id=\"ConferencesAlert\">";
		html += "							<div class=\"alert alert-success\">";
		html += "								<strong>Gracias<\/strong> por decidir cuidar a nuestro planeta.<\/strong>.";
		html += "							<\/div>";
		html += "						<\/li>";
		html += "						<li><i class=\"fa fa-leaf\"><\/i> ¿En qué aspecto cree usted nuestra empresa puede mejorar?<\/li>";
		html += "						<textarea placeholder=\"Abrir los domingos\" class=\"form-control\" rows=\"3\" name=\"Comments\"><\/textarea>";
		html += "";
		html += "					<\/ul>";
		html += "			<\/div>";
		html += "		<\/form>";
		html += "	<\/div>";
		html += "<\/div>";

	app.Sammy.swap(html, function () {
		app.Init()
		app.SetActiveButton('#surveybutton')
    })
}

app.Render.Trees = function(){
}

app.Render.Coupons = function(){
}


app.Render.Home = function(){
	console.log("rendering home")
	var treesRequest = app.Services.Get.Trees()
	$.when(treesRequest).done(function(trees){
	})

	var html="";
		html += "<div class=\"container\">";
		html += "	<div class=\"row\">";
		html += "		<div class=\"col-md-12 center\">";
		html += "			<h2 class=\"word-rotator-title mb-sm\">Eco Wash es el car wash <strong>mas <span class=\"word-rotate\" data-plugin-options='{\"delay\": 2000, \"animDelay\": 300}'>";
		html += "				<span class=\"word-rotate-items\">";
		html += "					<span>popular<\/span>";
		html += "					<span>ecológico<\/span>";
		html += "					<span>increíble<\/span>";
		html += "				<\/span>";
		html += "			<\/span><\/strong> de Hermosillo.<\/h2>";
		html += "			<p class=\"lead\">Cuidando el medio ambiente, a la vez<br>que generamos empleo en la ciudad.<\/p>";
		html += "		<\/div>";
		html += "	<\/div>";
		html += "";
		html += "	<div class=\"row mt-xl\">";
		html += "		<div class=\"counters counters-text-dark\">";
		html += "			<div class=\"col-md-4 col-sm-6\">";
		html += "				<div class=\"counter appear-animation\" data-appear-animation=\"fadeInUp\" data-appear-animation-delay=\"300\">";
		html += "					<i class=\"fa fa-user\"><\/i>";
		html += "					<strong data-to=\"3\" >0<\/strong>";
		html += "					<label>Arboles<\/label>";
		html += "					<p class=\"text-color-primary mb-xl\">liberando óxigeno<\/p>";
		html += "				<\/div>";
		html += "			<\/div>";
		html += "			<div class=\"col-md-4 col-sm-6\">";
		html += "				<div class=\"counter appear-animation\" data-appear-animation=\"fadeInUp\" data-appear-animation-delay=\"600\">";
		html += "					<i class=\"fa fa-desktop\"><\/i>";
		html += "					<strong data-to=\"12\" data-append=\"%\">0<\/strong>";
		html += "					<label>De tu consumo de óxigeno<\/label>";
		html += "					<p class=\"text-color-primary mb-xl\">diario es lo que liberan tus arboles<\/p>";
		html += "				<\/div>";
		html += "			<\/div>";
		html += "			<div class=\"col-md-4 col-sm-6\">";
		html += "				<div class=\"counter appear-animation\" data-appear-animation=\"fadeInUp\" data-appear-animation-delay=\"900\">";
		html += "					<i class=\"fa fa-ticket\"><\/i>";
		html += "					<strong data-to=\"5\">0<\/strong>";
		html += "					<i class=\"appear-animation fa fa-leaf fa-fw\" data-appear-animation=\"fadeInUp\" data-appear-animation-delay=\"1100\" style='font-size:13px; display:inline-block'></i>";
		html += "					<i class=\"appear-animation fa fa-leaf fa-fw\" data-appear-animation=\"fadeInUp\" data-appear-animation-delay=\"1300\" style='font-size:13px; display:inline-block'></i>";
		html += "					<i class=\"appear-animation fa fa-leaf fa-fw\" data-appear-animation=\"fadeInUp\" data-appear-animation-delay=\"1500\" style='font-size:13px; display:inline-block'></i>";
		html += "					<i class=\"appear-animation fa fa-leaf fa-fw\" data-appear-animation=\"fadeInUp\" data-appear-animation-delay=\"1700\" style='font-size:13px; display:inline-block'></i>";
		html += "					<i class=\"appear-animation fa fa-leaf fa-fw\" data-appear-animation=\"fadeInUp\" data-appear-animation-delay=\"1900\" style='font-size:13px; display:inline-block'></i>";
		html += "					<label>EcoSellos<\/label>";
		html += "					<p class=\"text-color-primary mb-xl\">para el siguiente arbol<\/p>";
		html += "";
		html += "				<\/div>";
		html += "			<\/div>";
		html += "		<\/div>";
		html += "	<\/div>";
		html += "";
		html += "<\/div>";

		app.Sammy.swap(html, function () {
			app.Init()
			app.SetActiveButton('#homebutton')		
		})
}

app.Render.Login = function(){
	var html="";
		html += "<div class=\"container\">";
		html += "	<div class=\"row\">";
		html += "		<div class=\"col-md-12\">";
		html += "			<div class=\"featured-boxes\">";
		html += "				<div class=\"row\">";
		html += "					<div class=\"col-sm-6\">";
		html += "						<div class=\"featured-box featured-box-primary align-left mt-xlg\">";
		html += "							<div class=\"box-content\">";
		html += "								<h4 class=\"heading-primary text-uppercase mb-md\">Iniciar sesión<\/h4>";
		html += "								<form action=\"\/\" id=\"login-form\" method=\"post\">";
		html += "									<div class=\"row\">";
		html += "										<div class=\"form-group\">";
		html += "											<div class=\"col-md-12\">";
		html += "												<label>Nombre de usuario o correo<\/label>";
		html += "												<input type=\"text\" value=\"\" class=\"form-control input-lg\" name=\"Email\">";
		html += "											<\/div>";
		html += "										<\/div>";
		html += "									<\/div>";
		html += "									<div class=\"row\">";
		html += "										<div class=\"form-group\">";
		html += "											<div class=\"col-md-12\">";
		html += "												<label>Contraseña<\/label>";
		html += "												<input type=\"password\" value=\"\" class=\"form-control input-lg\" name=\"Password\">";
		html += "											<\/div>";
		html += "										<\/div>";
		html += "									<\/div>";
		html += "									<div class=\"row\">";
		html += "										<div class=\"col-md-12\">";
		html += "											<input type=\"submit\" value=\"Login\" class=\"btn btn-primary pull-right mb-xl\" data-loading-text=\"Cargando...\">";
		html += "										<\/div>";
		html += "									<\/div>";
		html += "								<\/form>";
		html += "							<\/div>";
		html += "						<\/div>";
		html += "					<\/div>";
		html += "					<div class=\"col-sm-6\">";
		html += "						<div class=\"featured-box featured-box-primary align-left mt-xlg\">";
		html += "							<div class=\"box-content\">";
		html += "								<h4 class=\"heading-primary text-uppercase mb-md\">Registrate<\/h4>";
		html += "								<form id=\"signup-form\">";
		html += "									<div class=\"row\">";
		html += "										<div class=\"form-group\">";
		html += "											<div class=\"col-md-12\">";
		html += "												<label>E-mail<\/label>";
		html += "												<input type=\"email\" value=\"\" class=\"form-control input-lg\" name=\"Email\" required>";
		html += "											<\/div>";
		html += "										<\/div>";
		html += "									<\/div>";
		html += "									<div class=\"row\">";
		html += "										<div class=\"form-group\">";
		html += "											<div class=\"col-md-12\">";
		html += "												<label>Nombre<\/label>";
		html += "												<input type=\"text\" value=\"\" class=\"form-control input-lg\" name=\"Name\" required>";
		html += "											<\/div>";
		html += "										<\/div>";
		html += "									<\/div>";
		html += "									<div class=\"row\">";
		html += "										<div class=\"form-group\">";
		html += "											<div class=\"col-md-6\">";
		html += "												<label>Apellido paterno<\/label>";
		html += "												<input type=\"text\" value=\"\" class=\"form-control input-lg\" name=\"FirstLastName\" required>";
		html += "											<\/div>";
		html += "											<div class=\"col-md-6\">";
		html += "												<label>Apellido materno<\/label>";
		html += "												<input type=\"text\" value=\"\" class=\"form-control input-lg\" name=\"SecondLastName\" required>";
		html += "											<\/div>";
		html += "										<\/div>";
		html += "									<\/div>";
		html += "									<div class=\"row\">";
		html += "										<div class=\"form-group\">";
		html += "											<div class=\"col-md-6\">";
		html += "												<label>Password<\/label>";
		html += "												<input type=\"password\" value=\"\" class=\"form-control input-lg\" name=\"Password\" required>";
		html += "											<\/div>";
		html += "											<div class=\"col-md-6\">";
		html += "												<label>Re-enter Password<\/label>";
		html += "												<input type=\"password\" value=\"\" class=\"form-control input-lg\" id=\"ConfirmPassword\" required>";
		html += "											<\/div>";
		html += "										<\/div>";
		html += "									<\/div>";
		html += "									<div class=\"row\">";
		html += "										<div class=\"col-md-12\">";
		html += "											<input type=\"submit\" value=\"Registrar\" class=\"btn btn-primary pull-right mb-xl\" data-loading-text=\"Loading...\">";
		html += "										<\/div>";
		html += "									<\/div>";
		html += "								<\/form>";
		html += "							<\/div>";
		html += "						<\/div>";
		html += "					<\/div>";
		html += "				<\/div>";
		html += "			<\/div>";
		html += "		<\/div>";
		html += "	<\/div>";
		html += "<\/div>";

	app.Sammy.swap(html, function () {
    })
}



// Event handlers
// Login & Register
$(document.body).on('submit', '#login-form', function (event) {
    event.preventDefault();
    app.Services.Post.Login($(this).serializeObject());
})

$(document.body).on('submit', '#signup-form', function (event) {
    event.preventDefault();
    console.log('will register')
    var form = $(this).serializeObject()
    var pass = form.Password
    var confirmPass = $('#ConfirmPassword').val()
    console.log(pass)
    console.log(confirmPass)

    if (pass !== confirmPass){
    	alert('Las contraseñas deben ser diferentes.')
    	return
    }
    app.Services.Post.Register(form);
})

// Home

// Trees

// Surveys
// $(document.body).on('click', '#send-survey', function (e) {
// 	$('#survey-form').trigger('submit')
// })

$(document).on('submit', '#survey-form', function (e) {
	e.preventDefault()
	console.log('submited')
	var form = $(this).serializeObject()
	app.Services.Post.PostSurvey(form)
	return
});

$(document).on('click', '#SadService', function(){
	console.log('you are sad?')
	$('#HappynessAlert').removeClass('hidden')
})

$(document).on('click', '#HappyService', function(){
	console.log('you are happy?')
	$('#HappynessAlert').addClass('hidden')
})

$(document).on('click', '#Conferences', function(){
	console.log('you are sad?')
	$('#ConferencesAlert').removeClass('hidden')
})

$(document).on('click', '#NoConferences', function(){
	console.log('you are happy?')
	$('#ConferencesAlert').addClass('hidden')
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