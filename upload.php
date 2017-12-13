<?php
if (isset($_POST['submit'])) {
    if (count($_FILES['upload']['name']) > 0) {
        //Loop through each file
        for ($i = 0; $i < count($_FILES['upload']['name']); $i++) {
            //Get the temp file path
            $tmpFilePath = $_FILES['upload']['tmp_name'][$i];

            //Make sure we have a filepath
            if ($tmpFilePath != "") {

                //save the filename
                $property = "YEYEYE";
                $shortname = $_FILES['upload']['name'][$i];

                if (!file_exists("uploaded/" . $property)) {
                    mkdir("uploaded/" . $property, 0775, true);
                }

                //save the url and the file
                $filePath = "uploaded/" . $property . "/" . date('d-m-Y-H-i-s') . '-' . $_FILES['upload']['name'][$i];
                $path = "uploaded/".$property."/";
                //Upload the file into the temp dir
                try {
                    if (move_uploaded_file($tmpFilePath, $filePath)) {

                        $files[] = $shortname;
                        //insert into db
                        //use $shortname for the filename
                        //use $filePath for the relative url to the file
                    }
                } catch (Exception $e) {
                    echo " ==== " . $e;
                }

            }
        }
    }

//show success message
    echo "<h1>Uploaded:</h1>";
    if (is_array($files)) {
        echo "<ul>";
        foreach ($files as $file) {
            echo "<li>$path$file</li>";
            $getPath = $path.$file;

            echo '<img src="'.$getPath.'">';
        }
        echo "</ul>";
    }
}
?>

<form action="" enctype="multipart/form-data" method="post">

    <div>
        <label for='upload'>Add Attachments:</label>
        <input id='upload' name="upload[]" type="file" multiple="multiple"/>
    </div>

    <p><input type="submit" name="submit" value="Submit"></p>

</form>