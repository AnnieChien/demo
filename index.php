<?php
/*
  +------------------------------------------------------------------------+
  | PhalconEye CMS                                                         |
  +------------------------------------------------------------------------+
  | Copyright (c) 2013-2014 PhalconEye Team (http://phalconeye.com/)       |
  +------------------------------------------------------------------------+
  | This source file is subject to the New BSD License that is bundled     |
  | with this package in the file LICENSE.txt.                             |
  |                                                                        |
  | If you did not receive a copy of the license and are unable to         |
  | obtain it through the world-wide-web, please send an email             |
  | to license@phalconeye.com so we can send you a copy immediately.       |
  +------------------------------------------------------------------------+
  | Author: Ivan Vorontsov <ivan.vorontsov@phalconeye.com>                 |
  +------------------------------------------------------------------------+
*/

/**
 * Stages.
 */
define('APPLICATION_STAGE_DEVELOPMENT', 'development');
define('APPLICATION_STAGE_PRODUCTION', 'production');
define('APPLICATION_STAGE', (getenv('PHALCONEYE_STAGE') ? getenv('PHALCONEYE_STAGE') : APPLICATION_STAGE_PRODUCTION));

if (APPLICATION_STAGE == APPLICATION_STAGE_DEVELOPMENT) {
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
}

/**
 * Versions.
 */
define('PHALCONEYE_VERSION', '0.4.1');
define('PHALCON_VERSION_REQUIRED', '1.3.1');
define('PHP_VERSION_REQUIRED', '5.4.14');

/**
 * Check phalcon framework installation.
 */
if (!extension_loaded('phalcon')) {
    printf('Install Phalcon framework %s', PHALCON_VERSION_REQUIRED);
    exit(1);
}

/**
 * Pathes.
 */
define('DS', DIRECTORY_SEPARATOR);
if (!defined('ROOT_PATH')) {
    define('ROOT_PATH', dirname(dirname(__FILE__)));
}
if (!defined('PUBLIC_PATH')) {
    define('PUBLIC_PATH', dirname(__FILE__));
}

require_once ROOT_PATH . "/app/engine/Config.php";
require_once ROOT_PATH . "/app/engine/Exception.php";
require_once ROOT_PATH . "/app/engine/ApplicationInitialization.php";
require_once ROOT_PATH . "/app/engine/Application.php";

if (php_sapi_name() !== 'cli') {
    $application = new Engine\Application();
} else {
    $optArgs = array();
    $options = array();
    $regex = '/^-(-?)([a-zA-z0-9_]*)=(.*)/';
    foreach ($argv as $key => $argument) {
        //echo("$key => $argument \n");
        if (preg_match($regex, $argument, $matches)) {
            if ($matches[1] == "-") {
                $optArgs[trim($matches[2])] = trim($matches[3]);
            } else {
                $options[trim($matches[2])] = trim($matches[3]);
            }
        }
    }
    if(!preg_match('/index.php$/', $argv[0])||  !key_exists('mode', $options)|| !in_array($options['mode'], array('cli','websocket'))){
        print 'You must choice either mode websocket or cli. Please try again!';die;
    }
    else{
        if($options['mode']=='cli'){
            require_once ROOT_PATH . "/app/engine/Cli.php";
            $application = new Engine\Cli();
        }
        else if($options['mode']=='websocket'){
            if (!isSet($options["host"]) || !isSet($options["port"])||!isset($options['key'])) {
                echo "You must use the following command: \nphp index.php.php -mode=websocket -host=HOST_IP -port=HOST_PORT -key=HOST_KEY\n\n";
                exit(0);
            }
            else{
                require_once ROOT_PATH.'/app/websocket/wsserver.php';
                // Start server
                $server = new FramedWSServer($options['host'],$options['port'],$options['key']);
                $server->run();
            }
        }
    }
}
if(!empty($application)){
    $application->run();
    echo $application->getOutput();
}

