$(document).ready(() => {

    progress();
    assignColor();
    assignColorDiagram();
    headerEffect();

});

    
    function progress(){
        
        console.log("Funcion progress ejecutada.");

        $('.dial').knob({
            'min':0,
            'max':100,
            'width':250,
            'height':250,
            'displayInput':true,
           'fgColor':"#e74c3c",
            'release':function(v) {$("p").text(v);},
            'readOnly':true
        });

    }

    function assignColor(){

        console.log("Funcion assignColor ejecutada.");

        $("td").each(function(index,element){

            var estado = $(this).text().trim();

            if( estado == 'Alta'){
                    $(this).addClass('alta'); 
            }else if( estado == 'Media'){
                    $(this).addClass('media');
            }else if( estado == 'Baja'){
                    $(this).addClass('verde');
            }else if( estado == 'Por Iniciar'){
                    $(this).addClass('iniciar');
            }else if( estado == 'En Proceso'){
                    $(this).addClass('proceso');
            }else if( estado == 'Estancado'){
                    $(this).addClass('estancado');
            }else if( estado == 'Terminado'){
                    $(this).addClass('terminado');
            } 
                    
        });

    }

      function assignColorDiagram(){

        console.log("Funcion assignColorDiagram ejecutada.");

        $('.edit').each(function(index,element){

            if($(this).text().trim().length == '0'){
                    $(this).parent().remove();
            }

            $('td:contains(Por Iniciar)').addClass('iniciar');
            $('td:contains(Por Iniciar)').addClass('edit');

            $('td:contains(En Proceso)').addClass('proceso');
            $('td:contains(En Proceso)').addClass('edit');

            $('td:contains(Estancado)').addClass('estancado');
            $('td:contains(Estancado)').addClass('edit');

            $('td:contains(Terminado)').addClass('terminado');
            $('td:contains(Terminado)').addClass('edit');
         
        });

    }

    function headerEffect(){

        console.log("Funcion headerEffect ejecutada.");

        $('.header h1').css({
                opacity: 0,
                marginTop: 0,
                marginBottom: 0
        });
            
        $('.header h1').animate({
                opacity: 1,
                marginTop: '10px',
                marginBottom: '10px'
        },2000);
            
    }

