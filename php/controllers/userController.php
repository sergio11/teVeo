<?php

class userController extends baseController{
    
    /* Método para filtrar Usuarios*/
    public function searchUsers($idUser,$filter,$limit,$exclusions){

        $fields = array('NAME','LOCATION');
        $field = strtoupper($filter['field']);

        if(strtoupper($field) && in_array($field,$fields)){
            //Decodificamos el patrón.
            $value = $filter['pattern'];
            //Construimos la query.
            $query = 'SELECT id,foto,name,ubicacion FROM USUARIOS_VIEW U ';

            if ($field === 'NAME') {
                $query .= "WHERE UPPER(name) LIKE UPPER(:value)";
            }elseif($field === 'LOCATION'){
                $query .= "WHERE UPPER(ubicacion) LIKE UPPER(:value)";
            }

            $query .= " AND id != :idUser";
            //Validamos las exclusiones.
            if (is_array($exclusions) && sizeof($exclusions)) {
                $query .= " AND id NOT IN (".join(",",$exclusions).")";
            }
            //Condición común.
            $query .= "  AND NOT EXISTS(
                    SELECT * FROM CONTACTOS C WHERE C.idRepresentado = U.id  AND C.idUsuario = :idUser
                )";

            //Validamos el Limit
            if (is_int($limit['start']) && is_int($limit['count'])) {
               $query .= " LIMIT {$limit['start']},{$limit['count']}";
            }

            $sql = $this->conn->prepare($query);
            //Ejecutamos la sentencia.
            $sql->execute(array("idUser"=> $idUser,"value" => "%$value%")); 
            //Extraemos los usuarios.
            $usuarios = $sql->fetchAll(PDO::FETCH_ASSOC);

            return array(
                "response_message" => array(
                    "type" => "RESPONSE",
                    "name" => "RESULT_OF_SEARCH",
                    "data" => array(
                        "error" => false,
                        "msg" => $usuarios
                    )
                )
            );
        
        }
        
    }

    public function existsUser($email){
        $sql = $this->conn->prepare('SELECT id FROM USUARIOS WHERE email = :email');
        $sql->execute(array("email" => $email));
        if ($sql->rowCount() > 0) {
            $id = $sql->fetch(PDO::FETCH_ASSOC);
            $msg = array(
                "exists" => true,
                "id" => $id 
            );
            
        }else{
            $msg = array(
                "exists" => false,
                "id" => null 
            );
        }

        return array(
            "response_message" => array(
                "type" => "RESPONSE",
                "name" => "CHECK_EXISTS_USER",
                "data" => array(
                    "error" => false,
                    "msg" =>$msg
                )
            )
        );
        
    }

    
    /*Método para obtener todos los detalles de un usuario*/
    public function getUserDetails($id){
     
        $sql = $this->conn->prepare('SELECT id,foto,name,edad,sexo,ubicacion FROM USUARIOS_VIEW WHERE id = :id');
        $sql->execute(array("id" => $id));
        $usuario = $sql->fetch(PDO::FETCH_ASSOC);
        return array(
            "response_message" => array("type" => "RESPONSE","name" => "USER_DETAILS","data" => array("error" => false,"msg" =>$usuario))
        );
        
    }
    //Devuelve la información del usuario conectado.
    public function getUserConnectedData($idUser){
        //Obtenemos datos del usuario.
        $sql = $this->conn->prepare('SELECT id,foto,name,ubicacion FROM USUARIOS_VIEW WHERE id = :idUsuario');
        $sql->execute(array(":idUsuario" => $idUser));
        $user = $sql->fetch(PDO::FETCH_ASSOC);
        $response = array(
            "response_message" => array(
                "type" => "RESPONSE",
                "name" => "USER_CONNECTED_DATA_FINDED",
                "data" => array(
                    "error" => false,
                    "msg" =>$user
                )
            ),
            "task_before_send_data" => $user
        );
        return $response;
    
    }
    
    public function closeConnection($idUser){
        
        //Obtenemos datos del usuario.
        $sql = $this->conn->prepare('SELECT id,foto,name FROM USUARIOS_VIEW WHERE id = :idUsuario');
        $sql->execute(array(":idUsuario" => $idUser));
        $user = $sql->fetch(PDO::FETCH_ASSOC);
        //Obtenemos los contactos del usuario.
        $sql = $this->conn->prepare('SELECT idRepresentado FROM contactos_view WHERE idUsuario = :idUsuario');
        $sql->execute(array(":idUsuario" => $user["id"]));
        $contactos = $sql->fetchAll(PDO::FETCH_ASSOC);
        $targets = [];
        for($i = 0; $i < sizeof($contactos); $i++){
            array_push($targets,array(
                "id" => $contactos[$i]["idRepresentado"],
                "data" => $user
            ));
        }
        
        return array(
            "response_message" => array("type" => "RESPONSE","name" => "DESTROY_SESSION_SUCCESFULL","data" => array("error" => false,"msg" =>null)),
            "event_message" => array("type" => "EVENT","name" => "USER_DISCONNECTED","targets" => $targets),
            "task_before_send_data" => $user
        );
    
    }
    
    


}