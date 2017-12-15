<?php
/**
 * Created by PhpStorm.
 * User: mfuon
 * Date: 12/14/2017
 * Time: 4:42 PM
 */

include '../configs/Connection.php';


class NewProperty
{


    public function createProperty()
    {
        // Check connection
        $con = new Connection();
        $con = $con->connect();
        if ($con === false) {

            die("ERROR: Check Database Connection. ");

        }

        $property_name = $_REQUEST['propertyName'];
        echo $property_name;

// Prepare an insert statement

        $sql = "INSERT INTO properties (property_name,manager,location, otherInfo,unit_type,number_of_units,created_on,updated_on)
 VALUES (?,?,?,?,?,?,?,?)";


        if ($stmt = $con->prepare($sql)) {

            // Bind variables to the prepared statement as parameters

            $otherInfo = '';
            $location = '';
            $init_type = '';
            $number_of_units = '';
            $created_on = '';
            $updated_on = '';

            $stmt->bind_param("sssssiss",$property_name,$manager,$location,$otherInfo,$init_type,$number_of_units,$created_on,$updated_on);


            // Set parameters

            $property_name = $_REQUEST['propertyName'];

            $manager = $_REQUEST['manager'];

            $location = $_REQUEST['propertyLocality'];

            $otherInfo = $_REQUEST['details'];

            $init_type = $_REQUEST['unitType'];

            $number_of_units = $_REQUEST['numberOfUnits'];

            $created_on = $this->convertDate(new DateTime());

            $updated_on = $this->convertDate(new DateTime());

            // Attempt to execute the prepared statement

            if ($stmt->execute()) {

                echo "<script>alert('Awesome')</script>";

            } else {

                echo "ERROR: Could not execute query: $sql. " . $con->error;

            }

        } else {

            echo "ERROR: Could not prepare query: $sql. " . $con->error;

        }


// Close statement

        $stmt->close();


// Close connection

        $con->close();


    }

    function convertDate($appliedDate){

        return $appliedDate->format('Y-m-d H:i:s');
    }
    
    function renameFolder($oldName,$newName){
        chmod($oldName, 0775);
        rename($oldName,'../../uploaded/'.$newName);
    }


}

$property = new NewProperty();

$property -> renameFolder("../../uploaded/temp",$_REQUEST['propertyName']);

$property -> createProperty();
