'use strict'

var fs = require('fs');
var path = require('path');
var Evolution = require ('../models/evolution');
var Level = require('../models/level');
var GLOBAL = require ('../services/global');

/**
 * Obtener evolución a partir de id
 * @returns evolution: evolución asociada al id
 */
function getEvolution (req, res){
    var evolutionId = req.params.id;

    Evolution.findById(evolutionId).exec((err,evolution)=>{
        if (err){
            res.status(500).send({message: 'Error en el servidor'});
        }else{
            if(!evolution){
                res.status(404).send({message: 'No existe la evolución'}); 
            }else{
                
                //Verificar que el usuario logueado tiene permisos de acceso a dicha evolución
                Evolution.findById(req.user.level.evolution).exec((err,evolutionUser)=>{
                    if(err){
                        res.status(500).send({message: 'Error en el servidor'});
                    }else{
                        if(!evolutionUser){
                            res.status(404).send({message: 'No existe la evolución asociada al usuario'}); 
                        }else{
                            if(evolutionUser.order>=evolution.order){
                                res.status(200).send({evolution});
                            }else{
                                res.status(401).send({message:"Sin permisos de acceso a la evolución"});
                            }                            
                        }
                    }
                });                
            }
        }
    });

}

/**
 * Obtener todas las evoluciones
 * @returns evolutions: Evoluciones registradas en el sistema
 */
function getEvolutions (req,res){

    Evolution.find({}).sort('order').exec((err,evolutions) => {
        if (err){
            res.status(500).send({message: 'Error en el servidor'});
        }else{
            if(!evolutions){
                res.status(404).send({message: 'No hay evoluciones'}); 
            }else{                                                                         
                res.status(200).send({evolutions});
            }
        }
    });

}

/**
 * Obtener el número de niveles de la evolución indicada
 * @returns count: Número de niveles
 */
function getNumLevels (req, res){
    var evolutionId = req.params.id;

    Level.find({evolution:evolutionId, active:1}).count((err,count) => {
        if (err){
            res.status(500).send({message: 'Error en el servidor'});
        }else{
            if(!count){
                count = 0;
            }
            res.status(200).send({count});
        }
    });
}

/**
 * Registrar nueva evolución en BBDD
 * @returns evolution: Evolución creada
 */
function addEvolution (req, res){
    var evolution = new Evolution();
    var params = req.body; //Recogemos los datos que llegan por POST

    evolution.order = params.order;
    evolution.name = params.name;
    evolution.description = params.description;    
    evolution.image = '';
    
    if (evolution.order && evolution.name){
        evolution.save((err,evolutionAdd) => {
            if(err){
                res.status(500).send({message:'Error al guardar evolución'});
            }else{
                if(!evolutionAdd){
                    res.status(404).send({message:'Evolución no registrada'});
                }else{
                    res.status(200).send({evolution: evolutionAdd});
                }
            }
        });
    }else{
        res.status(200).send({message:'Rellena los campos obligatorios'});
    }
}

/**
 * Actualizar evolución
 * @returns evolution: Evolución antes de la actualización
 */
function updateEvolution (req,res){
    var evolId = req.params.id;
    var update = req.body;     

    Evolution.findByIdAndUpdate(evolId,update,(err,evolUpdate) => {
        if (err){
            console.log(err);
            res.status(500).send({message:'Error al actualizar la evolución'}); 
        }else{
            if(!evolUpdate){
                res.status(404).send({message: 'No se ha podido actualizar la evolución'});
            }else{
                res.status(200).send({evolution:evolUpdate});
            }
        }
    })
}

/**
 * Subir imágen de la evolución
 * @returns image: Nombre de la imagen. Evolutión: Evolución antes de la actualización
 */
function uploadIEvolution (req,res){
    var evolId = req.params.id;
    var type = req.params.type;
    var file_name = 'No subido...';
    var field;

    if (req.files.image){
        var file_path = req.files.image.path;
        var file_name = file_path.split('\/')[2];
        var ext = file_name.split('\.')[1];

        switch (type){
            case "0":
                field = {image: file_name};
                break;
            case "1":
                field = {image_small: file_name};
                break;
            case "2":
                field = {image_origin: file_name};
                break;
            default:
                return res.status(404).send({message: 'Tipo de imagen desconocida'});
        }

        

        if (ext=='png' || ext=='jpg' || ext=='gif' || ext=='jpeg'){
            Evolution.findByIdAndUpdate(evolId, field, (err,evolUpdate) => {
                if (err){
                    console.log(err);
                    res.status(500).send({message:'Error al actualizar la imagen de la evolución'}); 
                }else{
                    if(!evolUpdate){
                        res.status(404).send({message: 'No se ha podido actualizar la imagen de la evolución'});
                    }else{
                        res.status(200).send({image:file_name, evolution:evolUpdate});
                    }
                }
            });
        }else{
            res.status(200).send({message:'Extensión del archivo no valida (.png .jpg .gif .jpeg)'});
        }        
    }else{
        res.status(200).send({message:'Imagen no subida'});
    }
}

/**
 * Cargar imagen de evolución
 * @return imagen de evolución
 */
function loadIEvolution (req,res){

    //Obtener parametros
    var imageFile = req.params.imageFile;
    var path_file;

    if (!imageFile){
        var evolutionId = req.params.id;
        var type = req.params.type;

        Evolution.findById(evolutionId).exec((err,evolution)=>{            
            if (err){
                res.status(500).send({message: 'Error en el servidor'});
            }else{
                if(!evolution){
                    res.status(404).send({message: 'No existe la evolución'}); 
                }else{        
                    switch(type) {
                        case "0":
                            imageFile = evolution.image;
                            break;
                        case "1":
                            imageFile = evolution.image_small;
                            break;
                        case "2":
                            imageFile = evolution.image_origin;
                            break;
                        default:
                            return res.status(404).send({message: 'Tipo de imagen desconocido'}); 
                    }
                    path_file = GLOBAL.PATH_FILE_EVOLUTION + imageFile;
                    fs.exists(path_file, (exists) => {
                        if(exists){
                            res.sendFile(path.resolve(path_file));
                        }else{
                            res.status(404).send({message:'La imagen no existe'}); 
                        }
                    });                  
                }
            }
        });
    }else{
        path_file = GLOBAL.PATH_FILE_EVOLUTION + imageFile;
        fs.exists(path_file, (exists) => {
            if(exists){
                res.sendFile(path.resolve(path_file));
            }else{
                res.status(404).send({message:'La imagen no existe'}); 
            }
        });
    }

    
}

module.exports = {
    getEvolution,
    getEvolutions,
    getNumLevels,
    addEvolution,
    updateEvolution,
    uploadIEvolution,        
    loadIEvolution
};