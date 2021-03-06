var Metro = (function(_super,$,environment){

	__extends(Metro, _super);

	var templating;
	var serviceLocator;
	var self;

	function Metro(movieDB,conversation,weather){
		self = this;
		this.movieDB = movieDB;
		this.conversation = conversation;
		this.weather = weather;
		templating = environment.getService("TEMPLATE_MANAGER");
		serviceLocator = environment.getService("SERVICE_LOCATOR");
	}


	var getPoster = function(element){
		var poster = null
		if (element.posters && $.isArray(element.posters)) {
			//Obtenemos el primer poster no nulo.
			for (var i = 0; i < element.posters.length; i++) {
				if (element.posters[i].src) {
					poster = element.posters[i].src;
					break;
				};
			};
		}else if(element.poster){
			poster = element.poster;
		}

		return poster;
	}


	//Método para obtener el contenido de cada tile.
	var getTileContent = function(config){

		if ($.isPlainObject(config) && !$.isEmptyObject(config)) {

			var name = config.name && config.name.toUpperCase();
			var service = null;

			switch(name){

				case 'POPULARMOVIES':
					service = self.movieDB.getMoviesThumbnails;
					break;
				case 'POPULARTVSERIES':
					service = self.movieDB.getPopularTVSeries;
					break;
				case 'GENERALNEWS':
					service = serviceLocator.getGeneralNewsToday;
					break;
				case 'SPORTNEWS':
					service = serviceLocator.getLatestSportsNews;
					break;
				case 'TECHNOLOGYNEWS':
					service = serviceLocator.getLatestTechnologyNews;
					break;
				case 'VIDEOGAMENEWS':
					service = serviceLocator.getLatestVideoGamesNews;
					break;
				case 'LASTMESSAGES':
					service = self.conversation.getPendingMessagesThumbnails;
					break;

			}

			service && service(config.count).done(function(data){
				if (data && data.length) {
					typeof(config.onSuccess) == "function" && config.onSuccess(data);
					//Configuramos el timer de actualización.
					if (config.update) {
						var lastDate = data[0].date;
						setInterval(function(){
							service(config.count,lastDate).done(function(data){
								
								if (data && data.length) {
									console.log("DATA OBTENIDA");
									console.log(data);
									lastDate = data[0].date;
									typeof(config.onUpdated) == "function" && config.onUpdated(data);
								}
							});
						},150000);
					};
					
				}else{
					typeof(config.onError) == "function" && config.onError();
				}
			});

		};


	}

	var onCreate = function(view){

		view.get().delegate("[data-action]","click",function(e){
			e.preventDefault();
			var action = this.dataset.action.toUpperCase();
			try{
				switch(action){
					case 'SHOW_NEW_MESSAGES':
						self.conversation.showPendingMessages();
						break;
				}

			}catch(e){
				
			}
			
		});


		self.weather.getCurrentCondition().done(function(condition){

			var tileWeather = view.getView("tileWeather");
			tileWeather.createView("weather",{
				location:condition.getCity(),
				date:condition.getTime('LL'),
				foreground:condition.getForeground(),
				sky:condition.getSkyBackgroundImage(),
				summary:condition.getSummary(),
				temperature:condition.getTemperature()
			});

		});
		//Temperatura.
		//condition.getTemperature();
	
		/*
		 * GET HOURLY CONDITIONS FOR TODAY
		 */
		/*var conditions_today = forecast.getForecastToday(latitude, longitude);


		var items = '';
	
		for(i=0; i<conditions_today.length; i++) {
			items += "<li>"  + conditions_today[i].getTime('HH:mm') + ': ' + conditions_today[i].getTemperature() + "</li>";
		}
	
		document.getElementById("itemList").innerHTML = items;*/
	
		/*
		 * GET DAILY CONDITIONS FOR NEXT 7 DAYS
		 */
	
		/*var conditions_week = forecast.getForecastWeek(latitude, longitude);
		var items2 = '';
	
		for(i=0; i<conditions_week.length; i++) {
			items2 += "<li>"  + conditions_week[i].getTime('YYYY-MM-DD') + ': ' + conditions_week[i].getMaxTemperature() + "</li>";
		}
	
		document.getElementById("itemList2").innerHTML = items2;	*/

		var tiles = {

			LAST_MESSAGES:{
				name:"lastmessages",
				action:"show_new_messages",
				size:"tile-wide",
				colors:"fg-white bg-lighterBlue",
				icon:"mif-bubbles",
				count:2,
				update:false
			},
			POPULAR_MOVIES:{
				name:"popularmovies",
				size:"tile-large",
				colors:"fg-white bg-darkCyan",
				icon:"mif-film",
				count:2,
				update:false
			},
			POPULAR_TV_SERIES:{
				name:"populartvseries",
				size:"tile-large",
				colors:"fg-white bg-darkEmerald",
				icon:"mif-display",
				count:2,
				update:false
			},
			GENERAL_NEWS:{
				name:"generalNews",
				size:"tile-wide",
				colors:"fg-white bg-magenta",
				icon:"mif-pencil",
				count:2,
				update:true
			},
			SPORT_NEWS:{
				name:"sportNews",
				size:"tile-wide",
				colors:"fg-white bg-darkViolet",
				icon:"mif-trophy",
				count:2,
				update:true
			},
			TECHNOLOGY_NEWS:{
				name:"technologynews",
				size:"tile-wide",
				colors:"fg-white bg-lightOlive",
				icon:"mif-phonelink",
				count:2,
				update:true
			},
			VIDEO_GAME_NEWS:{
				name:"videogamenews",
				size:"tile-wide",
				colors:"fg-white bg-amber",
				icon:"mif-gamepad",
				count:2,
				update:true
			}
		}
		

		for (var tile in tiles) 

			(function(tile){

				view.createView("tileNews",{
					name:tile.name
				},{

					handlers:{
						onCreate:function(view){
							var tileContent;
							//Obtenemos el contenido para el tile.
							getTileContent({
								name:tile.name,
								count:tile.count,
								update:tile.update,
								onSuccess:function(data){
									//Configuramos el tamaño del tile.
									view.get().addClass(tile.size);
									tile.action && view.get().attr("data-action",tile.action);
									tileContent = view.getView("tileContent");
									for(var j = 0; j < data.length; j++){
										var element = data[j];
										var title = typeof(element.title) == "object" ? element.title[0] : element.title;
										var poster = getPoster(element);
										tileContent.createView("news",{
											background:tile.colors,
											poster:poster,
											icon:tile.icon,
											title:title
										});
									}
								},
								onUpdated:function(data){
									//Actualizamos el contenido.
									data = data.map(function(element){
										return {
											title:element.title[0],
											poster:getPoster(element)
										}
									});
									tileContent.updateChilds(data);
								},
								onError:function(){

								}
							});
						}
					},
					animations:{
						animationIn:"zoomInUp",
						animationOut:"zoomOutDown"
					}
				});

			})(tiles[tile]);

	}



	Metro.prototype.showApps = function() {
		templating.loadTemplate({
            name:"metro",
            category:"MODULE_VIEWS",
          	handlers:{
                onCreate:onCreate
            }
        }).done(function(){

        });
	};

	return Metro;

})(Component,jQuery,environment);