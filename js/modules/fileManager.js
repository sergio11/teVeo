var FileManager = (function(_super,$,environment){

	__extends(FileManager, _super);

    const DEFAULT_TITLE = "Eliga los archivos a adjuntar";

    var reader;

	function FileManager(){

        //crea instancias de un objeto FileReader.
        reader = new FileReader();
		//Reporting the module events.
        this.events = {
            "FILE_SELECTED":[]
        }
	}



    //Previsualiza el archivo seleccionado.
    var showPreviewFile = function(file){
        templating.loadTemplate({
            name:"file_preview",
            category:"OVERLAY_MODULE_VIEW",
            handlers:{
                onBeforeShow:function(view){
                    view.getView("fileInfo").updateChilds([
                        {size:file.size},
                        {fileName:file.name},
                        {type:file.type}
                    ]);
                },
                onAfterShow:function(view){

                    reader.readAsBinaryString(file);

                    reader.addEventListener("load",function(e) {
                        var data = e.target.result;
                        console.log("Este es el resultado ...");
                        console.log(data);
                        /*view.getView("previewFile").createView(null,{
                            handlers:{
                                onCreate:function(view){
                                    view.get().attr('src',);
                                }
                            }
                        });*/
                    });
                    
                }
            }
        });
    }


	var onCreateRequestFile = function(options){

        var view = this;
        view.setChildValue("title",options.title || DEFAULT_TITLE);

		view.get().delegate("[data-action]","click",function(e){
            e.preventDefault();
            e.stopPropagation();
            //recogemos la acción.
            var action = this.dataset.action.toUpperCase();
            switch(action){
                case 'CLOSE':
                    //Ocultamos la vista eliminándola.
                    view.hide(false);
                    break;
            }
        });

        var dropzone = view.getView("dropzone");

        dropzone.get().on('dragleave',function(e){
            console.log("Ha salido del dropzone");
        });
        
        dropzone.get().on('dragover', function(e){
            e.stopPropagation();
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = 'copy'
            console.log("Estás sobre el dropzone");
            // // Explicitly show this is a copy.
        });

        //Manejador para el envío de archivos.
        //Común para archivos seleccionados tradicionalmente
        // o a través de una operación Drag and Drop.
        dropzone.get().on("drop",function(e){
            e.stopPropagation();
            e.preventDefault();
            console.log("Has soltado sobre el dropzone");
            var file = null;
            //Comprobamos el tipo del evento.
            if(e.type == "change"){
                //usuario selecciona el archivo por el método tradicional.
                file = e.target.files[0];
            }else if(e.type == "drop"){
                //paramos la animación
                //$(this).removeClass("flash");
                //usuario selecciona el archivo arrastrándolo directamente.
                file = e.originalEvent.dataTransfer.files[0]; 
            }
            //Previsualizamos el fichero.
            showPreviewFile(file);
        });



	}

	FileManager.prototype.requestFile = function(options) {
		templating.loadTemplate({
            name:"request_file",
            category:"OVERLAY_MODULE_VIEW",
            handlers:{
            	onCreate:function(view){
                    onCreateRequestFile.apply(view,[options]);
                }
            }
        });
	};

	return FileManager;

})(Component,jQuery,environment);