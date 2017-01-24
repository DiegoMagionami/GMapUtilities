<?php

class DB {

    private $host;
    private $db_connection;
    private $database;
    private $username;
    private $password;

    public function __construct()
    {
        $db = array();

        require_once dirname(__DIR__) . '/config.php';

        $this->host = $db['hostname'];
        $this->db_connection = $db['db_connection'];
        $this->database = $db['database'];
        $this->username = $db['username'];
        $this->password = $db['password'];
    }

    public function connect()
    {
        $connection_string = $this->db_connection . ':host=' . $this->host . ';dbname=' . $this->database;
        try
        {
            $db = new PDO($connection_string, $this->username, $this->password);
            var_dump($db);
        } catch (PDOException $e) {
            echo 'Connection failed: ' . $e->getMessage();
        }

        return $db;
    }
}