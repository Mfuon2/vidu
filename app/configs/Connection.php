<?php
/**
 * Created by PhpStorm.
 * User: mfuon
 * Date: 12/14/2017
 * Time: 4:44 PM
 */

class Connection
{

    private $host;
    private $db;
    private $username;
    private $password;


    /**
     *
     */
    public function connect()
    {

        $this->setDb("vidu");
        $this->setHost("localhost");
        $this->setUsername("root");
        $this->setPassword("");

        $conn = new mysqli($this->getHost(),$this->getUsername(),$this->getPassword(),$this->getDb());

        if($conn)
            return $conn;
        else
            die("Error".$conn->connect_error);

    }

    /**
     * @return string
     */
    public function getHost()
    {
        return $this->host;
    }

    /**
     * @param string $host
     */
    public function setHost($host)
    {
        $this->host = $host;
    }

    /**
     * @return string
     */
    public function getDb()
    {
        return $this->db;
    }

    /**
     * @param string $db
     */
    public function setDb($db)
    {
        $this->db = $db;
    }

    /**
     * @return string
     */
    public function getUsername()
    {
        return $this->username;
    }

    /**
     * @param string $username
     */
    public function setUsername($username)
    {
        $this->username = $username;
    }

    /**
     * @return string
     */
    public function getPassword()
    {
        return $this->password;
    }

    /**
     * @param string $password
     */
    public function setPassword($password)
    {
        $this->password = $password;
    }


}
$con = new Connection();